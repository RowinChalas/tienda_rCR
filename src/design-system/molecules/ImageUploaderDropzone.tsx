import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle, CheckCircle, Link2, X } from 'lucide-react';
import { Button } from '../atoms/Button';

export interface ImageUploaderDropzoneProps {
  onImageSelected: (
    dataUrlOrLink: string,
    fileMeta?: { name: string; sizeBytes: number; width: number; height: number }
  ) => void;
  currentImageUrl?: string;
  label?: string;
  helperText?: string;
  maxSizeBytes?: number; // default 5MB (5 * 1024 * 1024)
  aspectRatioRecommendation?: '16:9' | '3:4' | '1:1' | 'any';
  minWidth?: number;
  minHeight?: number;
  required?: boolean;
}

export const ImageUploaderDropzone: React.FC<ImageUploaderDropzoneProps> = ({
  onImageSelected,
  currentImageUrl,
  label = 'Adjuntar Fotografía',
  helperText,
  maxSizeBytes = 5 * 1024 * 1024, // 5MB
  aspectRatioRecommendation = 'any',
  minWidth,
  minHeight,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUrlInputMode, setIsUrlInputMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Validate File Type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Solo se permiten archivos de imagen válidos (PNG, JPG, WEBP, AVIF).');
      return;
    }

    // 2. Validate Size Restriction
    if (file.size > maxSizeBytes) {
      setErrorMessage(
        `El archivo excede el tamaño máximo permitido (${formatBytes(file.size)} > ${formatBytes(
          maxSizeBytes
        )}). Por favor optimiza la imagen.`
      );
      return;
    }

    // 3. Read and Validate Resolution / Aspect Ratio
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        // Check Min Dimensions
        if (minWidth && width < minWidth) {
          setErrorMessage(`La imagen debe tener un ancho mínimo de ${minWidth}px (actual: ${width}px).`);
          return;
        }
        if (minHeight && height < minHeight) {
          setErrorMessage(`La imagen debe tener un alto mínimo de ${minHeight}px (actual: ${height}px).`);
          return;
        }

        // Check Aspect Ratio Warnings
        if (aspectRatioRecommendation === '16:9') {
          const ratio = width / height;
          if (Math.abs(ratio - 1.777) > 0.25) {
            // Warning/info
            console.warn('Aspect ratio differs from 16:9');
          }
        } else if (aspectRatioRecommendation === '3:4') {
          const ratio = width / height;
          if (Math.abs(ratio - 0.75) > 0.2) {
            console.warn('Aspect ratio differs from 3:4');
          }
        }

        setPreviewUrl(dataUrl);
        setSuccessMessage(`Imagen cargada (${width}x${height}px, ${formatBytes(file.size)})`);
        onImageSelected(dataUrl, {
          name: file.name,
          sizeBytes: file.size,
          width,
          height,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setErrorMessage(null);
    const img = new Image();
    img.onload = () => {
      setPreviewUrl(urlInput.trim());
      setSuccessMessage(`Imagen externa cargada correctamente (${img.naturalWidth}x${img.naturalHeight}px)`);
      onImageSelected(urlInput.trim(), {
        name: 'external-image',
        sizeBytes: 0,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setIsUrlInputMode(false);
    };
    img.onerror = () => {
      setErrorMessage('No se pudo cargar la imagen desde la URL especificada.');
    };
    img.src = urlInput.trim();
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setErrorMessage(null);
    setSuccessMessage(null);
    onImageSelected('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {/* Label and Info */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-text-secondary)' }}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsUrlInputMode(!isUrlInputMode)}
          className="text-[11px] font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1 cursor-pointer"
        >
          <Link2 className="w-3 h-3" /> {isUrlInputMode ? 'Usar archivo local' : 'Pegar enlace URL'}
        </button>
      </div>

      {/* URL Input Form */}
      {isUrlInputMode ? (
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            type="url"
            placeholder="https://images.unsplash.com/... o enlace de foto"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 border rounded-xl py-2 px-3 text-xs"
            style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
          />
          <Button type="submit" variant="primary" size="sm">
            Vincular
          </Button>
        </form>
      ) : previewUrl ? (
        /* Preview View */
        <div
          className="relative rounded-2xl overflow-hidden border p-3 flex items-center gap-4 shadow-sm"
          style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
        >
          <div
            className="w-20 h-20 rounded-xl overflow-hidden border flex-shrink-0 bg-black/40 relative"
            style={{ borderColor: 'var(--admin-border)' }}
          >
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-bold truncate" style={{ color: 'var(--admin-text-primary)' }}>
              Imagen Adjunta
            </p>
            <p className="text-[11px]" style={{ color: 'var(--admin-text-secondary)' }}>
              {aspectRatioRecommendation !== 'any' ? `Formato: ${aspectRatioRecommendation}` : 'Formato libre'} • Máx:{' '}
              {formatBytes(maxSizeBytes)}
            </p>
            {successMessage && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> {successMessage}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleRemoveImage}
            className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            title="Eliminar y seleccionar otra"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Dropzone View */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging ? 'border-brand-500 bg-brand-500/10 scale-[1.01]' : 'hover:border-brand-500/50'
          }`}
          style={{
            borderColor: isDragging ? 'var(--admin-accent)' : 'var(--admin-border-strong)',
            backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'var(--admin-bg)',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                validateAndProcessFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center gap-2">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center border shadow-sm"
              style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
            >
              {isDragging ? (
                <UploadCloud className="w-5 h-5 text-brand-400 animate-bounce" />
              ) : (
                <ImageIcon className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--admin-text-primary)' }}>
                Arrastra una imagen aquí o <span className="text-brand-500 underline">haz clic para explorar</span>
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
                {helperText ||
                  `PNG, JPG, WEBP hasta ${formatBytes(maxSizeBytes)}${
                    aspectRatioRecommendation !== 'any' ? ` • Proporción recomendada: ${aspectRatioRecommendation}` : ''
                  }`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl border bg-red-500/10 border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
