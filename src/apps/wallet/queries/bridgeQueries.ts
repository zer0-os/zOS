import { get, post } from '../../../lib/api/rest';

export interface BridgeTokenPayload {
  tokenAddress: string;
  amount: string;
  to: string;
  fromChainId: number;
  toChainId: number;
}

export interface BridgeTokenResponse {
  transactionHash: string;
}

export interface BridgeStatusResponse {
  transactionHash: string;
  status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'failed';
  fromChain: string;
  toChain: string;
  amount: string;
  token: string;
  tokenAddress: string;
  explorerUrl: string;
  depositCount: number;
  readyForClaim: boolean;
  claimTxHash?: string;
  merkleProof?: string[];
  rollupMerkleProof?: string[];
  leafType: number;
  globalIndex: string;
  blockNumber: string;
  metadata: string;
  destinationAddress: string;
}

export interface BridgeMerkleProofData {
  merkleProof: string[];
  rollupMerkleProof: string[];
  mainExitRoot: string;
  rollupExitRoot: string;
}

export interface FinalizeBridgePayload {
  depositCount: number;
  merkleProof: string[];
  rollupMerkleProof: string[];
  mainExitRoot: string;
  rollupExitRoot: string;
  destinationAddress: string;
  amount: string;
  tokenAddress: string;
  chainId?: number;
}

export interface FinalizeBridgeResponse {
  transactionHash: string;
}

export const bridgeTokenRequest = async (
  address: string,
  payload: BridgeTokenPayload
): Promise<BridgeTokenResponse> => {
  const response = await post(`/api/wallet/${address}/transactions/bridge-token`).send(payload);
  return response.body as BridgeTokenResponse;
};

export const bridgeStatusRequest = async (
  address: string,
  depositCount: number,
  fromChainId?: number
): Promise<BridgeStatusResponse> => {
  const params: Record<string, string> = {
    depositCount: depositCount.toString(),
  };
  if (fromChainId !== undefined) {
    params.fromChainId = fromChainId.toString();
  }

  const queryString = new URLSearchParams(params).toString();
  const path = `/api/wallet/${address}/bridge-status/${depositCount}${queryString ? `?${queryString}` : ''}`;

  const response = await get<BridgeStatusResponse>(path);
  return response.body as BridgeStatusResponse;
};

export const merkleProofRequest = async (
  address: string,
  depositCount: number,
  params: {
    netId: number;
    fromChainId?: number;
  }
): Promise<BridgeMerkleProofData> => {
  const queryParams: Record<string, string> = {
    netId: params.netId.toString(),
  };
  if (params.fromChainId !== undefined) {
    queryParams.fromChainId = params.fromChainId.toString();
  }

  const queryString = new URLSearchParams(queryParams).toString();
  const path = `/api/wallet/${address}/merkle-proof/${depositCount}?${queryString}`;

  const response = await get<BridgeMerkleProofData>(path);
  return response.body as BridgeMerkleProofData;
};

export const finalizeBridgeRequest = async (
  address: string,
  payload: FinalizeBridgePayload
): Promise<FinalizeBridgeResponse> => {
  const response = await post(`/api/wallet/${address}/transactions/finalize-bridge`).send(payload);
  return response.body as FinalizeBridgeResponse;
};

export interface BridgeActivityResponse {
  deposits: BridgeStatusResponse[];
  totalCount: number;
}

export const bridgeActivityRequest = async (
  address: string,
  params?: {
    fromChainId?: number;
    limit?: number;
    offset?: number;
  }
): Promise<BridgeActivityResponse> => {
  const queryParams: Record<string, string> = {};
  if (params?.fromChainId !== undefined) {
    queryParams.fromChainId = params.fromChainId.toString();
  }
  if (params?.limit !== undefined) {
    queryParams.limit = params.limit.toString();
  }
  if (params?.offset !== undefined) {
    queryParams.offset = params.offset.toString();
  }

  const queryString = new URLSearchParams(queryParams).toString();
  const path = `/api/wallet/${address}/bridge-activity${queryString ? `?${queryString}` : ''}`;

  const response = await get<BridgeActivityResponse>(path);
  return response.body as BridgeActivityResponse;
};
