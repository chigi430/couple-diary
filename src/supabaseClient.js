import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

if (!url || !key) {
  // .env 를 안 만들었거나 값이 비어 있으면 여기서 알려줍니다.
  console.error("VITE_SUPABASE_URL / VITE_SUPABASE_KEY 가 비어 있습니다. .env 를 확인하세요.");
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});
