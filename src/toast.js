let listeners = [];

export function toast(message) {
  listeners.forEach((fn) => fn(message));
}

export function subscribeToast(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((f) => f !== fn);
  };
}
