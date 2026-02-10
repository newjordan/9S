import { Layout } from './components/Layout';
import { ImageUploader } from './components/ImageUploader';
import { SliceCanvas } from './components/SliceCanvas';
import { SliceControls } from './components/SliceControls';
import { SlicePreview } from './components/SlicePreview';
import { ExportButton } from './components/ExportButton';
import { useImageLoader } from './hooks/useImageLoader';
import { useSliceState } from './hooks/useSliceState';

function WorkspaceContent({
  image,
  reset,
}: {
  image: HTMLImageElement;
  reset: () => void;
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
      <button className="reset-button" onClick={reset}>
        Load Different Image
      </button>
    </>
  );

  return (
    <Layout sidebar={sidebar}>
      <SliceCanvas
        image={image}
        insets={insets}
        setHInset={setHInset}
        setVInset={setVInset}
      />
    </Layout>
  );
}

export default function App() {
  const { image, error, loading, loadFile, reset } = useImageLoader();

  if (!image) {
    return (
      <div className="app-upload-screen">
        <h1>9slice</h1>
        <p className="tagline">CSS Frame Slicing Tool</p>
        <ImageUploader onFile={loadFile} loading={loading} error={error} />
      </div>
    );
  }

  return <WorkspaceContent image={image} reset={reset} />;
}
