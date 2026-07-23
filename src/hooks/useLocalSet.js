import { useState, useCallback } from 'react';

function readSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  } catch {
    return new Set();
  }
}

export default function useLocalSet(key) {
  const [set, setSet] = useState(() => readSet(key));

  const toggle = useCallback(
    (id) => {
      setSet((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        try {
          localStorage.setItem(key, JSON.stringify([...next]));
        } catch {
          /* ignore quota errors */
        }
        return next;
      });
    },
    [key]
  );

  return [set, toggle];
}
