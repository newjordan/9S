import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { SliceInsets } from '../types';
import { sliceImage } from './sliceImage';
import { generateBorderImageCSS, generateGridLayoutCSS } from './generateCSS';

export async function exportZip(
  image: HTMLImageElement,
  insets: SliceInsets,
  prefix: string,
): Promise<void> {
  const zip = new JSZip();

  // Original source image
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = image.width;
  sourceCanvas.height = image.height;
  const sourceCtx = sourceCanvas.getContext('2d')!;
  sourceCtx.drawImage(image, 0, 0);
  const sourceBlob = await new Promise<Blob>((resolve) => {
    sourceCanvas.toBlob((b) => resolve(b!), 'image/png');
  });
  zip.file(`${prefix}-source.png`, sourceBlob);

  // 9 sliced images
  const slices = await sliceImage(image, insets, prefix);
  for (const [name, blob] of slices) {
    zip.file(`${prefix}-${name}.png`, blob);
  }

  // CSS files
  const borderCSS = generateBorderImageCSS(prefix, insets);
  zip.file('border-image.css', borderCSS);

  const gridCSS = generateGridLayoutCSS(prefix, insets, image.width, image.height);
  zip.file('grid-layout.css', gridCSS);

  // Generate and download
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${prefix}-9slice.zip`);
}
