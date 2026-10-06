import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// 받은 알림 내역 (헤더 🔔). 기록은 서버(Edge Function sendToUsers)가 하고, 여기선 조회·읽음·삭제만.
export function useNotifications(userId) {
  const [items, setItems] = useState([]);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) setItems(data);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }
    fetchAll();
    const ch = supabase
      .channel(`notifications-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, fetchAll)
      .subscribe();
    // 백그라운드에 있는 동안 realtime 이 끊겼을 수 있으니 포그라운드 복귀 때 다시 읽는다
    const onVisible = () => document.visibilityState === "visible" && fetchAll();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      supabase.removeChannel(ch);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, fetchAll]);

  const unreadCount = items.filter((n) => !n.read_at).length;

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    const { error } = await supabase.from("notifications").update({ read_at: now }).eq("user_id", userId).is("read_at", null);
    if (error) console.error("알림 읽음 처리 실패:", error);
  }, [userId]);

  const clearAll = useCallback(async () => {
    if (!userId) return { error: null };
    const { error } = await supabase.from("notifications").delete().eq("user_id", userId);
    if (!error) setItems([]);
    return { error };
  }, [userId]);

  return { items, unreadCount, markAllRead, clearAll };
}
