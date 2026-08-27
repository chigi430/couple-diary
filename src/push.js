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
  return sub;
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
}
