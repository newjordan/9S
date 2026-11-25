import { useState, useCallback, useRef } from 'react';

export type ImageSource = 'sample' | 'upload';

interface ImageLoaderResult {
  image: HTMLImageElement | null;
  fileName: string | null;
  source: ImageSource | null;
  error: string | null;
  loading: boolean;
  loadFile: (file: File) => void;
  loadUrl: (url: string, name: string, source: ImageSource) => Promise<void>;
  reset: () => void;
}

export function useImageLoader(): ImageLoaderResult {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [source, setSource] = useState<ImageSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const reset = useCallback(() => {
    requestId.current += 1;
    setImage(null);
    setFileName(null);
    setSource(null);
    setError(null);
    setLoading(false);
  }, []);

  const loadUrl = useCallback((url: string, name: string, kind: ImageSource) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    return new Promise<void>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        if (id !== requestId.current) {
          resolve();
          return;
        }
        setImage(img);
        setFileName(name);
        setSource(kind);
        setLoading(false);
        resolve();
      };

      img.onerror = () => {
        if (id !== requestId.current) {
          resolve();
          return;
        }
        const message =
          kind === 'sample'
            ? 'The sample frame could not be loaded. Drop your own PNG instead.'
            : 'Could not load that image.';
        setError(message);
        setLoading(false);
        reject(new Error(message));
      };

      img.src = url;
    });
  }, []);

  const loadFile = useCallback((file: File) => {
    const id = ++requestId.current;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG recommended).');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onerror = () => {
      if (id !== requestId.current) return;
      setError('Failed to read file.');
      setLoading(false);
    };

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => {
        if (id !== requestId.current) return;
        setError('Failed to decode image.');
        setLoading(false);
      };

      img.onload = () => {
        if (id !== requestId.current) return;
        setImage(img);
        setFileName(file.name);
        setSource('upload');
        setLoading(false);
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  }, []);

  return { image, fileName, source, error, loading, loadFile, loadUrl, reset };
}
