import 'dotenv/config';
import { ethers } from 'ethers';

const { ALCHEMY_API_KEY } = process.env;

type TokenBalance = {
    address: string
    balance: string
    decimals: string
}

type WalletBalances = {
    [walletAddress: string]: TokenBalance[]
}

(async () => {
  const provider = new ethers.providers.AlchemyProvider('homestead', ALCHEMY_API_KEY);

  // 1. Specify array of wallet balances
  const walletAddresses: string[] = [
    '0x616efd3e811163f8fc180611508d72d842ea7d07',
  ];

  // 2. Specify token addresses
  // Beware, the total amount of requests you will consume is:
  // {walletAddresses.length} * {tokenAddresses.length} * {values you call from the smart contract}
  const tokenAddresses: string[] = [
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  ];

  // 3. Specify block number
  const blockNumber = 13371337;

  const walletBalances: WalletBalances = {};

  console.log(`Fetching balances from ${walletAddresses.length} addresses at block ${blockNumber}...`);

  for (let walletIndex = 0; walletIndex < walletAddresses.length; walletIndex + 1) {
    for (let tokenIndex = 0; tokenIndex < tokenAddresses.length; tokenIndex + 1) {
      const contract = new ethers.Contract(
        tokenAddresses[tokenIndex],
        [
          'function balanceOf(address) view returns (uint)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint)',
        ],
        provider,
      );

      if (typeof walletBalances[walletAddresses[walletIndex]] === 'undefined') {
        walletBalances[walletAddresses[walletIndex]] = [];
      }

      walletBalances[walletAddresses[walletIndex]].push({
        address: tokenAddresses[tokenIndex],
        balance: (await contract.balanceOf(walletAddresses[walletIndex], { blockTag: blockNumber }))
          .toString(),
        decimals: (await contract.decimals()).toString(),
      });
    }
  }

  // 4. Use `walletBalances` as needed
  console.log(walletBalances);
})();
