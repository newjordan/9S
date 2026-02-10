import { useState, useCallback } from 'react';

interface ImageLoaderResult {
  image: HTMLImageElement | null;
  fileName: string | null;
  error: string | null;
  loading: boolean;
  loadFile: (file: File) => void;
  reset: () => void;
}

export function useImageLoader(): ImageLoaderResult {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setImage(null);
    setFileName(null);
    setError(null);
    setLoading(false);
  }, []);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG recommended).');
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onerror = () => {
      setError('Failed to read file.');
      setLoading(false);
    };

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => {
        setError('Failed to decode image.');
        setLoading(false);
      };

      img.onload = () => {
        setImage(img);
        setFileName(file.name);
        setLoading(false);
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  }, []);

  return { image, fileName, error, loading, loadFile, reset };
}
