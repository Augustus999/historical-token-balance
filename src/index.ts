import 'dotenv/config';
import { ethers } from 'ethers';
import config from './config.json';

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

  const { wallets, tokens, blockNumber } = config;

  console.log(`Fetching balances from ${wallets.length} wallets and ${tokens.length} tokens at block ${blockNumber}...`);

  const walletBalances: WalletBalances = {};

  for (let walletIndex = 0; walletIndex < wallets.length; walletIndex += 1) {
    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
      if (typeof walletBalances[wallets[walletIndex]] === 'undefined') {
        walletBalances[wallets[walletIndex]] = [];
      }

      const contract = new ethers.Contract(
        tokens[tokenIndex],
        [
          'function balanceOf(address) view returns (uint)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint)',
        ],
        provider,
      );

      walletBalances[wallets[walletIndex]].push({
        address: wallets[walletIndex],
        balance: (await contract.balanceOf(wallets[walletIndex], { blockTag: blockNumber }))
          .toString(),
        decimals: (await contract.decimals()).toString(),
      });
    }
  }

  console.log(walletBalances);
})();
