import { personalSignToken } from '.';
import { config } from '../../config';

describe('personalSignToken', () => {
  const address = '0x00';
  const signedWeb3Token = '0x0098';

  it('verifies sendAsync params', async function () {
    const sendAsync = jest.fn((params, callback) => {
      callback(null, { result: signedWeb3Token });
    });
    const provider = {
      sendAsync,
    };

    await personalSignToken({ provider }, address);

    expect(sendAsync).toHaveBeenCalledWith(
      {
        from: address,
        method: 'personal_sign',
        params: [
          config.web3AuthenticationMessage,
          address,
        ],
      },
      expect.any(Function)
    );
  });

  it('verifies token returned', async function () {
    const provider = {
      sendAsync: (params, callback) => {
        callback(null, { result: signedWeb3Token });
      },
    };

    const result = await personalSignToken({ provider }, address);

    expect(result).toEqual(signedWeb3Token);
  });

  it('verifies exception ', async function () {
    const expectation = 'web3 provider failure';
    const provider = {
      sendAsync: (params, callback) => {
        callback(expectation);
      },
    };

    await personalSignToken({ provider }, address).catch((error) => {
      expect(error).toEqual(expectation);
    });
  });
});
