import { useCallback, useRef, useState } from 'react';

function hasFiles(event: React.DragEvent) {
  return [...event.dataTransfer.types].includes('Files');
}

/** Track a file drag over a region and return the first dropped file. */
export function useFileDrop(onFile: (file: File) => void) {
  const [dragOver, setDragOver] = useState(false);
  const depth = useRef(0);

  const onDragEnter = useCallback((event: React.DragEvent) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    depth.current += 1;
    setDragOver(true);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setDragOver(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth.current = 0;
      setDragOver(false);
      const file = event.dataTransfer.files.item(0);
      if (file) onFile(file);
    },
    [onFile],
  );

  return {
    dragOver,
    dropProps: { onDragEnter, onDragOver, onDragLeave, onDrop },
  };
}
