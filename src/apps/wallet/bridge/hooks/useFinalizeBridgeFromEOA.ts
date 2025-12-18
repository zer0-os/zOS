import { useState } from 'react';
import { ethers } from 'ethers';
import { BRIDGE_ABI, getBridgeContractAddress, getBridgeNetworkId } from '../lib/bridge-contracts';
import { BridgeStatusResponse, BridgeMerkleProofData } from '../../queries/bridgeQueries';
import { normalizeWalletError, getEthersProviderFromWagmi, CHAIN_ID_ETHEREUM } from '../lib/utils';

interface FinalizeBridgeFromEOAParams {
  status: BridgeStatusResponse;
  merkleProof: BridgeMerkleProofData;
  toChainId: number;
  fromChainId: number;
  eoaAddress: string;
}

interface UseFinalizeBridgeFromEOAParams {
  onSuccess?: (transactionHash: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to finalize a bridge transaction from L2 to L1 using EOA wallet.
 * This is used when bridging from Z-Chain/Zephyr to Ethereum/Sepolia.
 */
export function useFinalizeBridgeFromEOA({ onSuccess, onError }: UseFinalizeBridgeFromEOAParams = {}) {
  const [currentStep, setCurrentStep] = useState<'idle' | 'finalizing'>('idle');
  const [error, setError] = useState<Error | null>(null);

  const finalizeBridgeFromEOA = async (params: FinalizeBridgeFromEOAParams) => {
    setError(null);
    try {
      const { status, merkleProof, toChainId, fromChainId, eoaAddress } = params;

      if (!eoaAddress) {
        throw new Error('EOA address is required');
      }

      const ethersProvider = await getEthersProviderFromWagmi(toChainId);
      const network = await ethersProvider.getNetwork();

      // Verify the user is on the correct chain (destination chain/L1)
      if (network.chainId !== toChainId) {
        throw new Error(
          `Please switch to the correct network. Expected chain ID ${toChainId}, but connected to ${network.chainId}`
        );
      }

      // Use the wagmi-provided address as the signer address (avoids ethers v5 "unknown account #0"
      // surfacing when the provider is rehydrated but accounts haven't been requested yet).
      const signer = ethersProvider.getSigner(eoaAddress);

      // Get the bridge contract address on the destination chain (L1)
      const bridgeContractAddress = getBridgeContractAddress(toChainId);
      if (!bridgeContractAddress) {
        throw new Error(`Bridge contract not found for chain ${toChainId}`);
      }

      // Get network IDs
      // For finalization from L2 to L1, the originNetwork depends on the network:
      // - Mainnet (Z-Chain -> Ethereum): originNetwork should be 0 (bridge.zchain.org shows orig_net: 0)
      // - Testnet (Zephyr -> Sepolia): may need different logic - checking if it should be 0 or the L2 network ID
      const destinationNetworkId = getBridgeNetworkId(toChainId);

      // For mainnet, bridge.zchain.org shows orig_net: 0
      // For testnet, we need to verify what bridge.zchain.org uses
      // Using 0 for now (both Ethereum and Sepolia use network ID 0)
      // If testnet fails, it may need to use getBridgeNetworkId(fromChainId) instead
      const originNetworkId = toChainId === CHAIN_ID_ETHEREUM ? 0 : getBridgeNetworkId(fromChainId);

      if (destinationNetworkId === undefined) {
        throw new Error(`Destination network ID not found for chain ${toChainId}`);
      }

      // Validate required data
      if (!status || !merkleProof) {
        throw new Error('Missing required data for finalization');
      }

      if (!status.globalIndex || !status.amount || !status.tokenAddress || !status.destinationAddress) {
        throw new Error('Missing required status fields for finalization');
      }

      // Convert merkle proofs to fixed-size arrays (32 bytes32 elements)
      // Pad with zero bytes if needed
      const padProof = (proof: string[]): string[] => {
        const padded = [...proof];
        while (padded.length < 32) {
          padded.push('0x0000000000000000000000000000000000000000000000000000000000000000');
        }
        return padded.slice(0, 32);
      };

      const smtProofLocalExitRoot = padProof(merkleProof.merkleProof);
      const smtProofRollupExitRoot = padProof(merkleProof.rollupMerkleProof);

      // Convert values to proper types
      const globalIndex = ethers.BigNumber.from(status.globalIndex);
      const mainnetExitRoot = merkleProof.mainExitRoot;
      const rollupExitRoot = merkleProof.rollupExitRoot;
      const originNetwork = originNetworkId;
      const originTokenAddress = ethers.utils.getAddress(status.tokenAddress);
      const destinationNetwork = destinationNetworkId;
      const destinationAddress = ethers.utils.getAddress(status.destinationAddress);
      const amount = ethers.BigNumber.from(status.amount);

      // Convert metadata from hex string to bytes
      let metadata = '0x';
      if (status.metadata) {
        // If metadata is already a hex string, use it directly
        if (status.metadata.startsWith('0x')) {
          metadata = status.metadata;
        } else {
          // Otherwise, convert to hex
          metadata = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(status.metadata));
        }
      }

      setCurrentStep('finalizing');

      // Create contract instance
      const bridgeContractInstance = new ethers.Contract(bridgeContractAddress, BRIDGE_ABI, signer);

      // Call claimAsset function
      const claimTx = await bridgeContractInstance.claimAsset(
        smtProofLocalExitRoot,
        smtProofRollupExitRoot,
        globalIndex,
        mainnetExitRoot,
        rollupExitRoot,
        originNetwork,
        originTokenAddress,
        destinationNetwork,
        destinationAddress,
        amount,
        metadata
      );

      const receipt = await claimTx.wait();

      if (receipt.status === 0) {
        throw new Error('Claim transaction failed on-chain');
      }

      setCurrentStep('idle');
      onSuccess?.(claimTx.hash);

      return claimTx.hash;
    } catch (error) {
      setCurrentStep('idle');
      const normalizedError = normalizeWalletError(error);
      setError(normalizedError);
      onError?.(normalizedError);
      throw normalizedError;
    }
  };

  return {
    finalizeBridgeFromEOA,
    currentStep,
    isFinalizing: currentStep === 'finalizing',
    isPending: currentStep !== 'idle',
    error,
  };
}
