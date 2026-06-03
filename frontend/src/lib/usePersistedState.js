import { useEffect, useRef, useState } from "react";

/**
 * usePersistedState — drop-in replacement for useState that mirrors the value
 * to localStorage. Falls back gracefully when storage is unavailable (private
 * browsing, SSR, sandboxed iframes).
 *
 * @param {string} key   Storage key (namespace yourself, e.g. "shieldpay:foo")
 * @param {*} initial    Initial value used when no persisted value exists
 */
export function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw == null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  });

  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch {
      /* storage quota / privacy mode — silently drop */
    }
  }, [value]);

  const clear = () => {
    try {
      window.localStorage.removeItem(keyRef.current);
    } catch {
      /* ignore */
    }
    setValue(initial);
  };

  return [value, setValue, clear];
}
