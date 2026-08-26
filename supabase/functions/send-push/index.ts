import { sendToUsers } from "../_shared/webpush.ts";

const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

// 이 함수는 DB 트리거(pg_net)에서 cron secret으로만 호출돼야 함.
// 과거 클라이언트 "테스트 알림" 버튼용으로 로그인 유저 JWT도 허용했었는데,
// user_ids를 호출자 본인과 무관하게 아무 값이나 넘길 수 있어 임의 유저에게 알림을 보낼 수 있는 취약점이었음.
// 그 버튼은 제거됐고 클라이언트에서 이 함수를 직접 부르는 곳이 없어 cron secret 검증만 남김.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const cronSecret = req.headers.get("x-cron-secret");
    if (cronSecret !== CRON_SECRET) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_ids, title, body, url } = await req.json();
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(JSON.stringify({ error: "user_ids required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await sendToUsers(user_ids, { title, body, url });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
