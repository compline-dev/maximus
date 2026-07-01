import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export function useHomeContent() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    api.homeContent({ signal: ctrl.signal })
      .then(setContent)
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  return content;
}
