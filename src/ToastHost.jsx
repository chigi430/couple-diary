import React, { useEffect, useRef, useState } from "react";
import { S } from "./styles";
import { subscribeToast } from "./toast";

export default function ToastHost() {
  const [msg, setMsg] = useState(null);
  const [id, setId] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return subscribeToast((m) => {
      setMsg(m);
      setId((n) => n + 1);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setMsg(null), 2200);
    });
  }, []);

  if (!msg) return null;
  return (
    <div key={id} style={S.toast}>
      {msg}
    </div>
  );
}
