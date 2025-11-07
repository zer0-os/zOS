import { useState } from 'react';
import { ethers } from 'ethers';
import { BRIDGE_ABI, getBridgeContractAddress, getBridgeNetworkId } from '../lib/bridge-contracts';
import { ZERO_ADDRESS } from '../lib/constants';

interface BridgeFromEOAParams {
  fromChainId: number;
  toChainId: number;
  tokenAddress: string;
  amount: string;
  destinationAddress: string;
  decimals: number;
  eoaAddress: string;
}

interface UseBridgeFromEOAParams {
  onSuccess?: (transactionHash: string) => void;
  onError?: (error: Error) => void;
}

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

export function useBridgeFromEOA({ onSuccess, onError }: UseBridgeFromEOAParams = {}) {
  const [currentStep, setCurrentStep] = useState<'idle' | 'approving' | 'bridging'>('idle');

  const bridgeFromEOA = async (params: BridgeFromEOAParams) => {
    try {
      const { fromChainId, toChainId, tokenAddress, amount, destinationAddress, decimals, eoaAddress } = params;

      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('No wallet detected. Please install MetaMask or another web3 wallet.');
      }

      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = ethersProvider.getSigner();

      const bridgeContract = getBridgeContractAddress(fromChainId);
      const destinationNetworkId = getBridgeNetworkId(toChainId);

      if (!bridgeContract) {
        throw new Error(`Bridge contract not found for chain ${fromChainId}`);
      }

      if (destinationNetworkId === undefined) {
        throw new Error(`Destination network ID not found for chain ${toChainId}`);
      }

      const amountInWei = ethers.utils.parseUnits(amount, decimals);
      const isNative = tokenAddress.toLowerCase() === ZERO_ADDRESS.toLowerCase();

      if (!isNative) {
        setCurrentStep('approving');

        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

        const allowance: ethers.BigNumber = await tokenContract.allowance(eoaAddress, bridgeContract);

        if (allowance.lt(amountInWei)) {
          const approveTx = await tokenContract.approve(bridgeContract, amountInWei);
          await approveTx.wait();
        }
      }

      setCurrentStep('bridging');

      const bridgeContractInstance = new ethers.Contract(bridgeContract, BRIDGE_ABI, signer);

      const bridgeTx = await bridgeContractInstance.bridgeAsset(
        destinationNetworkId,
        destinationAddress,
        amountInWei,
        tokenAddress,
        true,
        '0x',
        {
          value: isNative ? amountInWei : 0,
        }
      );

      await bridgeTx.wait();

      setCurrentStep('idle');
      onSuccess?.(bridgeTx.hash);

      return bridgeTx.hash;
    } catch (error) {
      setCurrentStep('idle');
      onError?.(error as Error);
      throw error;
    }
  };

  return {
    bridgeFromEOA,
    currentStep,
    isApproving: currentStep === 'approving',
    isBridging: currentStep === 'bridging',
    isPending: currentStep !== 'idle',
  };
}
