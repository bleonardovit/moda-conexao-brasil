
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { uploadBase64ImageToStorage, isBase64Image } from '@/utils/imageUtils';

export interface LandingPageImages {
  hero: string;
  app1: string;
  app2: string;
  app3: string;
  testimonial1: string;
  testimonial2: string;
}

const defaultImages = {
  hero: "https://images.unsplash.com/photo-1614771637369-ed94441a651a?q=80&w=1200&auto=format&fit=crop",
  app1: "https://images.unsplash.com/photo-1509631179407-329d2570cac2?q=80&w=500&auto=format&fit=crop",
  app2: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=500&auto=format&fit=crop",
  app3: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=500&auto=format&fit=crop",
  testimonial1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
  testimonial2: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop",
};

// Key for localStorage
const LANDING_PAGE_IMAGES_KEY = 'landing_page_images';

export const useImageEditor = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Load saved images from localStorage or use defaults
  const getSavedImages = (): LandingPageImages => {
    const savedImages = localStorage.getItem(LANDING_PAGE_IMAGES_KEY);
    return savedImages ? JSON.parse(savedImages) : defaultImages;
  };

  // Save images to localStorage
  const saveImages = (images: LandingPageImages) => {
    localStorage.setItem(LANDING_PAGE_IMAGES_KEY, JSON.stringify(images));
  };

  // Update a single image
  const updateImage = async (key: keyof LandingPageImages, imageUrl: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // If the image is base64, upload to storage first
      let finalImageUrl = imageUrl;
      if (isBase64Image(imageUrl)) {
        const uploadedUrl = await uploadBase64ImageToStorage(imageUrl);
        if (!uploadedUrl) {
          throw new Error("Falha ao fazer upload da imagem");
        }
        finalImageUrl = uploadedUrl;
      }
      
      // Update in localStorage
      const currentImages = getSavedImages();
      const updatedImages = { ...currentImages, [key]: finalImageUrl };
      saveImages(updatedImages);
      
      toast({
        title: "Imagem atualizada",
        description: "A imagem foi atualizada com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar imagem:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar imagem",
        description: "Ocorreu um erro ao tentar atualizar a imagem.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to default images
  const resetToDefaults = () => {
    saveImages(defaultImages);
    toast({
      title: "Imagens redefinidas",
      description: "Todas as imagens foram redefinidas para os valores padrão.",
    });
    return defaultImages;
  };

  return {
    getImages: getSavedImages,
    updateImage,
    resetToDefaults,
    isLoading,
  };
};
