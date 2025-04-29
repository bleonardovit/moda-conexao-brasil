
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Image } from 'lucide-react';

interface SupplierImageUploadProps {
  initialImages?: string[];
  onChange: (images: string[]) => void;
}

export function SupplierImageUpload({ initialImages = [], onChange }: SupplierImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Convert files to data URLs
      const promises = newFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then(newImages => {
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onChange(updatedImages);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      
      // Convert files to data URLs
      const promises = newFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then(newImages => {
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onChange(updatedImages);
      });
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    onChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <h3 className="font-medium">Arraste imagens ou clique para fazer upload</h3>
          <p className="text-sm text-muted-foreground">
            Formatos suportados: JPG, PNG, GIF (máx. 5MB)
          </p>
          <Button variant="outline" className="mt-2" onClick={() => document.getElementById('fileUpload')?.click()}>
            Selecionar imagens
          </Button>
          <input
            id="fileUpload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Imagens carregadas</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-md border overflow-hidden bg-muted">
                  <img
                    src={image}
                    alt={`Imagem do fornecedor ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
