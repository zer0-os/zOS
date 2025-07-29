export interface ERC20 {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  image: string;
}

export interface ERC721 {
  address: string;
  name: string;
  symbol: string;
  image: string;
}

export interface Pool<T> {
  id: string;
  name: string;
  token: T;
}

export interface ERC20Pool extends Pool<ERC20> {
  token: ERC20;
}

export interface ERC721Pool extends Pool<ERC721> {
  token: ERC721;
}
