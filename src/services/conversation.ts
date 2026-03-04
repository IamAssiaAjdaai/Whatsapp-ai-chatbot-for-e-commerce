import { prisma } from '../db/prisma';
import { classifyIntent } from './ai';
import { detectLanguage } from '../utils/language';
import { MockEcommerceService } from './ecommerce/mockEcommerce';
import { StateMachine } from './stateMachine';

const ecommerce = new MockEcommerceService();
const stateMachine = new StateMachine();

export async function handleConversation(phoneNumber: string, text: string) {
  const language = detectLanguage(text);
  const user = await prisma.user.upsert({
    where: { phoneNumber },
    update: { preferredLang: language },
    create: { phoneNumber, preferredLang: language }
  });

  const result = await classifyIntent(text, language);
  let reply = 'How can I help with your order today?';

  if (result.intent === 'SEARCH_PRODUCTS') {
    const query = result.entities?.query || text;
    const products = await ecommerce.searchProducts(query, language);
    reply = products.length
      ? products.map((p) => `${p.id}: ${p.name[language] || p.name.en} - ${p.price} ${p.currency}`).join('\n')
      : 'No matching products found.';
  }

  if (result.intent === 'ADD_TO_CART') {
    const cart = await ecommerce.createCart(user.id);
    await ecommerce.addToCart(cart.id, result.entities.productId, Number(result.entities.qty || 1));
    stateMachine.transition(user.state as any, 'CART');
    await prisma.user.update({ where: { id: user.id }, data: { state: 'CART', lastStateUpdate: new Date() } });
    reply = 'Item added to cart. Reply "checkout" to continue.';
  }

  if (result.intent === 'START_CHECKOUT') {
    stateMachine.transition(user.state as any, 'CHECKOUT_ADDRESS');
    await prisma.user.update({ where: { id: user.id }, data: { state: 'CHECKOUT_ADDRESS', lastStateUpdate: new Date() } });
    reply = 'Please share your delivery address.';
  }

  if (result.intent === 'CONFIRM_ORDER') {
    reply = 'Please confirm order details (items, total, address, delivery, payment). Reply CONFIRM to place.';
  }

  if (result.intent === 'CANCEL_ORDER') {
    reply = 'Please provide order ID to cancel. Cancellation requires confirmation.';
  }

  if (result.intent === 'HANDOFF') {
    await prisma.user.update({ where: { id: user.id }, data: { state: 'HUMAN_HANDOFF', lastStateUpdate: new Date() } });
    reply = 'Connecting you to a human support agent.';
  }

  return { reply, language, intent: result.intent };
}
