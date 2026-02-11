# NFT Transfer Implementation Plan

This document outlines the implementation plan for adding NFT transfer functionality to the zOS wallet app using the existing Send flow.

## Overview

**Goal:** Allow users to send NFTs (ERC-721 initially, ERC-1155 later) from the wallet app.

**Approach:** Extend the existing Send flow with a Tokens/NFTs tab at the asset selection stage.

**Current State:**

- Backend endpoint exists: `POST /api/wallet/:address/transactions/transfer-nft`
- Frontend API call exists: `src/apps/wallet/queries/transferNFTRequest.ts`
- NFT types exist with `tokenType` and `quantity` fields
- Token transfer flow exists and will be extended

---

## Flow Diagram

```
                    ┌─────────────────────────────────────┐
                    │           Search Stage              │
                    │     (Select Recipient - reuse)      │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │           Token Stage               │
                    │  ┌─────────────┬─────────────┐      │
                    │  │   Tokens    │    NFTs     │      │
                    │  │    Tab      │    Tab      │      │
                    │  └──────┬──────┴──────┬──────┘      │
                    └─────────┼─────────────┼─────────────┘
                              │             │
              ┌───────────────▼──┐    ┌─────▼────────────────┐
              │   Amount Stage   │    │   SKIP (ERC-721)     │
              │   (Token only)   │    │   or Amount (1155)   │
              └────────┬─────────┘    └──────────┬───────────┘
                       │                         │
                       └───────────┬─────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │        Confirm Stage        │
                    │  (Adapt for Token vs NFT)   │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   Processing / Broadcasting │
                    │         (reuse)             │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      Success / Error        │
                    │    (Adapt for Token vs NFT) │
                    └─────────────────────────────┘
```

---

## Phase 1: ERC-721 Implementation

### Step 1: Redux State Changes

**File:** `src/store/wallet/index.ts`

```typescript
// Add to imports
import { NFT } from '../../apps/wallet/types';

// Update WalletState type
export type WalletState = {
  // ... existing fields
  nft: NFT | null;  // NEW
};

// Update initialState
const initialState: WalletState = {
  // ... existing fields
  nft: null,
};

// Add to SagaActionTypes
export enum SagaActionTypes {
  // ... existing
  TransferNft = 'wallet/saga/transferNft',  // NEW
}

// Add new reducer in slice.reducers
setNft: (state, action: PayloadAction<NFT | null>) => {
  state.nft = action.payload;
},

// Update reset reducer
reset: (state) => {
  // ... existing resets
  state.nft = initialState.nft;
},

// Export new action
export const transferNft = createAction(SagaActionTypes.TransferNft);
export const { setNft } = slice.actions;  // Add to exports
```

**File:** `src/store/wallet/selectors.ts`

```typescript
// Add selector
export const nftSelector = (state: RootState) => state.wallet.nft;
```

---

### Step 2: Saga Changes

**File:** `src/store/wallet/saga.ts`

```typescript
// Add imports
import { transferNFTRequest } from '../../apps/wallet/queries/transferNFTRequest';
import { nftSelector } from './selectors';
import { setNft, transferNft } from '.';
import { NFT } from '../../apps/wallet/types';

// Modify handleNext - skip Amount stage when NFT is selected
function* handleNext() {
  const stage: SendStage = yield select(sendStageSelector);
  const nft: NFT | null = yield select(nftSelector);

  switch (stage) {
    case SendStage.Search: {
      const recipient = yield select(recipientSelector);
      if (recipient) {
        yield put(setSendStage(SendStage.Token));
      }
      break;
    }
    case SendStage.Token: {
      const token = yield select(tokenSelector);
      if (nft) {
        // NFT selected - skip Amount, go straight to Confirm
        yield put(setSendStage(SendStage.Confirm));
      } else if (token) {
        // Token selected - go to Amount
        yield put(setSendStage(SendStage.Amount));
      }
      break;
    }
    case SendStage.Amount: {
      const amount = yield select(amountSelector);
      if (amount) {
        yield put(setSendStage(SendStage.Confirm));
      }
      break;
    }
  }
}

// Modify handlePrevious - handle NFT flow
function* handlePrevious() {
  const stage: SendStage = yield select(sendStageSelector);
  const nft: NFT | null = yield select(nftSelector);

  switch (stage) {
    case SendStage.Confirm:
      if (nft) {
        // NFT flow - go back to Token selection (skip Amount)
        yield put(setNft(null));
        yield put(setSendStage(SendStage.Token));
      } else {
        // Token flow - go back to Amount
        yield put(setAmount(null));
        yield put(setSendStage(SendStage.Amount));
      }
      break;
    case SendStage.Amount:
      yield put(setToken(null));
      yield put(setSendStage(SendStage.Token));
      break;
    case SendStage.Token:
      yield put(setRecipient(null));
      yield put(setNft(null)); // Clear NFT too
      yield put(setToken(null));
      yield put(setSendStage(SendStage.Search));
      break;
    case SendStage.Search:
      break;
  }
}

// Add new saga for NFT transfer
function* handleTransferNft() {
  const stage: SendStage = yield select(sendStageSelector);

  try {
    if (stage === SendStage.Confirm) {
      const recipient: Recipient = yield select(recipientSelector);
      const selectedWallet: string | undefined = yield select(selectedWalletAddressSelector);
      const nft: NFT = yield select(nftSelector);

      if (recipient && nft && selectedWallet) {
        yield put(setSendStage(SendStage.Processing));

        const result = yield call(() =>
          transferNFTRequest(selectedWallet, recipient.publicAddress, nft.id, nft.collectionAddress)
        );

        if (result.transactionHash) {
          yield put(setSendStage(SendStage.Broadcasting));
          // Note: NFT doesn't have chainId currently - may need to add or use default
          const receipt: TxReceiptResponse = yield call(() =>
            queryClient.fetchQuery(txReceiptQueryOptions(result.transactionHash))
          );
          yield put(setTxReceipt(receipt));
          if (receipt.status === 'confirmed') {
            yield put(setSendStage(SendStage.Success));
          } else {
            yield put(setSendStage(SendStage.Error));
          }
        } else {
          yield put(setSendStage(SendStage.Error));
        }
      }
    }
  } catch (e) {
    if (isWalletAPIError(e)) {
      yield put(setErrorCode(e.response.body.code));
    }
    yield put(setError(true));
    yield put(setSendStage(SendStage.Error));
  }
}

// Register in saga
export function* saga() {
  yield fork(initializeWalletSaga);
  yield takeLatest(nextStage.type, handleNext);
  yield takeLatest(previousStage.type, handlePrevious);
  yield takeLatest(transferToken.type, handleTransferToken);
  yield takeLatest(transferNft.type, handleTransferNft); // NEW
}
```

---

### Step 3: Token Selection with Tabs

**File:** `src/apps/wallet/send/token-select/wallet-token-select.tsx`

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { nextStage, previousStage, setToken, setNft } from '../../../../store/wallet';
import { SendHeader } from '../components/send-header';
import { Input } from '@zero-tech/zui/components';
import { IconSearchMd } from '@zero-tech/zui/icons';
import { useState } from 'react';
import { useBalancesQuery } from '../../queries/useBalancesQuery';
import { useNFTsQuery } from '../../queries/useNFTsQuery';
import { Token } from '../../tokens/token';
import { NFTTile } from '../../nfts/nft/nft-tile'; // or create simplified version
import { TokenBalance, NFT } from '../../types';
import { recipientSelector, selectedWalletSelector } from '../../../../store/wallet/selectors';
import { truncateAddress } from '../../utils/address';

import styles from './wallet-token-select.module.scss';

type AssetTab = 'tokens' | 'nfts';

export const WalletTokenSelect = () => {
  const dispatch = useDispatch();
  const [assetQuery, setAssetQuery] = useState('');
  const [activeTab, setActiveTab] = useState<AssetTab>('tokens');
  const selectedWallet = useSelector(selectedWalletSelector);
  const recipient = useSelector(recipientSelector);

  const { data: balancesData } = useBalancesQuery(selectedWallet.address);
  const { nfts } = useNFTsQuery(selectedWallet.address);

  const filteredTokens = balancesData?.tokens?.filter((asset) =>
    asset.name.toLowerCase().includes(assetQuery.toLowerCase())
  );

  const filteredNfts = nfts?.filter(
    (nft) =>
      nft.metadata?.name?.toLowerCase().includes(assetQuery.toLowerCase()) ||
      nft.collectionName?.toLowerCase().includes(assetQuery.toLowerCase())
  );

  const handleTokenClick = (token: TokenBalance) => {
    dispatch(setNft(null)); // Clear any selected NFT
    dispatch(setToken(token));
    dispatch(nextStage());
  };

  const handleNftClick = (nft: NFT) => {
    dispatch(setToken(null)); // Clear any selected token
    dispatch(setNft(nft));
    dispatch(nextStage()); // Saga will skip Amount stage
  };

  const handleBack = () => {
    dispatch(previousStage());
  };

  return (
    <div className={styles.container}>
      <SendHeader title='Select Asset' onBack={handleBack} />

      <div className={styles.content}>
        {/* Tab switcher */}
        <div className={styles.tabSwitcher}>
          <button
            className={`${styles.tab} ${activeTab === 'tokens' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('tokens')}
          >
            Tokens
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'nfts' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('nfts')}
          >
            NFTs
          </button>
        </div>

        <div className={styles.inputContainer}>
          <Input
            type='text'
            placeholder='Search...'
            value={assetQuery}
            onChange={setAssetQuery}
            endEnhancer={<IconSearchMd size={16} />}
          />
        </div>

        <div className={styles.resultsContainer}>
          {activeTab === 'tokens' && (
            <div className={styles.resultsHeader}>
              <div className={styles.resultsHeaderLabel}>Tokens</div>
              <div>
                {filteredTokens?.map((asset) => (
                  <Token
                    key={asset.tokenAddress + asset.chainId}
                    token={asset}
                    onClick={() => handleTokenClick(asset)}
                  />
                ))}
                {filteredTokens?.length === 0 && <div className={styles.emptyState}>No tokens found</div>}
              </div>
            </div>
          )}

          {activeTab === 'nfts' && (
            <div className={styles.resultsHeader}>
              <div className={styles.resultsHeaderLabel}>NFTs</div>
              <div className={styles.nftGrid}>
                {filteredNfts?.map((nft) => (
                  <NFTSelectItem
                    key={`${nft.collectionAddress}-${nft.id}`}
                    nft={nft}
                    onClick={() => handleNftClick(nft)}
                  />
                ))}
                {filteredNfts?.length === 0 && <div className={styles.emptyState}>No NFTs found</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer showing recipient - same as before */}
      <div className={styles.footer}>{/* ... existing footer code ... */}</div>
    </div>
  );
};

// Simple NFT item for selection list
const NFTSelectItem = ({ nft, onClick }: { nft: NFT; onClick: () => void }) => {
  return (
    <button className={styles.nftSelectItem} onClick={onClick}>
      {nft.imageUrl ? (
        <img src={nft.imageUrl} alt={nft.metadata?.name} className={styles.nftImage} />
      ) : (
        <div className={styles.nftImagePlaceholder} />
      )}
      <div className={styles.nftInfo}>
        <div className={styles.nftName}>{nft.metadata?.name || 'Unnamed'}</div>
        <div className={styles.nftCollection}>{nft.collectionName}</div>
      </div>
    </button>
  );
};
```

**File:** `src/apps/wallet/send/token-select/wallet-token-select.module.scss`

Add styles for tabs and NFT grid:

```scss
.tabSwitcher {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab {
  flex: 1;
  padding: 12px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: var(--color-background-secondary);
  }
}

.tabActive {
  background: var(--color-primary);
  color: var(--color-text-primary);
  border-color: var(--color-primary);
}

.nftGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.nftSelectItem {
  display: flex;
  flex-direction: column;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: var(--color-background-secondary);
  }
}

.nftImage {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
}

.nftImagePlaceholder {
  width: 100%;
  aspect-ratio: 1;
  background: var(--color-background-secondary);
  border-radius: 4px;
}

.nftInfo {
  margin-top: 8px;
}

.nftName {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nftCollection {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.emptyState {
  padding: 24px;
  text-align: center;
  color: var(--color-text-secondary);
}
```

---

### Step 4: Review Transfer Component

**File:** `src/apps/wallet/send/review-transfer/wallet-review-transfer.tsx`

Update to handle both Token and NFT:

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { previousStage, transferToken, transferNft } from '../../../../store/wallet';
import styles from './wallet-review-transfer.module.scss';
import { SendHeader } from '../components/send-header';
import { amountSelector, recipientSelector, tokenSelector, nftSelector } from '../../../../store/wallet/selectors';
import { MatrixAvatar } from '../../../../components/matrix-avatar';
import { TokenIcon } from '../../components/token-icon/token-icon';
import { FormattedNumber } from '../../components/formatted-number/formatted-number';
import { Button } from '../../components/button/button';
import { IconChevronRightDouble } from '@zero-tech/zui/icons';

export const WalletReviewTransfer = () => {
  const dispatch = useDispatch();
  const recipient = useSelector(recipientSelector);
  const token = useSelector(tokenSelector);
  const amount = useSelector(amountSelector);
  const nft = useSelector(nftSelector);

  const isNftTransfer = nft !== null;

  const handleBack = () => {
    dispatch(previousStage());
  };

  const handleConfirm = () => {
    if (isNftTransfer) {
      dispatch(transferNft());
    } else {
      dispatch(transferToken());
    }
  };

  return (
    <div className={styles.container}>
      <SendHeader title='Review' onBack={handleBack} />

      <div className={styles.content}>
        <div className={styles.confirmRecipient}>
          <div className={styles.confirmRecipientTitle}>Confirm transaction with</div>
          <MatrixAvatar className={styles.recipientAvatar} imageURL={recipient?.profileImage} size='regular' />
          <div className={styles.recipientName}>{recipient?.primaryZid || recipient?.name}</div>
          <div className={styles.recipientAddress}>{recipient?.publicAddress}</div>
        </div>

        {isNftTransfer ? (
          // NFT Transfer Details
          <div className={styles.nftTransferDetails}>
            <div className={styles.nftPreview}>
              {nft.imageUrl ? (
                <img src={nft.imageUrl} alt={nft.metadata?.name} className={styles.nftImage} />
              ) : (
                <div className={styles.nftImagePlaceholder} />
              )}
            </div>
            <div className={styles.nftInfo}>
              <div className={styles.nftName}>{nft.metadata?.name || 'Unnamed NFT'}</div>
              <div className={styles.nftCollection}>{nft.collectionName}</div>
              <div className={styles.nftTokenId}>Token ID: {nft.id}</div>
            </div>
          </div>
        ) : (
          // Token Transfer Details (existing)
          <div className={styles.transferDetails}>
            <div className={styles.tokenInfo}>
              <TokenIcon url={token.logo} name={token.name} chainId={token.chainId} />
              <div className={styles.tokenName}>{token.name}</div>
              <div className={styles.tokenAmount}>
                <FormattedNumber value={amount} />
              </div>
            </div>

            <div className={styles.tokenInfoSeparator}>
              <IconChevronRightDouble />
            </div>

            <div className={styles.tokenInfo}>
              <TokenIcon url={token.logo} name={token.name} chainId={token.chainId} />
              <div className={styles.tokenName}>{token.name}</div>
              <div className={styles.tokenAmount}>
                <FormattedNumber value={amount} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.confirmButton}>
        <div className={styles.confirmButtonText}>Review the above before confirming.</div>
        <div className={styles.confirmButtonText}>Once made, your transaction is irreversible.</div>
        <Button onClick={handleConfirm}>Confirm</Button>
      </div>
    </div>
  );
};
```

Add NFT-specific styles to `wallet-review-transfer.module.scss`.

---

### Step 5: Success Screen

**File:** `src/apps/wallet/send/success/wallet-transfer-success.tsx`

Update to handle both Token and NFT:

```typescript
// Add to imports
import { nftSelector } from '../../../../store/wallet/selectors';

// In component
const nft = useSelector(nftSelector);
const isNftTransfer = nft !== null;

// In JSX, conditionally render token hero or NFT hero
{
  isNftTransfer ? (
    <div className={styles.nftHero}>
      {nft.imageUrl && <img src={nft.imageUrl} alt={nft.metadata?.name} className={styles.nftSuccessImage} />}
      <div className={styles.nftSuccessName}>{nft.metadata?.name || 'NFT'}</div>
      <div className={styles.nftSuccessCollection}>{nft.collectionName}</div>
    </div>
  ) : (
    // Existing token hero
    <div className={styles.tokenHero}>{/* ... existing token code ... */}</div>
  );
}
```

---

## Implementation Checklist

### Phase 1: ERC-721

- [x] **Step 1: Redux State** ✅

  - [x] Add `nft: NFT | null` to WalletState in `src/store/wallet/index.ts`
  - [x] Add `setNft` reducer
  - [x] Add `TransferNft` to SagaActionTypes
  - [x] Add `transferNft` saga action
  - [x] Update `reset` reducer to clear nft
  - [x] Add `nftSelector` to `src/store/wallet/selectors.ts`

- [x] **Step 2: Saga** ✅

  - [x] Update `handleNext` to skip Amount stage for NFTs
  - [x] Update `handlePrevious` to handle NFT flow
  - [x] Add `handleTransferNft` saga
  - [x] Register `transferNft` in root saga

- [x] **Step 3: Token Selection with Tabs** ✅

  - [x] Add tab state and switcher UI
  - [x] Import and use `useNFTsQuery`
  - [x] Add NFT grid with clickable items
  - [x] Wire up `handleNftClick` to dispatch `setNft` and `nextStage`
  - [x] Add SCSS for tabs and NFT grid

- [x] **Step 4: Review Screen** ✅

  - [x] Import `nftSelector`
  - [x] Add conditional rendering for NFT vs Token
  - [x] Wire up confirm button to dispatch `transferNft` for NFTs
  - [x] Add NFT-specific styles

- [x] **Step 5: Success Screen** ✅

  - [x] Import `nftSelector`
  - [x] Add conditional rendering for NFT success view
  - [x] Add NFT-specific styles

- [x] **Testing** ✅
  - [x] Test token flow still works
  - [x] Test NFT selection skips Amount stage
  - [x] Test back navigation works correctly (NFT flow goes Confirm → Token)
  - [ ] Test NFT transfer calls correct API (requires E2E/integration test)
  - [ ] Test reset clears NFT state (covered by existing reset logic)

---

## Phase 2: ERC-1155 (Future)

### Backend Changes Required

- Create `send-erc-1155.ts` transaction builder using `safeTransferFrom(from, to, id, amount, data)`
- Update endpoint to accept `amount` parameter for ERC-1155

### Frontend Changes Required

- Add `nftAmount: string | null` to Redux state
- Show Amount stage for ERC-1155 tokens (check `nft.tokenType === 'ERC-1155'`)
- Validate amount <= nft.quantity
- Update `transferNFTRequest` to include amount parameter
- Update saga to pass amount for ERC-1155

---

## Questions Resolved

1. **Entry Point:** Use existing Send flow with tabs - unified experience
2. **Amount for ERC-721:** Skip Amount stage (always transfer 1)
3. **Amount for ERC-1155:** Show Amount stage, validate against quantity (Phase 2)

## Open Questions

1. **Chain ID for NFTs:** Currently NFT type doesn't have chainId - may need to add or use default
2. **NFT loading state:** Show skeleton while NFTs load?
3. **Empty states:** What to show if user has no NFTs?
