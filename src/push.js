import { supabase } from "./supabaseClient";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function pushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

// 사용자가 이 기기에서 알림을 켰었는지를 로컬에 기억해둔다.
// (DB의 push_subscriptions 행은 푸시 서비스가 구독을 만료시키면 410 → 자동 삭제되기 때문에
//  "켠 적 있음"의 근거로 쓸 수 없음)
const WANTS_KEY = "push-enabled";
function setWantsPush(on) {
  try {
    if (on) localStorage.setItem(WANTS_KEY, "1");
    else localStorage.removeItem(WANTS_KEY);
  } catch {
    /* 프라이빗 모드 등 localStorage 불가 — 무시 */
  }
}
function wantsPush() {
  try {
    return localStorage.getItem(WANTS_KEY) === "1";
  } catch {
    return false;
  }
}

export async function isPushSubscribed() {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}

async function saveSubscription(userId, sub) {
  const json = sub.toJSON();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth_key: json.keys.auth,
      user_agent: navigator.userAgent,
    },
    { onConflict: "endpoint" }
  );
  return error;
}

export async function subscribePush(userId) {
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }
  const error = await saveSubscription(userId, sub);
  if (error) {
    // 브라우저는 구독됐는데 DB 저장은 실패한 상태로 남으면, 다음부터 토글이
    // 계속 "켜짐"으로 보이면서 실제로는 알림이 안 가는 상황이 생김 — 구독 취소해서
    // 브라우저/DB 상태를 다시 맞춰주고 사용자가 재시도할 수 있게 함.
    await sub.unsubscribe();
    throw error;
  }
  setWantsPush(true);
  return sub;
}

// 앱을 열 때마다 조용히 호출: 브라우저 구독이 살아있으면 DB 행만 최신화하고,
// 구독이 사라졌는데(만료·브라우저 정리 등) 사용자가 예전에 켰던 기기라면 다시 구독을 만든다.
// (갤럭시 등에서 배터리 최적화로 구독이 자주 만료되는 경우 대비)
export async function ensurePushHealthy(userId) {
  if (!userId || !pushSupported()) return;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (sub) {
      await saveSubscription(userId, sub);
      setWantsPush(true);
      return;
    }
    if (!wantsPush()) {
      // 로컬 플래그가 없어도(이 기능 나오기 전에 켠 사람) DB에 이 유저의 구독 행이
      // 하나라도 있으면 "켠 것"으로 보고 복구한다.
      const { count } = await supabase
        .from("push_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      if (!count) return;
    }
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    await saveSubscription(userId, sub);
  } catch (e) {
    console.warn("푸시 구독 자동 복구 실패:", e);
  }
}

// 브라우저에는 이미 구독이 있는데 DB 행이 지워졌거나(예: 만료 자동정리) 처음부터
// 저장에 실패했던 경우를 조용히 복구하기 위한 함수. 새로 구독을 만들지는 않는다.
export async function syncPushSubscription(userId) {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return false;
  const error = await saveSubscription(userId, sub);
  if (error) {
    console.error("push subscription sync failed:", error);
    return false;
  }
  return true;
}

export async function unsubscribePush() {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  setWantsPush(false);
}
