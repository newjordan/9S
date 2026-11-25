import { useMemo, useRef, useEffect, useLayoutEffect, useState } from 'react';
import type { SliceInsets, SliceRegion, SliceRegionName } from '../types';
import { getSliceRegions } from '../utils/sliceImage';

interface SlicePreviewProps {
  image: HTMLImageElement;
  insets: SliceInsets;
}

const REGION_ORDER: SliceRegionName[] = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

function RegionThumb({ image, region }: { image: HTMLImageElement; region: SliceRegion }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || region.w <= 0 || region.h <= 0) return;

    const maxSize = 64;
    const scale = Math.min(1, maxSize / region.w, maxSize / region.h);
    canvas.width = Math.max(1, Math.round(region.w * scale));
    canvas.height = Math.max(1, Math.round(region.h * scale));

    const ctx = canvas.getContext('2d')!;
    // Checkerboard
    const cs = 5;
    for (let r = 0; r * cs < canvas.height; r++) {
      for (let c = 0; c * cs < canvas.width; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#444' : '#333';
        ctx.fillRect(c * cs, r * cs, cs, cs);
      }
    }
    ctx.drawImage(
      image,
      region.x, region.y, region.w, region.h,
      0, 0, canvas.width, canvas.height,
    );
  }, [image, region]);

  if (region.w <= 0 || region.h <= 0) {
    return (
      <div className="region-thumb empty">
        <span className="region-name">{region.name}</span>
      </div>
    );
  }

  return (
    <div className="region-thumb">
      <canvas ref={canvasRef} />
      <span className="region-name">{region.name}</span>
      <span className="region-size">{region.w}x{region.h}</span>
    </div>
  );
}

const PREVIEW_PRESETS = [
  { label: '200×200', w: 200, h: 200 },
  { label: '800×600', w: 800, h: 600 },
] as const;

const MIN_PREVIEW = 80;
const MAX_PREVIEW = 1600;
const MIN_CONTENT = 32;

function readPreviewSize(value: string, fallback: number) {
  if (value.trim() === '') return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) return fallback;
  return Math.max(0, Math.min(MAX_PREVIEW, Math.round(next)));
}

export function SlicePreview({ image, insets }: SlicePreviewProps) {
  const [previewSize, setPreviewSize] = useState({ w: 640, h: 480 });
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStageWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const regions = useMemo(
    () => getSliceRegions(image.width, image.height, insets),
    [image, insets],
  );

  const regionMap = useMemo(() => {
    const map: Record<string, SliceRegion> = {};
    for (const r of regions) map[r.name] = r;
    return map;
  }, [regions]);

  // Live border-image preview
  const borderImageSrc = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    return canvas.toDataURL('image/png');
  }, [image]);

  const outerW = Math.max(MIN_PREVIEW, previewSize.w);
  const outerH = Math.max(MIN_PREVIEW, previewSize.h);
  const maxBorderH = Math.max(1, (outerW - MIN_CONTENT) / 2);
  const maxBorderV = Math.max(1, (outerH - MIN_CONTENT) / 2);
  const borderFit = Math.min(
    1,
    insets.hInset > 0 ? maxBorderH / insets.hInset : 1,
    insets.vInset > 0 ? maxBorderV / insets.vInset : 1,
  );
  const borderH = insets.hInset * borderFit;
  const borderV = insets.vInset * borderFit;
  const stageScale = stageWidth > 0 ? Math.min(1, stageWidth / outerW) : 1;
  const fitted = stageScale < 0.995;

  return (
    <div className="slice-preview">
      <h3>Live Preview</h3>
      <div className="live-preview-controls">
        <label>
          W
          <input
            type="number"
            value={previewSize.w}
            min={MIN_PREVIEW}
            max={MAX_PREVIEW}
            aria-label="Preview width"
            onChange={(e) =>
              setPreviewSize((s) => ({ ...s, w: readPreviewSize(e.target.value, s.w) }))
            }
            onBlur={() =>
              setPreviewSize((s) => ({ ...s, w: Math.max(MIN_PREVIEW, s.w) }))
            }
            className="size-input"
          />
        </label>
        <label>
          H
          <input
            type="number"
            value={previewSize.h}
            min={MIN_PREVIEW}
            max={MAX_PREVIEW}
            aria-label="Preview height"
            onChange={(e) =>
              setPreviewSize((s) => ({ ...s, h: readPreviewSize(e.target.value, s.h) }))
            }
            onBlur={() =>
              setPreviewSize((s) => ({ ...s, h: Math.max(MIN_PREVIEW, s.h) }))
            }
            className="size-input"
          />
        </label>
      </div>
      <div className="size-presets">
        {PREVIEW_PRESETS.map((preset) => {
          const active = previewSize.w === preset.w && previewSize.h === preset.h;
          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={active}
              onClick={() => setPreviewSize({ w: preset.w, h: preset.h })}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <div className="live-preview-stage" ref={stageRef}>
        <div
          className="live-preview-scale"
          style={{ width: outerW * stageScale, height: outerH * stageScale }}
        >
          <div
            className="live-preview-box"
            style={{
              width: outerW,
              height: outerH,
              boxSizing: 'border-box',
              borderStyle: 'solid',
              borderColor: 'transparent',
              borderWidth: `${borderV}px ${borderH}px`,
              borderImageSource: `url(${borderImageSrc})`,
              borderImageSlice: `${insets.vInset} ${insets.hInset} ${insets.vInset} ${insets.hInset} fill`,
              borderImageRepeat: 'stretch',
              transform: `scale(${stageScale})`,
              transformOrigin: 'top left',
            }}
          >
            <div className="live-preview-content">Content area</div>
          </div>
        </div>
      </div>
      {fitted && (
        <p className="preview-note">
          Fitted to the panel. Export stays at the source resolution.
        </p>
      )}

      <h3>9-Slice Grid</h3>
      <div className="region-grid">
        {REGION_ORDER.map((name) => (
          <RegionThumb key={name} image={image} region={regionMap[name]} />
        ))}
      </div>
    </div>
  );
}
