import catalogData from '../../data/catalog.json';
import { CartItem, EcommerceApi, Product } from './types';

export class MockEcommerceService implements EcommerceApi {
  private catalog: Product[] = catalogData as Product[];
  private carts = new Map<string, { id: string; userId: string; items: CartItem[] }>();
  private orders = new Map<string, { id: string; cartId: string; status: string; reason?: string }>();

  async searchProducts(query: string, language: string): Promise<Product[]> {
    const q = query.toLowerCase();
    return this.catalog.filter((p) =>
      Object.values(p.name).some((name) => name.toLowerCase().includes(q)) ||
      (p.name[language] || '').toLowerCase().includes(q)
    );
  }

  async getProduct(productId: string): Promise<Product | null> {
    return this.catalog.find((p) => p.id === productId) ?? null;
  }

  async getInventory(productId: string): Promise<number> {
    const p = await this.getProduct(productId);
    return p?.stock ?? 0;
  }

  async getPrice(productId: string, currency: string): Promise<number> {
    const p = await this.getProduct(productId);
    if (!p || p.currency !== currency) throw new Error('Price unavailable for currency');
    return p.price;
  }

  async createCart(userId: string) {
    const id = `cart_${Date.now()}`;
    const cart = { id, userId, items: [] as CartItem[] };
    this.carts.set(id, cart);
    return cart;
  }

  async addToCart(cartId: string, productId: string, qty: number) {
    const cart = this.carts.get(cartId);
    if (!cart) throw new Error('Cart not found');
    const stock = await this.getInventory(productId);
    if (stock < qty) throw new Error('Insufficient stock');
    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) existing.qty += qty;
    else cart.items.push({ productId, qty });
  }

  async removeFromCart(cartId: string, productId: string) {
    const cart = this.carts.get(cartId);
    if (!cart) throw new Error('Cart not found');
    cart.items = cart.items.filter((i) => i.productId !== productId);
  }

  async createOrder(cartId: string): Promise<{ id: string }> {
    if (!this.carts.get(cartId)) throw new Error('Cart not found');
    const id = `order_${Date.now()}`;
    this.orders.set(id, { id, cartId, status: 'PENDING_CONFIRMATION' });
    return { id };
  }

  async confirmOrder(orderId: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order) throw new Error('Order not found');
    order.status = 'CONFIRMED';
  }

  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order) throw new Error('Order not found');
    order.status = 'CANCELLED';
    order.reason = reason;
  }

  async getOrderStatus(orderId: string): Promise<string> {
    return this.orders.get(orderId)?.status ?? 'UNKNOWN';
  }
}
