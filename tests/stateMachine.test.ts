import { StateMachine } from '../src/services/stateMachine';

describe('StateMachine', () => {
  it('allows valid transition', () => {
    const sm = new StateMachine();
    expect(sm.transition('IDLE', 'BROWSING')).toBe('BROWSING');
  });

  it('throws on invalid transition', () => {
    const sm = new StateMachine();
    expect(() => sm.transition('IDLE', 'ORDER_PLACED')).toThrow();
  });
});
