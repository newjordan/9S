import type { SliceInsets, SliceRegion, SliceRegionName } from '../types';

export function getSliceRegions(
  imgW: number,
  imgH: number,
  insets: SliceInsets,
): SliceRegion[] {
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

/** Slice image into 9 named PNG blobs at full resolution */
export async function sliceImage(
  image: HTMLImageElement,
  insets: SliceInsets,
): Promise<Map<SliceRegionName, Blob>> {
  const regions = getSliceRegions(image.width, image.height, insets);
  const result = new Map<SliceRegionName, Blob>();

  for (const region of regions) {
    if (region.w <= 0 || region.h <= 0) continue;

    const canvas =
      typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(region.w, region.h)
        : document.createElement('canvas');

    if (canvas instanceof HTMLCanvasElement) {
      canvas.width = region.w;
      canvas.height = region.h;
    }

    const ctx = canvas.getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D;

    if (!ctx) continue;

    ctx.drawImage(
      image,
      region.x, region.y, region.w, region.h,
      0, 0, region.w, region.h,
    );

    let blob: Blob;
    if (canvas instanceof OffscreenCanvas) {
      blob = await canvas.convertToBlob({ type: 'image/png' });
    } else {
      blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
    }

    result.set(region.name, blob);
  }

  return result;
}
