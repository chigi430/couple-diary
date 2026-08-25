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
    const { data: members } = await supabase.from("profiles").select("id").eq("couple_id", couple.id);
    const memberIds = (members ?? []).map((m) => m.id);
    if (memberIds.length === 0) continue;

    // 기념일 / D-day
    if (couple.anniversary_date) {
      const ann = new Date(couple.anniversary_date + "T00:00:00Z");
      const daysSince = daysBetween(ann, today) + 1;
      const years = today.getUTCFullYear() - ann.getUTCFullYear();
      const isYearly = ann.getUTCMonth() === today.getUTCMonth() && ann.getUTCDate() === today.getUTCDate() && years > 0;

      const messages: string[] = [];
      if (isYearly) messages.push(`오늘은 사귄 지 ${years}주년이에요! 🎉`);
      if (daysSince > 0 && daysSince % 100 === 0) messages.push(`오늘로 사귄 지 ${daysSince}일이에요! 🎉`);

      if (messages.length) {
        await sendToUsers(memberIds, { title: "기념일 알림", body: messages.join(" · "), url: "/" });
        summary[couple.id] = [...(summary[couple.id] || []), "anniversary"];
      }
    }

    // 오늘 아직 기록 안 함 리마인더
    const { data: entry } = await supabase
      .from("entries")
      .select("note")
      .eq("couple_id", couple.id)
      .eq("date", todayStr)
      .maybeSingle();
    const hasNote = !!entry?.note && entry.note.trim().length > 0;
    if (!hasNote) {
      await sendToUsers(memberIds, {
        title: "오늘의 우리",
        body: "아직 오늘 기록을 안 남겼어요 📝 하루를 마무리하며 짧게라도 남겨보세요.",
        url: "/",
      });
      summary[couple.id] = [...(summary[couple.id] || []), "reminder"];
    }
  }

  return new Response(JSON.stringify({ ok: true, notified: summary }), {
    headers: { "Content-Type": "application/json" },
  });
});
