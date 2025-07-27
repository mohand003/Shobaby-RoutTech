import { Product } from './product.interface';

export interface CartProduct {
  productId: number;
  quantity: number;
}

export interface Cart {
  id: number;
  userId: number;
  date: string;
  products: CartProduct[];
}

export interface CartWithProducts extends Omit<Cart, 'products'> {
  products: (CartProduct & { product: Product })[];
  totalItems: number;
  totalPrice: number;
}