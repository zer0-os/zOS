import { useSelector } from 'react-redux';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import {
  CHAIN_ID_ZCHAIN,
  CHAIN_ID_ZEPHYR,
  CHAIN_ID_ETHEREUM,
  CHAIN_ID_SEPOLIA,
  openExplorerForTransaction,
  getChainIdFromName,
} from '../lib/utils';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { useBridgeStatus } from '../hooks/useBridgeStatus';
import { useBridgeMerkleProof } from '../hooks/useBridgeMerkleProof';
import { useFinalizeBridge } from '../hooks/useFinalizeBridge';
import { useFinalizeBridgeFromEOA } from '../hooks/useFinalizeBridgeFromEOA';
import { TransactionLoadingSpinner } from '../../send/components/transaction-loading-spinner';
import { useAccount } from 'wagmi';
import { Button } from '../../components/button/button';
import { IconClockRewind, IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';

import styles from './wallet-bridge-processing.module.scss';

interface WalletBridgeProcessingProps {
  depositCount: number | undefined;
  fromChainId: number;
  onClose: () => void;
}

// Bridge network IDs used by the bridge API
const BRIDGE_NETWORK_IDS: Record<number, number> = {
  [CHAIN_ID_ETHEREUM]: 0,
  [CHAIN_ID_SEPOLIA]: 0,
  [CHAIN_ID_ZCHAIN]: 14,
  [CHAIN_ID_ZEPHYR]: 25,
};

// Get the bridge network ID for a given chain ID
function getNetIdFromChainId(chainId: number): number {
  return BRIDGE_NETWORK_IDS[chainId] ?? 0;
}

export const WalletBridgeProcessing = ({ depositCount, fromChainId, onClose }: WalletBridgeProcessingProps) => {
  const currentUser = useSelector(currentUserSelector);
  const zeroWalletAddress = currentUser?.zeroWalletAddress;
  const { address: eoaAddress } = useAccount();

  const { data: status, isLoading: isLoadingStatus } = useBridgeStatus({
    zeroWalletAddress,
    depositCount,
    fromChainId,
    enabled: true,
    refetchInterval: false,
  });

  // Derive chain IDs from status data (single source of truth)
  const statusFromChainId = status ? getChainIdFromName(status.fromChain) : fromChainId;
  const statusToChainId = status ? getChainIdFromName(status.toChain) : 0;

  const isZChainToEthereum =
    (statusFromChainId === CHAIN_ID_ZCHAIN || statusFromChainId === CHAIN_ID_ZEPHYR) &&
    (statusToChainId === CHAIN_ID_ETHEREUM || statusToChainId === CHAIN_ID_SEPOLIA);

  const needsMerkleProof = isZChainToEthereum && status?.readyForClaim && !status?.claimTxHash;
  const { data: merkleProof, isLoading: merkleProofLoading } = useBridgeMerkleProof({
    zeroWalletAddress,
    depositCount: status?.depositCount,
    netId: getNetIdFromChainId(statusFromChainId),
    fromChainId: statusFromChainId,
    enabled: needsMerkleProof,
  });

  // Use EOA hook for L2->L1 bridges, API hook for other cases
  const finalizeFromEOA = useFinalizeBridgeFromEOA({
    onSuccess: () => {
      // Finalization complete - user can check activity list for updated status
    },
    onError: (error) => {
      console.error('Finalization error:', error);
    },
  });

  const finalizeMutation = useFinalizeBridge({
    eoaAddress,
    onSuccess: () => {
      // Finalization complete - user can check activity list for updated status
    },
  });

  const onFinalize = async () => {
    if (!status || !merkleProof) return;

    // For L2->L1 bridges, use EOA wallet interaction
    if (isZChainToEthereum && eoaAddress) {
      try {
        await finalizeFromEOA.finalizeBridgeFromEOA({
          status,
          merkleProof,
          toChainId: statusToChainId,
          fromChainId: statusFromChainId,
          eoaAddress,
        });
      } catch (error) {
        // Error is already handled by the hook's onError callback
        console.error('Failed to finalize bridge from EOA:', error);
      }
    } else {
      // For other cases, use API-based finalization
      finalizeMutation.mutate({
        status,
        merkleProof,
        toChainId: statusToChainId,
      });
    }
  };

  const onViewTransaction = () => {
    if (status?.transactionHash) {
      openExplorerForTransaction(status.transactionHash, statusFromChainId, status?.explorerUrl);
    }
  };

  const isProcessing = status?.status === 'processing';
  const isReadyForClaim = status?.status === 'on-hold' && status?.readyForClaim;
  const isFinalizing = isZChainToEthereum ? finalizeFromEOA.isFinalizing : finalizeMutation.isPending;
  const finalizationStarted = isZChainToEthereum
    ? finalizeFromEOA.isPending || finalizeFromEOA.isFinalizing
    : finalizeMutation.isSuccess || finalizeMutation.isPending;
  const finalizeError = isZChainToEthereum ? finalizeFromEOA.error : finalizeMutation.error;
  const showFinalizeContent = isReadyForClaim && isZChainToEthereum && !finalizationStarted;
  const isLoading = isLoadingStatus || (needsMerkleProof && merkleProofLoading);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <BridgeHeader title='Bridge' action={<IconButton Icon={IconXClose} onClick={onClose} />} />
        <div className={styles.content}>
          <TransactionLoadingSpinner />
          <div className={styles.title}>{isLoadingStatus ? 'Loading bridge status...' : 'Loading merkle proof...'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BridgeHeader title='Bridge' action={<IconButton Icon={IconXClose} onClick={onClose} />} />
      <div className={styles.content}>
        <TransactionLoadingSpinner />

        {showFinalizeContent ? (
          <>
            <div className={styles.title}>Bridge is ready to finalize</div>
            <div className={styles.subtitle}>Complete the bridge by finalizing on Ethereum.</div>
            <div className={styles.buttonGroup}>
              {merkleProof ? (
                <>
                  <Button onClick={onFinalize} disabled={isFinalizing}>
                    {isFinalizing ? 'Finalizing...' : 'Finalize Bridge'}
                  </Button>
                  {status?.transactionHash && (
                    <Button onClick={onViewTransaction} variant='secondary'>
                      View on Explorer
                    </Button>
                  )}
                </>
              ) : (
                <div className={styles.subtitle}>Preparing finalization...</div>
              )}
            </div>
            {finalizeError && <div className={styles.errorText}>{finalizeError?.message || 'Finalization failed'}</div>}
            <div className={styles.infoText}>Track the progress of this bridge in your activity list.</div>
            <div className={styles.buttonGroup}>
              <Button onClick={onClose} variant='secondary' icon={<IconClockRewind size={18} />}>
                Activity
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.title}>
              {finalizationStarted ? 'Finalization started' : 'Bridge transaction is being processed'}
            </div>
            <div className={styles.subtitle}>
              {finalizationStarted
                ? 'Check your activity list for the latest status.'
                : 'This may take a few minutes, up to 30 minutes.'}
            </div>
            <div className={styles.buttonGroup}>
              {isProcessing && status?.transactionHash && !finalizationStarted && (
                <Button onClick={onViewTransaction} variant='secondary'>
                  View on Explorer
                </Button>
              )}
            </div>
            <div className={styles.infoText}>Track the progress of this bridge in your activity list.</div>
            <div className={styles.buttonGroup}>
              <Button onClick={onClose} variant='secondary' icon={<IconClockRewind size={18} />}>
                Activity
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
