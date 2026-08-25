import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useBucketList(coupleId) {
  const [items, setItems] = useState([]);

  const fetchAll = useCallback(async () => {
    if (!coupleId) return;
    const { data, error } = await supabase
      .from("bucket_items")
      .select("*")
      .eq("couple_id", coupleId)
      .order("created_at");
    if (!error && data) setItems(data);
  }, [coupleId]);

  useEffect(() => {
    fetchAll();
    if (!coupleId) return;
    const ch = supabase
      .channel(`bucket-${coupleId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bucket_items", filter: `couple_id=eq.${coupleId}` }, fetchAll)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [coupleId, fetchAll]);

  const addItem = useCallback(
    async (title, userId) => {
      const { error } = await supabase.from("bucket_items").insert({ couple_id: coupleId, title, created_by: userId });
      if (!error) await fetchAll();
      return { error };
    },
    [coupleId, fetchAll]
  );

  const toggleItem = useCallback(
    async (id, done, userId) => {
      const { error } = await supabase
        .from("bucket_items")
        .update({ done, done_by: done ? userId : null, done_at: done ? new Date().toISOString() : null })
        .eq("id", id);
      if (!error) await fetchAll();
      return { error };
    },
    [fetchAll]
  );

  const deleteItem = useCallback(
    async (id) => {
      await supabase.from("bucket_items").delete().eq("id", id);
      await fetchAll();
    },
    [fetchAll]
  );

  return { items, addItem, toggleItem, deleteItem };
}
