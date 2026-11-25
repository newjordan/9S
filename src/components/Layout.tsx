import { type ReactNode, useCallback, useRef, useState } from 'react';
import { useFileDrop } from '../hooks/useFileDrop';

interface LayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  fileName?: string | null;
  sample?: boolean;
  onFile?: (file: File) => void;
}

const MIN_SIDEBAR = 280;
const MAX_SIDEBAR = 600;
const DEFAULT_SIDEBAR = 380;

export function Layout({
  sidebar,
  children,
  fileName,
  sample = false,
  onFile,
}: LayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);
  const { dragOver, dropProps } = useFileDrop(onFile ?? (() => {}));

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = sidebarWidth;
  }, [sidebarWidth]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = startX.current - e.clientX;
    setSidebarWidth(Math.max(MIN_SIDEBAR, Math.min(MAX_SIDEBAR, startW.current + delta)));
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onResizerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSidebarWidth((width) => Math.min(MAX_SIDEBAR, width + 16));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSidebarWidth((width) => Math.max(MIN_SIDEBAR, width - 16));
    }
  }, []);

  return (
    <div className="app-layout" {...(onFile ? dropProps : {})}>
      <header className="app-header">
        <h1>9S</h1>
        <span className="header-subtitle">9-slice game UI</span>
        {fileName && (
          <span className="header-file">
            {sample && <span className="header-badge">Sample</span>}
            <span className="header-filename">{fileName}</span>
          </span>
        )}
      </header>
      <main className="app-main">
        <div className="workspace">{children}</div>
        <div
          className="sidebar-resizer"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onKeyDown={onResizerKeyDown}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          aria-valuemin={MIN_SIDEBAR}
          aria-valuemax={MAX_SIDEBAR}
          aria-valuenow={sidebarWidth}
          tabIndex={0}
        />
        <aside className="sidebar" style={{ width: sidebarWidth }}>
          {sidebar}
        </aside>
      </main>
      {dragOver && onFile && (
        <div className="drop-overlay">
          <span>Drop an image to slice it</span>
        </div>
      )}
    </div>
  );
}
