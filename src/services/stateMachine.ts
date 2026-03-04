export type ConversationState =
  | 'IDLE'
  | 'BROWSING'
  | 'CART'
  | 'CHECKOUT_ADDRESS'
  | 'CHECKOUT_DELIVERY'
  | 'CHECKOUT_PAYMENT'
  | 'CONFIRMATION_PENDING'
  | 'ORDER_PLACED'
  | 'CANCELLATION'
  | 'HUMAN_HANDOFF';

const transitions: Record<ConversationState, ConversationState[]> = {
  IDLE: ['BROWSING', 'HUMAN_HANDOFF'],
  BROWSING: ['CART', 'CHECKOUT_ADDRESS', 'IDLE', 'HUMAN_HANDOFF'],
  CART: ['BROWSING', 'CHECKOUT_ADDRESS', 'IDLE', 'HUMAN_HANDOFF'],
  CHECKOUT_ADDRESS: ['CHECKOUT_DELIVERY', 'CART', 'HUMAN_HANDOFF'],
  CHECKOUT_DELIVERY: ['CHECKOUT_PAYMENT', 'CHECKOUT_ADDRESS', 'HUMAN_HANDOFF'],
  CHECKOUT_PAYMENT: ['CONFIRMATION_PENDING', 'CHECKOUT_DELIVERY', 'HUMAN_HANDOFF'],
  CONFIRMATION_PENDING: ['ORDER_PLACED', 'CANCELLATION', 'CHECKOUT_PAYMENT', 'HUMAN_HANDOFF'],
  ORDER_PLACED: ['IDLE', 'CANCELLATION', 'HUMAN_HANDOFF'],
  CANCELLATION: ['IDLE', 'HUMAN_HANDOFF'],
  HUMAN_HANDOFF: ['IDLE']
};

export class StateMachine {
  canTransition(from: ConversationState, to: ConversationState): boolean {
    return transitions[from].includes(to);
  }

  transition(from: ConversationState, to: ConversationState): ConversationState {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid transition: ${from} -> ${to}`);
    }
    return to;
  }
}
