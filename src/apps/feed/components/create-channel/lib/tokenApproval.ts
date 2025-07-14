import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, ZERO_TOKEN_ABI } from '../abis/contracts';

interface Price {
  total: ethers.BigNumber;
}

export async function checkAndApproveToken(price: Price, account: string, signer: ethers.Signer): Promise<void> {
  const zeroToken = new ethers.Contract(CONTRACT_ADDRESSES.ZERO_TOKEN, ZERO_TOKEN_ABI, signer);

  // Check current allowance
  const allowance = await zeroToken.allowance(account, CONTRACT_ADDRESSES.ROOT_REGISTRAR);

  if (allowance.lt(price.total)) {
    // Approve the transaction
    const tx = await zeroToken.approve(CONTRACT_ADDRESSES.ROOT_REGISTRAR, price.total);
    await tx.wait();
  }
}
