"use client";

import { useSyncExternalStore, useState, useMemo, useCallback, useRef } from "react";
import {
  deserializeDraft,
  saveDraftToStorage,
  removeDraftFromStorage,
} from "@/lib/form-drafts";

export interface UseFormDraftOptions {
  debounceMs?: number;
  enabled?: boolean;
}

const emptySubscribe = () => () => {};

export function useFormDraft<T extends Record<string, unknown>>(
  key: string | null,
  initialValues: T,
  options?: UseFormDraftOptions,
) {
  const debounceMs = options?.debounceMs ?? 500;
  const enabled = options?.enabled ?? true;

  const [overrides, setOverrides] = useState<Partial<T>>({});
  const [isDiscarded, setIsDiscarded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // useSyncExternalStore safely reads localStorage on the client without SSR hydration mismatches
  const rawDraft = useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === "undefined" || !key || !enabled) return null;
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );

  const restoredDraft = useMemo(() => {
    if (isDiscarded || !rawDraft) return null;
    return deserializeDraft<T>(rawDraft);
  }, [isDiscarded, rawDraft]);

  const isRestored = Boolean(restoredDraft);

  const values = useMemo<T>(() => {
    return {
      ...initialValues,
      ...(isDiscarded ? {} : restoredDraft),
      ...overrides,
    };
  }, [initialValues, isDiscarded, restoredDraft, overrides]);

  const setValue = useCallback(
    <K extends keyof T>(field: K, val: T[K]) => {
      setOverrides((prev) => {
        const next = { ...prev, [field]: val };
        const merged: T = {
          ...initialValues,
          ...(isDiscarded ? {} : restoredDraft),
          ...next,
        };
        if (key && enabled) {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            saveDraftToStorage(key, merged);
          }, debounceMs);
        }
        return next;
      });
    },
    [debounceMs, enabled, initialValues, isDiscarded, key, restoredDraft],
  );

  const setValues = useCallback(
    (newValues: Partial<T> | ((prev: T) => T)) => {
      setOverrides((prev) => {
        const currentMerged: T = {
          ...initialValues,
          ...(isDiscarded ? {} : restoredDraft),
          ...prev,
        };
        const nextPartial =
          typeof newValues === "function" ? newValues(currentMerged) : newValues;
        const next = { ...prev, ...nextPartial };
        const merged: T = { ...currentMerged, ...nextPartial };

        if (key && enabled) {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            saveDraftToStorage(key, merged);
          }, debounceMs);
        }
        return next;
      });
    },
    [debounceMs, enabled, initialValues, isDiscarded, key, restoredDraft],
  );

  const clearDraft = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (key) {
      removeDraftFromStorage(key);
    }
    setIsDiscarded(true);
    setOverrides({});
  }, [key]);

  const discardDraft = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (key) {
      removeDraftFromStorage(key);
    }
    setIsDiscarded(true);
    setOverrides({});
  }, [key]);

  return {
    values,
    setValue,
    setValues,
    isRestored,
    clearDraft,
    discardDraft,
  };
}
