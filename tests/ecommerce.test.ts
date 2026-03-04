import { MockEcommerceService } from '../src/services/ecommerce/mockEcommerce';

describe('MockEcommerceService', () => {
  it('searches catalog', async () => {
    const api = new MockEcommerceService();
    const products = await api.searchProducts('dress', 'en');
    expect(products.length).toBeGreaterThan(0);
  });

  it('creates cart and adds item', async () => {
    const api = new MockEcommerceService();
    const cart = await api.createCart('u1');
    await api.addToCart(cart.id, 'p1', 1);
    expect(cart.items[0].productId).toBe('p1');
  });
});
