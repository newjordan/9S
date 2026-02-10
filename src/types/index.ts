/** Mirrored insets in pixels (image-space, not display-space) */
export interface SliceInsets {
  /** Horizontal inset — left and right borders share this value */
  hInset: number;
  /** Vertical inset — top and bottom borders share this value */
  vInset: number;
}

/** Named region of the 9-slice grid */
export type SliceRegionName =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** Rectangular region within the source image */
export interface SliceRegion {
  name: SliceRegionName;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Which drag handle is being interacted with */
export type DragHandle = 'left' | 'right' | 'top' | 'bottom' | null;

/** Result of fitting an image into a container */
export interface FitResult {
  /** Scale factor from image-space to display-space */
  scale: number;
  /** X offset in display-space */
  offsetX: number;
  /** Y offset in display-space */
  offsetY: number;
  /** Displayed width */
  displayWidth: number;
  /** Displayed height */
  displayHeight: number;
}
