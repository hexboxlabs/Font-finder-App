import React, { useRef } from 'react';
import { UploadCloudIcon } from './icons';

interface FileUploadProps {
  onFilesSelected: (files: FileList) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelected(event.target.files);
    }
  };

  const handleAreaClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onClick={handleAreaClick}
      className={`relative block w-full rounded-lg border-2 border-dashed border-gray-600 p-12 text-center hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
    >
      <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
      <span className="mt-2 block text-sm font-semibold text-gray-200">
        Upload images of a font
      </span>
      <span className="mt-1 block text-xs text-gray-400">
        PNG, JPG, WEBP. Drag & drop or click.
      </span>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="sr-only"
        disabled={disabled}
      />
    </div>
  );
};
