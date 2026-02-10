import type { FitResult, SliceInsets } from '../types';
import {
  CANVAS_BG,
  CHECKER_DARK,
  CHECKER_LIGHT,
  CHECKER_SIZE,
  REGION_OVERLAY_COLOR,
  SLICE_LINE_COLOR,
} from '../constants';

/** Calculate how to fit an image centered within a container */
export function fitImageToContainer(
  imgW: number,
  imgH: number,
  containerW: number,
  containerH: number,
  padding = 20,
): FitResult {
  const availW = containerW - padding * 2;
  const availH = containerH - padding * 2;
  const scale = Math.min(1, availW / imgW, availH / imgH);
  const displayWidth = imgW * scale;
  const displayHeight = imgH * scale;
  const offsetX = (containerW - displayWidth) / 2;
  const offsetY = (containerH - displayHeight) / 2;
  return { scale, offsetX, offsetY, displayWidth, displayHeight };
}

/** Draw a checkerboard pattern behind the image area */
export function drawCheckerboard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const size = CHECKER_SIZE;
  for (let row = 0; row * size < h; row++) {
    for (let col = 0; col * size < w; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? CHECKER_LIGHT : CHECKER_DARK;
      ctx.fillRect(
        x + col * size,
        y + row * size,
        Math.min(size, w - col * size),
        Math.min(size, h - row * size),
      );
    }
  }
}

/** Render the full canvas: background, checkerboard, image, slice lines, region overlays */
export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  insets: SliceInsets,
  fit: FitResult,
  canvasW: number,
  canvasH: number,
) {
  const { scale, offsetX, offsetY, displayWidth, displayHeight } = fit;

  // Clear
  ctx.fillStyle = CANVAS_BG;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Checkerboard behind image
  drawCheckerboard(ctx, offsetX, offsetY, displayWidth, displayHeight);

  // Draw image
  ctx.drawImage(image, offsetX, offsetY, displayWidth, displayHeight);

  // Slice lines
  const hDisplay = insets.hInset * scale;
  const vDisplay = insets.vInset * scale;

  ctx.save();
  ctx.strokeStyle = SLICE_LINE_COLOR;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  // Left line
  const leftX = offsetX + hDisplay;
  ctx.beginPath();
  ctx.moveTo(leftX, offsetY);
  ctx.lineTo(leftX, offsetY + displayHeight);
  ctx.stroke();

  // Right line
  const rightX = offsetX + displayWidth - hDisplay;
  ctx.beginPath();
  ctx.moveTo(rightX, offsetY);
  ctx.lineTo(rightX, offsetY + displayHeight);
  ctx.stroke();

  // Top line
  const topY = offsetY + vDisplay;
  ctx.beginPath();
  ctx.moveTo(offsetX, topY);
  ctx.lineTo(offsetX + displayWidth, topY);
  ctx.stroke();

  // Bottom line
  const bottomY = offsetY + displayHeight - vDisplay;
  ctx.beginPath();
  ctx.moveTo(offsetX, bottomY);
  ctx.lineTo(offsetX + displayWidth, bottomY);
  ctx.stroke();

  ctx.restore();

  // Region overlays - shade the 4 corner regions lightly
  ctx.fillStyle = REGION_OVERLAY_COLOR;
  // Top-left
  ctx.fillRect(offsetX, offsetY, hDisplay, vDisplay);
  // Top-right
  ctx.fillRect(rightX, offsetY, hDisplay, vDisplay);
  // Bottom-left
  ctx.fillRect(offsetX, bottomY, hDisplay, vDisplay);
  // Bottom-right
  ctx.fillRect(rightX, bottomY, hDisplay, vDisplay);
}
