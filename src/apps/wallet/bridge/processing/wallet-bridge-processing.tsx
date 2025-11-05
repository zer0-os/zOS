import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BridgeHeader } from '../components/bridge-header/bridge-header';
import {
  BridgeParams,
  CHAIN_ID_ZCHAIN,
  CHAIN_ID_ZEPHYR,
  CHAIN_ID_ETHEREUM,
  CHAIN_ID_SEPOLIA,
  openExplorerForTransaction,
} from '../lib/utils';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { useBridgeStatus } from '../hooks/useBridgeStatus';
import { useBridgeMerkleProof } from '../hooks/useBridgeMerkleProof';
import { useFinalizeBridge } from '../hooks/useFinalizeBridge';
import { TransactionLoadingSpinner } from '../../send/components/transaction-loading-spinner';
import { useAccount } from 'wagmi';
import { Button } from '../../components/button/button';

import styles from './wallet-bridge-processing.module.scss';

interface WalletBridgeProcessingProps {
  bridgeParams: BridgeParams;
  transactionHash: string;
  onSuccess: () => void;
  onError: () => void;
}

const BRIDGE_NETWORK_IDS = {
  ETHEREUM: 0,
  Z_CHAIN: 14,
};

export const WalletBridgeProcessing = ({
  bridgeParams,
  transactionHash,
  onSuccess,
  onError,
}: WalletBridgeProcessingProps) => {
  const currentUser = useSelector(currentUserSelector);
  const zeroWalletAddress = currentUser?.zeroWalletAddress;
  const { address: eoaAddress } = useAccount();

  const isZChainToEthereum =
    (bridgeParams.fromChainId === CHAIN_ID_ZCHAIN || bridgeParams.fromChainId === CHAIN_ID_ZEPHYR) &&
    (bridgeParams.toChainId === CHAIN_ID_ETHEREUM || bridgeParams.toChainId === CHAIN_ID_SEPOLIA);

  const { data: status } = useBridgeStatus({
    zeroWalletAddress,
    transactionHash,
    fromChainId: bridgeParams.fromChainId,
    enabled: true,
    // polls every 5s until completed/failed
  });

  const needsMerkleProof = isZChainToEthereum && status?.readyForClaim && !status?.claimTxHash;
  const { data: merkleProof, isLoading: merkleProofLoading } = useBridgeMerkleProof({
    zeroWalletAddress,
    depositCount: status?.depositCount,
    netId: BRIDGE_NETWORK_IDS.ETHEREUM,
    fromChainId: bridgeParams.fromChainId,
    enabled: needsMerkleProof,
  });

  const finalizeMutation = useFinalizeBridge({
    eoaAddress,
    onSuccess: () => {
      // Status will update via polling
    },
  });

  // Handle status changes
  useEffect(() => {
    if (status?.status === 'completed') {
      onSuccess();
    } else if (status?.status === 'failed') {
      onError();
    }
  }, [status?.status, onSuccess, onError]);

  const onFinalize = () => {
    if (!status || !merkleProof) return;
    finalizeMutation.mutate({
      status,
      merkleProof,
      toChainId: bridgeParams.toChainId,
    });
  };

  const onViewTransaction = () => {
    openExplorerForTransaction(transactionHash, bridgeParams.fromChainId, status?.explorerUrl);
  };

  const isProcessing = status?.status === 'processing';
  const isReadyForClaim = status?.status === 'on-hold' && status?.readyForClaim;
  const isFinalizing = finalizeMutation.isPending;
  const showFinalizeContent = isReadyForClaim && isZChainToEthereum;

  return (
    <div className={styles.container}>
      <BridgeHeader title='Bridge' />
      <div className={styles.content}>
        <TransactionLoadingSpinner />

        {showFinalizeContent ? (
          <>
            <div className={styles.title}>Bridge is ready to finalize</div>
            <div className={styles.subtitle}>Complete the bridge by finalizing on Ethereum.</div>
            {merkleProofLoading ? (
              <div className={styles.subtitle}>Loading merkle proof...</div>
            ) : merkleProof ? (
              <Button onClick={onFinalize} disabled={isFinalizing}>
                {isFinalizing ? 'Finalizing...' : 'Finalize Bridge'}
              </Button>
            ) : (
              <div className={styles.subtitle}>Preparing finalization...</div>
            )}
            {finalizeMutation.isError && (
              <div className={styles.errorText}>{finalizeMutation.error?.message || 'Finalization failed'}</div>
            )}
          </>
        ) : (
          <>
            <div className={styles.title}>
              {isFinalizing ? 'Finalizing bridge transaction' : 'Bridge transaction is being processed'}
            </div>
            <div className={styles.subtitle}>{isFinalizing ? 'Just a moment.' : 'This may take a few minutes.'}</div>
            {isProcessing && transactionHash && (
              <Button onClick={onViewTransaction} variant='secondary'>
                View on Explorer
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
