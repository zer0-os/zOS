export interface TokenBalance {
  tokenAddress: string;
  symbol: string;
  name: string;
  amount: string;
  logo?: string;
  decimals: number;
  price?: number;
  percentChange?: number;
  chainId?: number;
}

export interface NFT {
  animationUrl: string | null;
  collectionAddress: string;
  collectionName: string | null;
  id: string;
  imageUrl: string | null;
  isUnique: boolean | null;
  tokenType?: 'ERC-721' | 'ERC-1155' | 'ERC-404';
  quantity?: number;
  metadata: {
    attributes: {
      traitType: string;
      value: string;
    }[];
    name: string;
    description: string;
  } | null;
}

export type TransactionAction = 'send' | 'receive';

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  action: TransactionAction;
  token: Partial<TokenBalance>;
  amount: string | null;
  timestamp: string;
  tokenId: string | null;
  explorerUrl: string;
  type: 'token_transfer' | 'token_minting' | 'token_burning';
}

export interface GetTokenBalancesResponse {
  tokens: TokenBalance[];
  nextPageParams: {
    items_count: number;
    token_name: string | null;
    token_type: string | null;
    value: number;
  } | null;
}

export interface GetNFTsResponse {
  nfts: NFT[];
  nextPageParams: {
    token_congtract_address_hash: string;
    token_id: string;
    token_type: string;
  } | null;
}

export interface GetHistoryResponse {
  transactions: Transaction[];
  nextPageParams: {
    block_number: number;
    index: number;
  } | null;
}

export interface Recipient {
  userId: string;
  matrixId: string;
  publicAddress: string;
  name: string;
  profileImage: string;
  primaryZid: string | null;
}

export interface SearchRecipientsResponse {
  recipients: Recipient[];
}
