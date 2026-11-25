import { useState } from 'react';
import type { SliceInsets } from '../types';
import { exportZip } from '../utils/exportZip';
import { DEFAULT_PREFIX } from '../constants';

interface ExportButtonProps {
  image: HTMLImageElement;
  insets: SliceInsets;
}

export function ExportButton({ image, insets }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefix, setPrefix] = useState(DEFAULT_PREFIX);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      await exportZip(image, insets, prefix);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Export failed. Try again in a moment.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-section">
      <h3>Export</h3>
      <div className="export-row">
        <label>
          Prefix:
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') || DEFAULT_PREFIX)}
            className="prefix-input"
          />
        </label>
      </div>
      <button
        className="export-button"
        type="button"
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? 'Exporting...' : 'Download ZIP'}
      </button>
      <p className="export-hint">
        Includes 9 PNGs + source + border-image.css + grid-layout.css
      </p>
      {error && <p className="export-error">{error}</p>}
    </div>
  );
}
