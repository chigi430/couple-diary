import { sendToUsers, serviceClient } from "../_shared/webpush.ts";

const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

Deno.serve(async (req) => {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = serviceClient();
  const todayStr = new Date().toISOString().slice(0, 10);
  const today = new Date(todayStr + "T00:00:00Z");

  const { data: couples, error } = await supabase.from("couples").select("id, anniversary_date");
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const summary: Record<string, string[]> = {};

  for (const couple of couples ?? []) {
    const { data: members } = await supabase
      .from("profiles")
      .select("id, notify_reminder, notify_anniversary")
      .eq("couple_id", couple.id);
    const allIds = (members ?? []).map((m) => m.id);
    if (allIds.length === 0) continue;

    // 기념일 / D-day (notify_anniversary 켠 사람에게만)
    if (couple.anniversary_date) {
      const ann = new Date(couple.anniversary_date + "T00:00:00Z");
      const daysSince = daysBetween(ann, today) + 1;
      const years = today.getUTCFullYear() - ann.getUTCFullYear();
      const isYearly = ann.getUTCMonth() === today.getUTCMonth() && ann.getUTCDate() === today.getUTCDate() && years > 0;

      const messages: string[] = [];
      if (isYearly) messages.push(`오늘은 사귄 지 ${years}주년이에요! 🎉`);
      if (daysSince > 0 && daysSince % 100 === 0) messages.push(`오늘로 사귄 지 ${daysSince}일이에요! 🎉`);

      if (messages.length) {
        const ids = (members ?? []).filter((m) => m.notify_anniversary !== false).map((m) => m.id);
        if (ids.length) await sendToUsers(ids, { title: "기념일 알림", body: messages.join(" · "), url: "/" });
        summary[couple.id] = [...(summary[couple.id] || []), "anniversary"];
      }
    }

    // 연말 리캡 알림 (12월 1일, 토글 없이 항상 발송)
    if (today.getUTCMonth() === 11 && today.getUTCDate() === 1) {
      await sendToUsers(allIds, {
        title: "올해의 리캡이 준비됐어요 🎉",
        body: "우리가 함께한 한 해를 돌아봐요",
        url: "/?recap=1",
      });
      summary[couple.id] = [...(summary[couple.id] || []), "recap"];
    }

    // 오늘 아직 기록 안 함 리마인더 (notify_reminder 켠 사람에게만)
    const { data: entry } = await supabase
      .from("entries")
      .select("note")
      .eq("couple_id", couple.id)
      .eq("date", todayStr)
      .maybeSingle();
    const hasNote = !!entry?.note && entry.note.trim().length > 0;
    if (!hasNote) {
      const ids = (members ?? []).filter((m) => m.notify_reminder !== false).map((m) => m.id);
      if (ids.length) {
        await sendToUsers(ids, {
          title: "오늘의 우리",
          body: "아직 오늘 기록을 안 남겼어요 📝 하루를 마무리하며 짧게라도 남겨보세요.",
          url: "/",
        });
      }
      summary[couple.id] = [...(summary[couple.id] || []), "reminder"];
    }
  }

  return new Response(JSON.stringify({ ok: true, notified: summary }), {
    headers: { "Content-Type": "application/json" },
  });
});
