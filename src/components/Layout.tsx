import { type ReactNode, useCallback, useRef, useState } from 'react';

interface LayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

const MIN_SIDEBAR = 280;
const MAX_SIDEBAR = 600;
const DEFAULT_SIDEBAR = 360;

export function Layout({ sidebar, children }: LayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

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

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>9slice</h1>
        <span className="header-subtitle">CSS Frame Slicing Tool</span>
      </header>
      <main className="app-main">
        <div className="workspace">{children}</div>
        <div
          className="sidebar-resizer"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
        <aside className="sidebar" style={{ width: sidebarWidth }}>
          {sidebar}
        </aside>
      </main>
    </div>
  );
}
