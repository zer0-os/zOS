import { expectSaga } from 'redux-saga-test-plan';
import { select } from 'redux-saga/effects';

import { saga } from './saga';
import { nextStage, previousStage, SendStage, setSendStage, setRecipient, setToken, setAmount } from '.';
import {
  recipientSelector,
  sendStageSelector,
  amountSelector,
  tokenSelector,
  walletSelector,
  selectedWalletAddressSelector,
} from './selectors';

describe('wallet saga', () => {
  describe('next', () => {
    it('moves from search to token if recipient is set', () => {
      return expectSaga(saga)
        .provide([
          [select(sendStageSelector), SendStage.Search],
          [select(recipientSelector), '0x1234567890'],
          [
            select(walletSelector),
            {
              selectedWallet: {
                address: '0x1234567890',
                label: null,
              },
            },
          ],
          [select(selectedWalletAddressSelector), '0x1234567890'],
        ])
        .put(setSendStage(SendStage.Token))
        .dispatch(nextStage())
        .run();
    });

    it('does not move from search to token if recipient is not set', () => {
      return expectSaga(saga)
        .provide([
          [select(sendStageSelector), SendStage.Search],
          [select(recipientSelector), null],
          [
            select(walletSelector),
            {
              selectedWallet: {
                address: '0x1234567890',
                label: null,
              },
            },
          ],
          [select(selectedWalletAddressSelector), '0x1234567890'],
        ])
        .not.put(setSendStage(SendStage.Token))
        .dispatch(nextStage())
        .run();
    });

    it('moves from token to amount if token is set', () => {
      return expectSaga(saga)
        .provide([
          [select(sendStageSelector), SendStage.Token],
          [
            select(tokenSelector),
            {
              tokenAddress: '0xABCDEF1234',
              symbol: 'ABC',
              name: 'ABC Token',
              amount: '100',
              decimals: 18,
            },
          ],
          [
            select(walletSelector),
            {
              selectedWallet: {
                address: '0x1234567890',
                label: null,
              },
            },
          ],
          [select(selectedWalletAddressSelector), '0x1234567890'],
        ])
        .put(setSendStage(SendStage.Amount))
        .dispatch(nextStage())
        .run();
    });

    it('moves from amount to confirm if amount is set', () => {
      return expectSaga(saga)
        .provide([
          [select(sendStageSelector), SendStage.Amount],
          [select(amountSelector), '123'],
          [
            select(walletSelector),
            {
              selectedWallet: {
                address: '0x1234567890',
                label: null,
              },
            },
          ],
          [select(selectedWalletAddressSelector), '0x1234567890'],
        ])
        .put(setSendStage(SendStage.Confirm))
        .dispatch(nextStage())
        .run();
    });
  });

  describe('previous', () => {
    it('moves from confirm to amount and clears amount', () => {
      return expectSaga(saga)
        .provide([
          [select(sendStageSelector), SendStage.Confirm],
          [
            select(walletSelector),
            {
              selectedWallet: {
                address: '0x1234567890',
                label: null,
              },
            },
          ],
          [select(selectedWalletAddressSelector), '0x1234567890'],
        ])
        .put(setAmount(null))
        .put(setSendStage(SendStage.Amount))
        .dispatch(previousStage())
        .run();
    });

    it('moves from amount to token and clears token info', () => {
      return expectSaga(saga)
        .provide([
          [select(sendStageSelector), SendStage.Amount],
          [
            select(walletSelector),
            {
              selectedWallet: {
                address: '0x1234567890',
                label: null,
              },
            },
          ],
          [select(selectedWalletAddressSelector), '0x1234567890'],
        ])
        .put(setToken(null))
        .put(setSendStage(SendStage.Token))
        .dispatch(previousStage())
        .run();
    });

    it('moves from token to search and clears recipient', () => {
      return expectSaga(saga)
        .provide([
          [select(sendStageSelector), SendStage.Token],
          [
            select(walletSelector),
            {
              selectedWallet: {
                address: '0x1234567890',
                label: null,
              },
            },
          ],
          [select(selectedWalletAddressSelector), '0x1234567890'],
        ])
        .put(setRecipient(null))
        .put(setSendStage(SendStage.Search))
        .dispatch(previousStage())
        .run();
    });

    it('does not move back from search', () => {
      return expectSaga(saga)
        .provide([
          [select(sendStageSelector), SendStage.Search],
          [
            select(walletSelector),
            {
              selectedWallet: {
                address: '0x1234567890',
                label: null,
              },
            },
          ],
          [select(selectedWalletAddressSelector), '0x1234567890'],
        ])
        .not.put(setSendStage(SendStage.Search))
        .dispatch(previousStage())
        .run();
    });
  });
});
