import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// 커플의 일정을 기간(start_date~end_date) 단위 flat 배열로 관리.
export function useSchedules(coupleId) {
  const [list, setList] = useState([]);

  const fetchAll = useCallback(async () => {
    if (!coupleId) return;
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("couple_id", coupleId)
      .order("start_date");
    if (!error && data) setList(data);
  }, [coupleId]);

  useEffect(() => {
    fetchAll();
    if (!coupleId) return;
    const ch = supabase
      .channel(`schedules-${coupleId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "schedules", filter: `couple_id=eq.${coupleId}` }, fetchAll)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [coupleId, fetchAll]);

  // 그 날짜가 [start_date, end_date] 범위에 포함되는 일정들
  const byDate = useCallback(
    (dateStr) => list.filter((s) => s.start_date <= dateStr && dateStr <= s.end_date),
    [list]
  );

  const addSchedule = useCallback(
    async ({ userId, startDate, endDate, allDay, startTime, endTime, title }) => {
      const { error } = await supabase.from("schedules").insert({
        couple_id: coupleId,
        user_id: userId,
        start_date: startDate,
        end_date: endDate || startDate,
        all_day: allDay,
        start_time: allDay ? null : startTime || null,
        end_time: allDay ? null : endTime || null,
        title,
      });
      if (!error) await fetchAll();
      return { error };
    },
    [coupleId, fetchAll]
  );

  const updateSchedule = useCallback(
    async (id, { startDate, endDate, allDay, startTime, endTime, title }) => {
      const { error } = await supabase
        .from("schedules")
        .update({
          start_date: startDate,
          end_date: endDate || startDate,
          all_day: allDay,
          start_time: allDay ? null : startTime || null,
          end_time: allDay ? null : endTime || null,
          title,
        })
        .eq("id", id);
      if (!error) await fetchAll();
      return { error };
    },
    [fetchAll]
  );

  const deleteSchedule = useCallback(
    async (id) => {
      await supabase.from("schedules").delete().eq("id", id);
      await fetchAll();
    },
    [fetchAll]
  );

  return { schedules: list, byDate, addSchedule, updateSchedule, deleteSchedule };
}
