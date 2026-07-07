import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Product, FavoriteWithProduct } from '../types/database.types';

interface FavoritesContextType {
  favorites: FavoriteWithProduct[];
  loading: boolean;
  favoriteIds: Set<string>;
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  toggleFavorite: (product: Product) => Promise<void>;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

async function fetchProductById(productId: string): Promise<Product | null> {
  const docRef = doc(db, 'products', productId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      price: data.price,
      originalPrice: data.originalPrice || null,
      imageUrl: data.imageUrl || null,
      images: data.images || [],
      categoryId: data.categoryId || null,
      stock: data.stock || 0,
      isNew: data.isNew || false,
      isPopular: data.isPopular || false,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  }
  return null;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWithProduct[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const favQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', user.uid)
      );
      const favSnapshot = await getDocs(favQuery);

      const favItems: FavoriteWithProduct[] = [];
      const ids = new Set<string>();

      for (const favDoc of favSnapshot.docs) {
        const favData = favDoc.data();
        const product = await fetchProductById(favData.productId);

        if (product) {
          favItems.push({
            id: favDoc.id,
            userId: favData.userId,
            productId: favData.productId,
            createdAt: favData.createdAt?.toDate() || new Date(),
            product,
          });
          ids.add(favData.productId);
        }
      }

      setFavorites(favItems);
      setFavoriteIds(ids);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addToFavorites = async (product: Product) => {
    if (!user) return;

    await addDoc(collection(db, 'favorites'), {
      userId: user.uid,
      productId: product.id,
      createdAt: serverTimestamp(),
    });
    await fetchFavorites();
  };

  const removeFromFavorites = async (productId: string) => {
    if (!user) return;

    const item = favorites.find((f) => f.productId === productId);
    if (item) {
      await deleteDoc(doc(db, 'favorites', item.id));
      setFavorites((prev) => prev.filter((f) => f.productId !== productId));
      setFavoriteIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const toggleFavorite = async (product: Product) => {
    if (isFavorite(product.id)) {
      await removeFromFavorites(product.id);
    } else {
      await addToFavorites(product);
    }
  };

  const isFavorite = (productId: string) => {
    return favoriteIds.has(productId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        favoriteIds,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
