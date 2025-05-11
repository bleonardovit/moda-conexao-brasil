
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SupplierImageUploadProps {
  initialImages?: string[];
  onChange: (images: string[]) => void;
}

export function SupplierImageUpload({ initialImages = [], onChange }: SupplierImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Validate file size (5MB limit)
      const fileSizeInMB = file.size / 1024 / 1024;
      if (fileSizeInMB > 5) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo excede o limite de 5MB: ${file.name} (${fileSizeInMB.toFixed(2)}MB)`,
          variant: "destructive",
        });
        return null;
      }

      // Generate a unique filename to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('supplier-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Erro ao fazer upload",
          description: `Não foi possível fazer upload de ${file.name}: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('supplier-images')
        .getPublicUrl(data?.path || '');
      
      return publicUrl;
    } catch (error) {
      console.error('Error in file upload:', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao processar o arquivo.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const newFiles = Array.from(e.target.files);
      
      // Upload each file and get public URLs
      const uploadPromises = newFiles.map(file => uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      // Filter out failed uploads
      const uploadedUrls = results.filter(url => url !== null) as string[];
      
      if (uploadedUrls.length > 0) {
        const updatedImages = [...images, ...uploadedUrls];
        setImages(updatedImages);
        onChange(updatedImages);
      }
      
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsUploading(true);
      const newFiles = Array.from(e.dataTransfer.files);
      
      // Upload each file and get public URLs
      const uploadPromises = newFiles.map(file => uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      // Filter out failed uploads
      const uploadedUrls = results.filter(url => url !== null) as string[];
      
      if (uploadedUrls.length > 0) {
        const updatedImages = [...images, ...uploadedUrls];
        setImages(updatedImages);
        onChange(updatedImages);
      }
      
      setIsUploading(false);
    }
  };

  const removeImage = async (index: number, imageUrl: string) => {
    try {
      // Extract the file path from the URL
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/supplier-images\/(.*)/);
      
      if (pathMatch && pathMatch[1]) {
        // Try to delete the file from storage
        await supabase.storage
          .from('supplier-images')
          .remove([pathMatch[1]]);
      }
      
      // Update local state regardless of whether the delete was successful
      const updatedImages = [...images];
      updatedImages.splice(index, 1);
      setImages(updatedImages);
      onChange(updatedImages);
      
    } catch (error) {
      console.error('Error removing image:', error);
      
      // Still remove from the UI even if storage delete fails
      const updatedImages = [...images];
      updatedImages.splice(index, 1);
      setImages(updatedImages);
      onChange(updatedImages);
    }
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
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => document.getElementById('fileUpload')?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Enviando...' : 'Selecionar imagens'}
          </Button>
          <input
            id="fileUpload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
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
                  onClick={() => removeImage(index, image)}
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
