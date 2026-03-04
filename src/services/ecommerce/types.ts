export interface Product {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: number;
  currency: string;
  stock: number;
}

export interface CartItem { productId: string; qty: number; }

export interface EcommerceApi {
  searchProducts(query: string, language: string): Promise<Product[]>;
  getProduct(productId: string): Promise<Product | null>;
  getInventory(productId: string): Promise<number>;
  getPrice(productId: string, currency: string): Promise<number>;
  createCart(userId: string): Promise<{ id: string; userId: string; items: CartItem[] }>;
  addToCart(cartId: string, productId: string, qty: number): Promise<void>;
  removeFromCart(cartId: string, productId: string): Promise<void>;
  createOrder(cartId: string, address: string, deliveryOption: string, paymentMethod: string): Promise<{ id: string }>;
  confirmOrder(orderId: string): Promise<void>;
  cancelOrder(orderId: string, reason?: string): Promise<void>;
  getOrderStatus(orderId: string): Promise<string>;
}
