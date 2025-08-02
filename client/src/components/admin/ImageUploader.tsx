// ----------------- START OF ImageUploader.tsx -----------------

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

// Define the props this component will accept
interface ImageUploaderProps {
  files: File[];
  setFiles: (files: File[]) => void;
}

export function ImageUploader({ files, setFiles }: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Append new files to the existing ones
    setFiles([...files, ...acceptedFiles]);
  }, [files, setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
  });

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`mt-1 border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-lg font-medium text-primary">Drop the files here ...</p>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-600">PNG, JPG, WEBP supported</p>
          </>
        )}
      </div>

      {/* Image Previews */}
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={URL.createObjectURL(file)}
                alt={`preview ${index}`}
                className="w-full h-full object-cover rounded-md"
                onLoad={() => URL.revokeObjectURL(file.name)} // Clean up object URLs
              />
              <button
                type="button"
                onClick={() => removeFile(file)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}