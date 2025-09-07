import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';

interface MediaInputProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  className?: string;
  multiple?: boolean;
  children?: React.ReactNode;
}

interface FileWithPreview extends File {
  preview: string;
}

export function MediaInput({ 
  onFilesSelected, 
  acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  className = '',
  multiple = true,
  children
}: MediaInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string>('');

  const handleFiles = useCallback((files: FileList) => {
    setError('');
    const fileArray = Array.from(files);
    
    // Validate file types
    const invalidFiles = fileArray.filter(file => !acceptedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setError(`Unsupported file type(s): ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = fileArray.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      setError(`File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Max size: ${Math.round(maxFileSize / 1024 / 1024)}MB`);
      return;
    }

    // Check max files limit
    const totalFiles = multiple ? selectedFiles.length + fileArray.length : fileArray.length;
    if (totalFiles > maxFiles) {
      setError(`Too many files. Maximum ${maxFiles} files allowed.`);
      return;
    }

    // Create preview URLs
    const filesWithPreview: FileWithPreview[] = fileArray.map(file => {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.preview = URL.createObjectURL(file);
      return fileWithPreview;
    });

    const newFiles = multiple ? [...selectedFiles, ...filesWithPreview] : filesWithPreview;
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  }, [acceptedTypes, maxFileSize, maxFiles, multiple, onFilesSelected, selectedFiles]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(selectedFiles[index].preview);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
    setError('');
  };

  const clearAll = () => {
    selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    setSelectedFiles([]);
    onFilesSelected([]);
    setError('');
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return ImageIcon;
    }
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${error ? 'border-red-300' : ''}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="space-y-4">
          <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          
          {children || (
            <div>
              <p className="text-lg font-medium text-gray-900">
                {dragActive ? 'Drop files here' : 'Upload images'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag & drop or click to select files
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} 
                • Max {maxFiles} files • Up to {Math.round(maxFileSize / 1024 / 1024)}MB each
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({selectedFiles.length})
            </h4>
            {selectedFiles.length > 1 && (
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="grid gap-3">
            {selectedFiles.map((file, index) => {
              const FileIcon = getFileIcon(file);
              const isImage = file.type.startsWith('image/');
              
              return (
                <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                  {/* Preview or Icon */}
                  <div className="flex-shrink-0">
                    {isImage ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-12 w-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-12 w-12 flex items-center justify-center bg-gray-200 rounded-lg">
                        <FileIcon className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaInput;
