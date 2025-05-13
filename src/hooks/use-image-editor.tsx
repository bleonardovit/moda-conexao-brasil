
import { useState, useEffect } from 'react';

export interface LandingPageImages {
  hero: string;
  app1: string;
  app2: string;
  app3: string;
  testimonial1: string;
  testimonial2: string;
}

// Default images for the landing page
const defaultImages: LandingPageImages = {
  hero: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
  app1: 'https://images.unsplash.com/photo-1551650975-87deedd944c3',
  app2: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356',
  app3: 'https://images.unsplash.com/photo-1616469829941-c7200edec809',
  testimonial1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  testimonial2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
};

// Storage key for saving landing page images to localStorage
const STORAGE_KEY = 'landing_page_images';

export const useImageEditor = () => {
  const [images, setImages] = useState<LandingPageImages>(defaultImages);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved images from localStorage on initial mount
  useEffect(() => {
    try {
      const savedImages = localStorage.getItem(STORAGE_KEY);
      if (savedImages) {
        setImages(JSON.parse(savedImages));
      }
    } catch (error) {
      console.error('Error loading saved images:', error);
      // If there's an error loading saved images, fallback to defaults
      setImages(defaultImages);
    }
  }, []);

  // Function to update a specific image
  const updateImage = (key: keyof LandingPageImages, url: string) => {
    try {
      setIsLoading(true);
      const updatedImages = { ...images, [key]: url };
      setImages(updatedImages);
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedImages));
    } catch (error) {
      console.error('Error updating image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset all images to defaults
  const resetToDefaults = () => {
    try {
      setIsLoading(true);
      setImages(defaultImages);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultImages));
    } catch (error) {
      console.error('Error resetting images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get current images
  const getImages = () => {
    return images;
  };

  return {
    getImages,
    updateImage,
    resetToDefaults,
    isLoading
  };
};
