import React from 'react';
import type { UploadedImage } from '../types';
import { TrashIcon } from './icons';

interface ImagePreviewProps {
  images: UploadedImage[];
  onRemoveImage: (id: string) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemoveImage }) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Uploaded Images</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group aspect-square">
            <img
              src={image.previewUrl}
              alt={image.file.name}
              className="w-full h-full object-cover rounded-lg shadow-md"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center">
              <button
                onClick={() => onRemoveImage(image.id)}
                className="p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Remove image"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
