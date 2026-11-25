import { useCallback, useEffect, useRef, useState } from 'react';
import { Layout } from './components/Layout';
import { ImageUploader } from './components/ImageUploader';
import { SliceCanvas } from './components/SliceCanvas';
import { SliceControls } from './components/SliceControls';
import { SlicePreview } from './components/SlicePreview';
import { ExportButton } from './components/ExportButton';
import { useFileDrop } from './hooks/useFileDrop';
import { useImageLoader } from './hooks/useImageLoader';
import { useSliceState } from './hooks/useSliceState';
import { publicUrl } from './utils/publicUrl';

const SAMPLE_NAME = 'hud-frame.png';

function sampleFrameUrl() {
  return publicUrl('original.png');
}

function WorkspaceContent({
  image,
  fileName,
  sample,
  reset,
  onFile,
}: {
  image: HTMLImageElement;
  fileName: string | null;
  sample: boolean;
  reset: () => void;
  onFile: (file: File) => void;
}) {
  const { insets, setHInset, setVInset, maxH, maxV } = useSliceState(
    image.width,
    image.height,
  );

  const sidebar = (
    <>
      <SliceControls
        insets={insets}
        setHInset={setHInset}
        setVInset={setVInset}
        maxH={maxH}
        maxV={maxV}
      />
      <SlicePreview image={image} insets={insets} />
      <ExportButton image={image} insets={insets} />
      <button className="reset-button" onClick={reset} type="button">
        Load a different image
      </button>
    </>
  );

  return (
    <Layout
      sidebar={sidebar}
      fileName={fileName}
      sample={sample}
      onFile={onFile}
    >
      <SliceCanvas
        image={image}
        insets={insets}
        setHInset={setHInset}
        setVInset={setVInset}
      />
    </Layout>
  );
}

function StartScreen({
  loading,
  error,
  onFile,
  onUseSample,
}: {
  loading: boolean;
  error: string | null;
  onFile: (file: File) => void;
  onUseSample: () => void;
}) {
  const { dragOver, dropProps } = useFileDrop(onFile);

  return (
    <div className={`app-upload-screen ${dragOver ? 'drag-over' : ''}`} {...dropProps}>
      <p className="eyebrow">Game UI frames</p>
      <h1>9S</h1>
      <p className="tagline">
        Slice a frame, preview how it scales, and export CSS plus PNGs.
      </p>
      <ol className="chooser-steps">
        <li>Set the corner size</li>
        <li>Preview it small and wide</li>
        <li>Download the slices and CSS</li>
      </ol>
      <div className="chooser-actions">
        <button
          className="sample-button"
          type="button"
          onClick={onUseSample}
          disabled={loading}
        >
          {loading ? 'Loading sample…' : 'Try the sample frame'}
        </button>
        <p className="chooser-or">or bring your own</p>
        <ImageUploader onFile={onFile} loading={loading} error={error} />
      </div>
      {dragOver && (
        <div className="drop-overlay">
          <span>Drop an image to slice it</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { image, fileName, source, error, loading, loadFile, loadUrl, reset } =
    useImageLoader();
  const [showChooser, setShowChooser] = useState(false);
  const autoload = useRef(false);

  useEffect(() => {
    if (autoload.current) return;
    autoload.current = true;
    void loadUrl(sampleFrameUrl(), SAMPLE_NAME, 'sample').catch(() => {});
  }, [loadUrl]);

  const useSample = useCallback(() => {
    void loadUrl(sampleFrameUrl(), SAMPLE_NAME, 'sample').catch(() => {});
  }, [loadUrl]);

  const backToChooser = useCallback(() => {
    setShowChooser(true);
    reset();
  }, [reset]);

  if (image) {
    return (
      <WorkspaceContent
        image={image}
        fileName={fileName}
        sample={source === 'sample'}
        reset={backToChooser}
        onFile={loadFile}
      />
    );
  }

  if (!showChooser && !error) {
    return (
      <div className="app-upload-screen">
        <p className="eyebrow">Game UI frames</p>
        <h1>9S</h1>
        <p className="tagline" role="status">
          Loading the sample frame…
        </p>
      </div>
    );
  }

  return (
    <StartScreen
      loading={loading}
      error={error}
      onFile={loadFile}
      onUseSample={useSample}
    />
  );
}
