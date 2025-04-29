
import { useState, useEffect } from 'react';

type FavoriteSupplier = {
  id: string;
  name: string;
  timestamp: number;
};

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const savedFavorites = localStorage.getItem('supplier-favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    localStorage.setItem('supplier-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (supplierId: string) => {
    setFavorites((prev) => [...prev, supplierId]);
  };

  const removeFavorite = (supplierId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== supplierId));
  };

  const toggleFavorite = (supplierId: string) => {
    if (isFavorite(supplierId)) {
      removeFavorite(supplierId);
    } else {
      addFavorite(supplierId);
    }
  };

  const isFavorite = (supplierId: string) => {
    return favorites.includes(supplierId);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
