import type { SliceInsets } from '../types';

interface SliceControlsProps {
  insets: SliceInsets;
  setHInset: (v: number) => void;
  setVInset: (v: number) => void;
  maxH: number;
  maxV: number;
}

export function SliceControls({ insets, setHInset, setVInset, maxH, maxV }: SliceControlsProps) {
  return (
    <div className="slice-controls">
      <h3>Slice Insets</h3>

      <div className="control-group">
        <label>
          <span className="control-label">
            Horizontal (left = right)
          </span>
          <div className="control-row">
            <input
              type="range"
              min={0}
              max={maxH}
              value={insets.hInset}
              onChange={(e) => setHInset(Number(e.target.value))}
            />
            <input
              type="number"
              min={0}
              max={maxH}
              value={insets.hInset}
              onChange={(e) => setHInset(Number(e.target.value))}
              className="inset-number"
            />
            <span className="unit">px</span>
          </div>
        </label>
      </div>

      <div className="control-group">
        <label>
          <span className="control-label">
            Vertical (top = bottom)
          </span>
          <div className="control-row">
            <input
              type="range"
              min={0}
              max={maxV}
              value={insets.vInset}
              onChange={(e) => setVInset(Number(e.target.value))}
            />
            <input
              type="number"
              min={0}
              max={maxV}
              value={insets.vInset}
              onChange={(e) => setVInset(Number(e.target.value))}
              className="inset-number"
            />
            <span className="unit">px</span>
          </div>
        </label>
      </div>

      <div className="inset-summary">
        <code>
          border-image-slice: {insets.vInset} {insets.hInset} {insets.vInset} {insets.hInset}
        </code>
      </div>
    </div>
  );
}
