import { serviceClient, sendToUsers } from "../_shared/webpush.ts";

// 야간 유지보수 루틴 전용 시크릿(CRON_SECRET과 별개) — 이 값을 아는 쪽만 조회/기록 가능.
const MAINTENANCE_BOT_SECRET = Deno.env.get("MAINTENANCE_BOT_SECRET")!;
// 알림을 받을 계정(chigi430@gmail.com == 창환 프로필) — 커플 전체가 아니라 이 계정 하나로 한정.
const MAINTENANCE_OWNER_USER_ID = Deno.env.get("MAINTENANCE_OWNER_USER_ID")!;
// [배포] 버튼이 PR을 머지할 때 쓰는, couple-diary 저장소 전용 GitHub 토큰.
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
const GITHUB_REPO = "chigi430/couple-diary";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// 야간 루틴 전용: 열린 제보 + 서버 상태 지표 조회
async function handleList() {
  const supabase = serviceClient();
  const { data: openReports, error } = await supabase.from("bug_reports").select("*").eq("status", "open");
  if (error) return json({ error: error.message }, 500);
  const { data: health, error: healthErr } = await supabase.rpc("maintenance_health");
  if (healthErr) return json({ error: healthErr.message }, 500);
  return json({ open_reports: openReports, health });
}

// 야간 루틴 전용: 제보 판단/조치 결과 기록
async function handleUpdateReport(body: any) {
  const { report_id, status, resolution_note, fix_branch, fix_pr_url } = body;
  if (!report_id || !status) return json({ error: "report_id, status required" }, 400);
  const supabase = serviceClient();
  const patch: Record<string, unknown> = { status, resolution_note: resolution_note ?? null };
  if (fix_branch) patch.fix_branch = fix_branch;
  if (fix_pr_url) patch.fix_pr_url = fix_pr_url;
  if (status === "fixed" || status === "wontfix") patch.resolved_at = new Date().toISOString();
  const { error } = await supabase.from("bug_reports").update(patch).eq("id", report_id);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
}

// 야간 루틴 전용: 점검 결과 요약을 창환님 계정에만 웹푸시로 발송
async function handleNotify(body: any) {
  const { message } = body;
  if (!message) return json({ error: "message required" }, 400);
  if (!MAINTENANCE_OWNER_USER_ID) return json({ error: "MAINTENANCE_OWNER_USER_ID not configured" }, 500);
  await sendToUsers([MAINTENANCE_OWNER_USER_ID], { title: "유지보수 점검", body: message, url: "/" });
  return json({ ok: true });
}

// 앱의 [배포] 버튼 전용: 로그인한 사용자 본인 확인 후 준비된 PR을 머지
async function handleDeploy(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return json({ error: "unauthorized" }, 401);

  const supabase = serviceClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);

  // 배포 실행은 유지보수 담당(창환님) 계정만 — 커플 상대방은 UI에서도 안 보이지만,
  // 엔드포인트를 직접 호출할 가능성까지 막기 위해 서버에서도 확인한다.
  if (userData.user.id !== MAINTENANCE_OWNER_USER_ID) return json({ error: "forbidden" }, 403);

  const { report_id } = await req.json();
  if (!report_id) return json({ error: "report_id required" }, 400);

  const { data: report, error: reportErr } = await supabase.from("bug_reports").select("*").eq("id", report_id).single();
  if (reportErr || !report) return json({ error: "report not found" }, 404);

  if (report.status !== "pending_deploy" || !report.fix_pr_url) {
    return json({ error: "이 제보는 아직 배포할 준비가 안 됐어요." }, 400);
  }
  if (!GITHUB_TOKEN) return json({ error: "GITHUB_TOKEN not configured" }, 500);

  const prNumberMatch = report.fix_pr_url.match(/\/pull\/(\d+)/);
  if (!prNumberMatch) return json({ error: "invalid fix_pr_url" }, 500);
  const prNumber = prNumberMatch[1];

  const mergeRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/pulls/${prNumber}/merge`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "couple-diary-maintenance-bot",
    },
    body: JSON.stringify({ merge_method: "squash" }),
  });
  const mergeJson = await mergeRes.json().catch(() => ({}));
  if (!mergeRes.ok) return json({ error: mergeJson.message || "GitHub 병합에 실패했어요." }, 502);

  const { error: updateErr } = await supabase
    .from("bug_reports")
    .update({ status: "fixed", resolved_at: new Date().toISOString() })
    .eq("id", report_id);
  if (updateErr) return json({ error: updateErr.message }, 500);

  return json({ ok: true });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const isDeploy = url.pathname.endsWith("/deploy");

  try {
    if (isDeploy) {
      return await handleDeploy(req);
    }

    // 그 외 액션은 전부 야간 루틴 전용 — cron secret으로만 인증
    const cronSecret = req.headers.get("x-cron-secret");
    if (cronSecret !== MAINTENANCE_BOT_SECRET) return json({ error: "unauthorized" }, 401);

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    switch (body.action) {
      case "update_report":
        return await handleUpdateReport(body);
      case "notify":
        return await handleNotify(body);
      case "list":
      default:
        return await handleList();
    }
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
