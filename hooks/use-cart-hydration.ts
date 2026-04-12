"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

export function useCartHydration() {
  const hydrated = useCartStore((state) => state.hydrated);

  useEffect(() => {
    if (!useCartStore.persist.hasHydrated()) {
      void useCartStore.persist.rehydrate();
    } else if (!hydrated) {
      useCartStore.setState({ hydrated: true });
    }

    const unsubscribe = useCartStore.persist.onFinishHydration(() => {
      useCartStore.setState({ hydrated: true });
    });

    return () => {
      unsubscribe();
    };
  }, [hydrated]);

  return hydrated;
}
