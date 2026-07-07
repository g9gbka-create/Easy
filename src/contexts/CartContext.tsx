import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Product, CartItemWithProduct } from '../types/database.types';

interface CartContextType {
  items: CartItemWithProduct[];
  loading: boolean;
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

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

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const cartQuery = query(
        collection(db, 'cartItems'),
        where('userId', '==', user.uid)
      );
      const cartSnapshot = await getDocs(cartQuery);

      const cartItems: CartItemWithProduct[] = [];

      for (const cartDoc of cartSnapshot.docs) {
        const cartData = cartDoc.data();
        const product = await fetchProductById(cartData.productId);

        if (product) {
          cartItems.push({
            id: cartDoc.id,
            userId: cartData.userId,
            productId: cartData.productId,
            quantity: cartData.quantity || 1,
            createdAt: cartData.createdAt?.toDate() || new Date(),
            product,
          });
        }
      }

      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (!user) return;

    const existingItem = items.find((item) => item.productId === product.id);

    if (existingItem) {
      await updateQuantity(product.id, existingItem.quantity + quantity);
    } else {
      await addDoc(collection(db, 'cartItems'), {
        userId: user.uid,
        productId: product.id,
        quantity,
        createdAt: serverTimestamp(),
      });
      await fetchCart();
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    const item = items.find((i) => i.productId === productId);
    if (item) {
      await deleteDoc(doc(db, 'cartItems', item.id));
      setItems((prev) => prev.filter((item) => item.productId !== productId));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const item = items.find((i) => i.productId === productId);
    if (item) {
      await updateDoc(doc(db, 'cartItems', item.id), { quantity });
      setItems((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (!user) return;

    const deletePromises = items.map((item) =>
      deleteDoc(doc(db, 'cartItems', item.id))
    );
    await Promise.all(deletePromises);
    setItems([]);
  };

  const isInCart = (productId: string) => {
    return items.some((item) => item.productId === productId);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
