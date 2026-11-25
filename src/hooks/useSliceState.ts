import { useState, useCallback, useMemo } from 'react';
import type { SliceInsets } from '../types';
import { MIN_INSET } from '../constants';

interface SliceStateResult {
  insets: SliceInsets;
  setHInset: (value: number) => void;
  setVInset: (value: number) => void;
  maxH: number;
  maxV: number;
}

export function useSliceState(
  imageWidth: number,
  imageHeight: number,
): SliceStateResult {
  const maxH = Math.floor(imageWidth / 2);
  const maxV = Math.floor(imageHeight / 2);

  const [hInset, setHInsetRaw] = useState(() => Math.round(imageWidth * 0.25));
  const [vInset, setVInsetRaw] = useState(() => Math.round(imageHeight * 0.25));
  const [sizedFor, setSizedFor] = useState({ w: imageWidth, h: imageHeight });

  if (sizedFor.w !== imageWidth || sizedFor.h !== imageHeight) {
    setSizedFor({ w: imageWidth, h: imageHeight });
    setHInsetRaw(Math.min(maxH, Math.round(imageWidth * 0.25)));
    setVInsetRaw(Math.min(maxV, Math.round(imageHeight * 0.25)));
  }

  const setHInset = useCallback(
    (value: number) => {
      setHInsetRaw(Math.max(MIN_INSET, Math.min(maxH, Math.round(value))));
    },
    [maxH],
  );

  const setVInset = useCallback(
    (value: number) => {
      setVInsetRaw(Math.max(MIN_INSET, Math.min(maxV, Math.round(value))));
    },
    [maxV],
  );

  const insets = useMemo(() => ({ hInset, vInset }), [hInset, vInset]);

  return { insets, setHInset, setVInset, maxH, maxV };
}
