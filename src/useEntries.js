import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { compressImage, uuid } from "./utils";

// 커플의 모든 날짜 기록을 { "YYYY-MM-DD": entry } 형태로 관리.
export function useEntries(coupleId, userId) {
  const [byDate, setByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const byDateRef = useRef({});
  byDateRef.current = byDate;

  const fetchAll = useCallback(async () => {
    if (!coupleId) return;
    const { data, error } = await supabase
      .from("entries")
      .select("*, photos(*)")
      .eq("couple_id", coupleId)
      .order("date");
    if (!error && data) {
      const map = {};
      for (const e of data) map[e.date] = e;
      setByDate(map);
    }
    setLoading(false);
  }, [coupleId]);

  useEffect(() => {
    fetchAll();
    if (!coupleId) return;
    // 상대가 올린 변화가 내 화면에 바로 반영되도록 실시간 구독
    const ch = supabase
      .channel(`couple-${coupleId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "entries", filter: `couple_id=eq.${coupleId}` }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "photos", filter: `couple_id=eq.${coupleId}` }, fetchAll)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [coupleId, fetchAll]);

  // 날짜 기록 확보 (있으면 그 id, 없으면 새로 만들어 id 반환)
  const ensureEntry = useCallback(
    async (date) => {
      const existing = byDateRef.current[date];
      if (existing && existing.id) return existing.id;

      // 1) 이미 그 날짜 기록이 있는지 조회
      const { data: found, error: selErr } = await supabase
        .from("entries")
        .select("id")
        .eq("couple_id", coupleId)
        .eq("date", date)
        .maybeSingle();
      if (selErr) throw selErr;
      if (found) return found.id;

      // 2) 없으면 새로 생성
      const { data: created, error: insErr } = await supabase
        .from("entries")
        .insert({ couple_id: coupleId, date })
        .select("id")
        .single();
      if (insErr) throw insErr;
      return created.id;
    },
    [coupleId]
  );

  // 필드 저장 (기분/일정/장소/먹은것/메모/스탬프)
  const saveEntry = useCallback(
    async (date, patch) => {
      const row = { couple_id: coupleId, date, ...patch, updated_at: new Date().toISOString() };
      const { data, error } = await supabase
        .from("entries")
        .upsert(row, { onConflict: "couple_id,date" })
        .select("*, photos(*)")
        .single();
      if (!error && data) {
        setByDate((prev) => ({ ...prev, [date]: { ...data, photos: data.photos || prev[date]?.photos || [] } }));
      }
      return { data, error };
    },
    [coupleId]
  );

  // 사진 업로드 (압축 → storage 업로드 → photos 행 추가)
  const uploadPhotos = useCallback(
    async (date, fileList) => {
      const entryId = await ensureEntry(date);
      const files = Array.from(fileList || []);
      let failCount = 0;
      for (const file of files) {
        const { blob, ext } = await compressImage(file);
        const path = `${coupleId}/${entryId}/${uuid()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("photos")
          .upload(path, blob, {
            contentType: blob.type || "image/jpeg",
            upsert: false,
            cacheControl: "31536000", // 사진은 안 바뀌므로 1년 — 서명 URL(7일) 동안 브라우저가 재다운로드 안 함
          });
        if (upErr) {
          console.error("사진 업로드 실패:", upErr.message);
          failCount++;
          continue;
        }
        const { error: insErr } = await supabase.from("photos").insert({
          entry_id: entryId,
          couple_id: coupleId,
          storage_path: path,
          uploaded_by: userId,
        });
        if (insErr) {
          console.error("사진 기록 실패:", insErr.message);
          failCount++;
        }
      }
      await fetchAll();
      if (failCount > 0) throw new Error(`사진 ${failCount}장을 올리지 못했어요.`);
    },
    [coupleId, userId, ensureEntry, fetchAll]
  );

  const deletePhoto = useCallback(
    async (photo) => {
      const { error: rmErr } = await supabase.storage.from("photos").remove([photo.storage_path]);
      const { error: delErr } = await supabase.from("photos").delete().eq("id", photo.id);
      await fetchAll();
      if (rmErr || delErr) throw new Error((rmErr || delErr).message);
    },
    [fetchAll]
  );

  // 그날의 기록(오늘의 우리) 통째로 삭제 — 잘못된 날짜에 등록했을 때 등.
  // photos 행은 entries FK(on delete cascade)로 같이 지워지므로 스토리지 파일만 먼저 정리한다.
  const deleteEntry = useCallback(
    async (date) => {
      const entry = byDateRef.current[date];
      if (!entry?.id) return;
      const paths = (entry.photos || []).map((p) => p.storage_path).filter(Boolean);
      if (paths.length) await supabase.storage.from("photos").remove(paths);
      const { error } = await supabase.from("entries").delete().eq("id", entry.id).eq("couple_id", coupleId);
      if (error) throw error;
      setByDate((prev) => {
        const next = { ...prev };
        delete next[date];
        return next;
      });
      await fetchAll();
    },
    [coupleId, fetchAll]
  );

  return { byDate, loading, saveEntry, uploadPhotos, deletePhoto, deleteEntry };
}
