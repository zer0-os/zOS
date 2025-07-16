import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, ZERO_TOKEN_ABI } from '../../../abis/contracts';

interface Price {
  total: ethers.BigNumber;
}

export async function checkAndApproveToken(price: Price, account: string, signer: ethers.Signer): Promise<void> {
  const zeroToken = new ethers.Contract(CONTRACT_ADDRESSES.ZERO_TOKEN, ZERO_TOKEN_ABI, signer);

  const allowance = await zeroToken.allowance(account, CONTRACT_ADDRESSES.TREASURY);

  if (allowance.lt(price.total)) {
    console.log(`Approving ${ethers.utils.formatEther(price.total)} MEOW for treasury`);
    const tx = await zeroToken.approve(CONTRACT_ADDRESSES.TREASURY, price.total);
    await tx.wait();
  } else {
    console.log('Sufficient allowance already exists');
  }
}
