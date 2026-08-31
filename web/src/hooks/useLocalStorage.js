import { useCallback, useEffect, useState } from 'react';

/**
 * Persist a piece of UI state per browser.
 *
 * Every read and write is guarded: private windows, cleared site data and
 * storage-blocking browsers all throw on access, and a draft reflection is not
 * worth crashing a page over.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialValue : JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — state still works for this session */
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset];
}

export default useLocalStorage;
