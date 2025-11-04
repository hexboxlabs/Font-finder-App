import React, { useState, useCallback } from 'react';
import { analyzeFontImages } from './services/geminiService';
import type { UploadedImage, FontAnalysisResult } from './types';
import { FileUpload } from './components/FileUpload';
import { ImagePreview } from './components/ImagePreview';
import { AnalysisResult } from './components/AnalysisResult';
import { Loader } from './components/Loader';
import { SparklesIcon } from './components/icons';


const App: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<FontAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((files: FileList) => {
    setError(null);
    setAnalysisResult(null);
    const newImages: UploadedImage[] = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    setUploadedImages(prev => [...prev, ...newImages]);
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setUploadedImages(prev => prev.filter(image => {
        if (image.id === id) {
            URL.revokeObjectURL(image.previewUrl);
            return false;
        }
        return true;
    }));
  }, []);

  const handleAnalyzeClick = async () => {
    if (uploadedImages.length === 0) {
      setError("Please upload at least one image to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const files = uploadedImages.map(img => img.file);
      const result = await analyzeFontImages(files);
      setAnalysisResult(result);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unexpected error occurred.');
        }
    } finally {
      setIsLoading(false);
    }
  };
  
  const ResultPlaceholder = () => (
    <div className="flex flex-col items-center justify-center text-center p-6 h-full bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
        <SparklesIcon className="w-16 h-16 text-gray-600 mb-4"/>
        <h3 className="text-xl font-bold text-gray-300">Analysis Results</h3>
        <p className="mt-2 max-w-xs text-gray-400">
            Upload your font images and click 'Analyze' to see the magic happen here.
        </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 font-sans">
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Font Finder AI
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
            Identify any font from an image. Powered by Gemini.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <FileUpload onFilesSelected={handleFileChange} disabled={isLoading} />
            <ImagePreview images={uploadedImages} onRemoveImage={handleRemoveImage} />
             {uploadedImages.length > 0 && (
              <div className="sticky bottom-4">
                <button
                  onClick={handleAnalyzeClick}
                  disabled={isLoading || uploadedImages.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <SparklesIcon className="w-5 h-5"/>
                  {isLoading ? 'Analyzing...' : `Analyze ${uploadedImages.length} Image(s)`}
                </button>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-8">
            {isLoading ? (
              <Loader message="Identifying your font..." />
            ) : error ? (
              <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg animate-fade-in" role="alert">
                <p className="font-bold">Analysis Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : analysisResult ? (
              <AnalysisResult result={analysisResult} />
            ) : (
              <ResultPlaceholder />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
