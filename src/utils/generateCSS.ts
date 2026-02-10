import type { SliceInsets } from '../types';

export function generateBorderImageCSS(
  prefix: string,
  insets: SliceInsets,
): string {
  const { hInset, vInset } = insets;

  return `/* border-image approach — uses the original source image */
/* Apply this class to any element to give it the 9-slice frame */

.${prefix}-frame {
  border-style: solid;
  border-width: ${vInset}px ${hInset}px;
  border-image-source: url('${prefix}-source.png');
  border-image-slice: ${vInset} ${hInset} ${vInset} ${hInset} fill;
  border-image-repeat: stretch;
  box-sizing: border-box;
}
`;
}

export function generateGridLayoutCSS(
  prefix: string,
  insets: SliceInsets,
  imgWidth: number,
  imgHeight: number,
): string {
  const { hInset, vInset } = insets;
  const centerW = imgWidth - hInset * 2;
  const centerH = imgHeight - vInset * 2;

  return `/* CSS Grid approach — uses 9 separate slice images */
/* Wrap your content in an element with class "${prefix}-grid" */

.${prefix}-grid {
  display: grid;
  grid-template-columns: ${hInset}px 1fr ${hInset}px;
  grid-template-rows: ${vInset}px 1fr ${vInset}px;
  min-width: ${hInset * 2}px;
  min-height: ${vInset * 2}px;
}

.${prefix}-grid > * {
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.${prefix}-tl { grid-area: 1 / 1 / 2 / 2; background-image: url('${prefix}-top-left.png'); }
.${prefix}-tc { grid-area: 1 / 2 / 2 / 3; background-image: url('${prefix}-top-center.png'); }
.${prefix}-tr { grid-area: 1 / 3 / 2 / 4; background-image: url('${prefix}-top-right.png'); }
.${prefix}-ml { grid-area: 2 / 1 / 3 / 2; background-image: url('${prefix}-middle-left.png'); }
.${prefix}-c  { grid-area: 2 / 2 / 3 / 3; background-image: url('${prefix}-center.png'); }
.${prefix}-mr { grid-area: 2 / 3 / 3 / 4; background-image: url('${prefix}-middle-right.png'); }
.${prefix}-bl { grid-area: 3 / 1 / 4 / 2; background-image: url('${prefix}-bottom-left.png'); }
.${prefix}-bc { grid-area: 3 / 2 / 4 / 3; background-image: url('${prefix}-bottom-center.png'); }
.${prefix}-br { grid-area: 3 / 3 / 4 / 4; background-image: url('${prefix}-bottom-right.png'); }

/* Usage:
<div class="${prefix}-grid">
  <div class="${prefix}-tl"></div>
  <div class="${prefix}-tc"></div>
  <div class="${prefix}-tr"></div>
  <div class="${prefix}-ml"></div>
  <div class="${prefix}-c">Your content here</div>
  <div class="${prefix}-mr"></div>
  <div class="${prefix}-bl"></div>
  <div class="${prefix}-bc"></div>
  <div class="${prefix}-br"></div>
</div>
*/
`;
}
