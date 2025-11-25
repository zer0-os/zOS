import { useState } from 'react';
import { ethers } from 'ethers';
import { BRIDGE_ABI, getBridgeContractAddress, getBridgeNetworkId } from '../lib/bridge-contracts';
import { ZERO_ADDRESS } from '../lib/constants';
import { normalizeWalletError, getEthersProviderFromWagmi } from '../lib/utils';

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

      if (!eoaAddress) {
        throw new Error('EOA address is required');
      }

      const ethersProvider = await getEthersProviderFromWagmi(fromChainId);
      const signer = ethersProvider.getSigner();
      const connectedAddress = await signer.getAddress();

      // Verify the connected address matches the eoaAddress parameter
      if (connectedAddress.toLowerCase() !== eoaAddress.toLowerCase()) {
        throw new Error(
          `Connected wallet address (${connectedAddress}) does not match expected address (${eoaAddress})`
        );
      }

      const bridgeContract = getBridgeContractAddress(fromChainId);
      const destinationNetworkId = getBridgeNetworkId(toChainId);

      if (!bridgeContract) {
        throw new Error(`Bridge contract not found for chain ${fromChainId}`);
      }

      if (destinationNetworkId === undefined) {
        throw new Error(`Destination network ID not found for chain ${toChainId}`);
      }

      // Validate amount
      if (!amount || amount === '0' || parseFloat(amount) <= 0) {
        throw new Error('Invalid amount');
      }

      const amountInWei = ethers.utils.parseUnits(amount, decimals);
      const isNative = tokenAddress.toLowerCase() === ZERO_ADDRESS.toLowerCase();

      // Checksum all addresses
      const checksummedBridgeContract = ethers.utils.getAddress(bridgeContract);
      const checksummedDestinationAddress = ethers.utils.getAddress(destinationAddress);
      const checksummedTokenAddress = isNative ? ZERO_ADDRESS : ethers.utils.getAddress(tokenAddress);

      if (!isNative) {
        setCurrentStep('approving');

        const tokenContract = new ethers.Contract(checksummedTokenAddress, ERC20_ABI, signer);
        const allowance: ethers.BigNumber = await tokenContract.allowance(connectedAddress, checksummedBridgeContract);

        if (allowance.lt(amountInWei)) {
          const approveTx = await tokenContract.approve(checksummedBridgeContract, amountInWei);
          await approveTx.wait();
        }
      }

      setCurrentStep('bridging');

      const bridgeContractInstance = new ethers.Contract(checksummedBridgeContract, BRIDGE_ABI, signer);

      const bridgeTx = await bridgeContractInstance.bridgeAsset(
        destinationNetworkId,
        checksummedDestinationAddress,
        amountInWei,
        checksummedTokenAddress,
        true,
        '0x',
        {
          value: isNative ? amountInWei : 0,
        }
      );

      const receipt = await bridgeTx.wait();

      if (receipt.status === 0) {
        throw new Error('Bridge transaction failed on-chain');
      }

      setCurrentStep('idle');
      onSuccess?.(bridgeTx.hash);

      return bridgeTx.hash;
    } catch (error) {
      setCurrentStep('idle');
      const normalizedError = normalizeWalletError(error);
      onError?.(normalizedError);
      throw normalizedError;
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
