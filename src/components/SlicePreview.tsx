import { useMemo, useRef, useEffect, useState } from 'react';
import type { SliceInsets, SliceRegion, SliceRegionName } from '../types';

interface SlicePreviewProps {
  image: HTMLImageElement;
  insets: SliceInsets;
}

const REGION_ORDER: SliceRegionName[] = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

function getRegions(imgW: number, imgH: number, insets: SliceInsets): SliceRegion[] {
  const { hInset, vInset } = insets;
  const centerW = imgW - hInset * 2;
  const centerH = imgH - vInset * 2;

  return [
    { name: 'top-left', x: 0, y: 0, w: hInset, h: vInset },
    { name: 'top-center', x: hInset, y: 0, w: centerW, h: vInset },
    { name: 'top-right', x: imgW - hInset, y: 0, w: hInset, h: vInset },
    { name: 'middle-left', x: 0, y: vInset, w: hInset, h: centerH },
    { name: 'center', x: hInset, y: vInset, w: centerW, h: centerH },
    { name: 'middle-right', x: imgW - hInset, y: vInset, w: hInset, h: centerH },
    { name: 'bottom-left', x: 0, y: imgH - vInset, w: hInset, h: vInset },
    { name: 'bottom-center', x: hInset, y: imgH - vInset, w: centerW, h: vInset },
    { name: 'bottom-right', x: imgW - hInset, y: imgH - vInset, w: hInset, h: vInset },
  ];
}

function RegionThumb({ image, region }: { image: HTMLImageElement; region: SliceRegion }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || region.w <= 0 || region.h <= 0) return;

    const maxSize = 80;
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

export function SlicePreview({ image, insets }: SlicePreviewProps) {
  const [previewSize, setPreviewSize] = useState({ w: 300, h: 200 });

  const regions = useMemo(
    () => getRegions(image.width, image.height, insets),
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

  return (
    <div className="slice-preview">
      <h3>9-Slice Grid</h3>
      <div className="region-grid">
        {REGION_ORDER.map((name) => (
          <RegionThumb key={name} image={image} region={regionMap[name]} />
        ))}
      </div>

      <h3>Live Preview</h3>
      <div className="live-preview-controls">
        <label>
          W:
          <input
            type="number"
            value={previewSize.w}
            min={50}
            max={800}
            onChange={(e) => setPreviewSize((s) => ({ ...s, w: Number(e.target.value) }))}
            className="size-input"
          />
        </label>
        <label>
          H:
          <input
            type="number"
            value={previewSize.h}
            min={50}
            max={800}
            onChange={(e) => setPreviewSize((s) => ({ ...s, h: Number(e.target.value) }))}
            className="size-input"
          />
        </label>
      </div>
      <div
        className="live-preview-box"
        style={{
          width: previewSize.w,
          height: previewSize.h,
          borderStyle: 'solid',
          borderWidth: `${insets.vInset}px ${insets.hInset}px`,
          borderImage: `url(${borderImageSrc}) ${insets.vInset} ${insets.hInset} ${insets.vInset} ${insets.hInset} fill stretch`,
          boxSizing: 'border-box',
        }}
      >
        <div className="live-preview-content">
          Content area
        </div>
      </div>
    </div>
  );
}
