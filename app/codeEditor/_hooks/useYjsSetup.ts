"use client";

import { useEffect, useState } from "react";
import { getPersistence } from "../_lib/yjs/ydoc";

export function useYjsSetup(): { isSynced: boolean } {
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    const persistence = getPersistence();
    if (persistence) {
      persistence.whenSynced.then(() => setIsSynced(true));
    } else {
      setIsSynced(true);
    }
  }, []);

  return { isSynced };
}
