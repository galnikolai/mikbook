const PENDING_KEY = "__mikbookSubscribePending";

type SubscribeWindow = Window & {
  [PENDING_KEY]?: boolean;
};

/** Opens the global SubscribeWidget panel (listens for this event). */
export function openSubscribeWidget() {
  if (typeof window === "undefined") return;
  const w = window as SubscribeWindow;
  w[PENDING_KEY] = true;
  window.dispatchEvent(new Event("mikbook:subscribe"));
}

export function consumeSubscribePending() {
  if (typeof window === "undefined") return false;
  const w = window as SubscribeWindow;
  if (!w[PENDING_KEY]) return false;
  w[PENDING_KEY] = false;
  return true;
}
