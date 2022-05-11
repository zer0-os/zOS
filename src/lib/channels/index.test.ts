import { Client } from '.';

describe('channels client', () => {
  const subject = (connection) => new Client(connection || {});

  it('calls init on connection', () => {
    const connection = { init: jest.fn() };

    const address = '0x000000000000000000000000000000000000000A';

    subject(connection).connect(address);

    expect(connection.init).toHaveBeenCalledWith(address);
  });
});
