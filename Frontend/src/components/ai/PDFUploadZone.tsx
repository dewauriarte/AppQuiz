import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface PDFUploadZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  className?: string;
}

export function PDFUploadZone({ selectedFile, onFileSelect, className = '' }: PDFUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es muy grande (máx. 10MB)');
      return false;
    }
    return true;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
        toast.success(`PDF seleccionado: ${file.name}`);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
      toast.success(`PDF seleccionado: ${file.name}`);
    }
  };

  const clearFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <div className="mt-2 flex items-center justify-center w-full">
        <label
          htmlFor="pdf-upload"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-32 rounded-lg cursor-pointer border-2 border-dashed transition-all ${
            isDragging
              ? 'border-amber-400 bg-amber-400/10 scale-105'
              : selectedFile
              ? 'border-green-500 bg-green-950/20'
              : 'border-purple-500/50 bg-slate-900/80 hover:border-amber-400 hover:bg-slate-900/90'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isDragging ? (
              <>
                <Upload className="w-10 h-10 mb-3 text-amber-400 animate-bounce" />
                <p className="text-sm font-semibold text-amber-400">
                  ¡Suelta el archivo aquí!
                </p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-400">
                  {selectedFile ? (
                    <span className="font-semibold text-green-400">✓ {selectedFile.name}</span>
                  ) : (
                    <>
                      <span className="font-semibold">Click para subir</span> o arrastra aquí
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500">PDF (máx. 10MB)</p>
              </>
            )}
          </div>
          <input
            id="pdf-upload"
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </label>
      </div>
      {selectedFile && (
        <Button
          type="button"
          variant="outline"
          onClick={clearFile}
          className="mt-3 w-full border-amber-400/60 text-amber-200 hover:bg-amber-400/20"
        >
          <X className="mr-2 h-4 w-4" />
          Quitar PDF seleccionado
        </Button>
      )}
    </div>
  );
}
