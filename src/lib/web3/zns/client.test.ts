import { ZnsClient } from './client';

describe('ZnsClient', () => {
  const subject = () => new ZnsClient({});

  it('does not fuck around', () => {
    console.log('provider: ', subject());
    expect(true).toBe(true);
  });
});
