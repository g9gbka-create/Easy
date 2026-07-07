export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  images: string[];
  categoryId: string | null;
  stock: number;
  isNew: boolean;
  isPopular: boolean;
  createdAt: Date;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
}

export interface Profile {
  id: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  createdAt: Date;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface FavoriteWithProduct extends Favorite {
  product: Product;
}
