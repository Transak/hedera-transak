import { Network } from './types';

export const networks: Record<string, Network> = {
  main: {
    transactionLink: hash =>
      `https://hederaexplorer.io/search-details/transaction/${hash}`,
    walletLink: address =>
      `https://hederaexplorer.io/search-details/account/${address}`,
    networkName: 'mainnet',
  },
  testnet: {
    transactionLink: hash =>
      `https://testnet.hederaexplorer.io/search-details/transaction/${hash}`,
    walletLink: address =>
      `https://testnet.hederaexplorer.io/search-details/account/${address}`,
    networkName: 'testnet',
  },
};

module.exports = { networks };
