import { personalSignToken } from '.';
import { config } from '../../config';

describe(personalSignToken, () => {
  it('signs token using wallet client', async () => {
    const mockAddress = '0x123';
    const mockSignedMessage = '0x12345';

    const mockWalletClient = {
      signMessage: jest.fn().mockResolvedValue(mockSignedMessage),
    };

    // @ts-ignore
    const result = await personalSignToken(mockWalletClient, mockAddress);

    expect(mockWalletClient.signMessage).toHaveBeenCalledWith({
      account: mockAddress,
      message: config.web3AuthenticationMessage,
    });

    expect(result).toEqual(mockSignedMessage);
  });
});
