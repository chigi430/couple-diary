import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { compressImage, uuid } from "./utils";

export function useBugReports(coupleId) {
  const [reports, setReports] = useState([]);

  const fetchAll = useCallback(async () => {
    if (!coupleId) return;
    const { data, error } = await supabase
      .from("bug_reports")
      .select("*")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: false });
    if (!error && data) setReports(data);
  }, [coupleId]);

  useEffect(() => {
    fetchAll();
    if (!coupleId) return;
    const ch = supabase
      .channel(`bug-reports-${coupleId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bug_reports", filter: `couple_id=eq.${coupleId}` }, fetchAll)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [coupleId, fetchAll]);

  const addReport = useCallback(
    async (description, photoFile, userId) => {
      let photo_path = null;
      if (photoFile) {
        const { blob, ext } = await compressImage(photoFile);
        const path = `${coupleId}/bugreports/${uuid()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("photos")
          .upload(path, blob, { contentType: blob.type || "image/jpeg", upsert: false });
        if (upErr) return { error: upErr };
        photo_path = path;
      }
      const { error } = await supabase
        .from("bug_reports")
        .insert({ couple_id: coupleId, reported_by: userId, description, photo_path });
      if (!error) await fetchAll();
      return { error };
    },
    [coupleId, fetchAll]
  );

  // 배포 승인은 Edge Function(maintenance-bot deploy 액션)이 실제 병합을 수행한 뒤
  // 성공 응답을 받으면 그 결과로 status를 갱신한다 — 여기선 그 호출만 담당.
  const deployReport = useCallback(async (reportId) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maintenance-bot/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ report_id: reportId }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { error: json.error || "배포에 실패했어요." };
    await fetchAll();
    return { error: null };
  }, [fetchAll]);

  return { reports, addReport, deployReport };
}
