import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export function serviceClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

export async function sendToUsers(userIds: string[], payload: { title: string; body: string; url: string }) {
  const supabase = serviceClient();
  const { data: subs, error } = await supabase.from("push_subscriptions").select("*").in("user_id", userIds);
  if (error) throw error;

  const results = await Promise.all(
    (subs || []).map(async (sub) => {
      const host = (() => {
        try {
          return new URL(sub.endpoint).host;
        } catch {
          return "?";
        }
      })();
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          JSON.stringify(payload)
        );
        return { user_id: sub.user_id, host, ok: true };
      } catch (err) {
        const statusCode = err?.statusCode ?? null;
        const bodyText = typeof err?.body === "string" ? err.body.slice(0, 200) : String(err).slice(0, 200);
        console.error("webpush failed", { host, statusCode, body: bodyText });
        let pruned = false;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          pruned = true;
        }
        return { user_id: sub.user_id, host, ok: false, statusCode, error: bodyText, pruned };
      }
    })
  );

  return results;
}
