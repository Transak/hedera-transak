import { Network } from './types';

export const networks: Record<string, Network> = {
  main: {
    transactionLink: hash => `https://hederaexplorer.io/search-details/transaction/${hash}`,
    walletLink: address => `https://hederaexplorer.io/search-details/account/${address}`,
    mirrorNodeUrl: 'https://mainnet-public.mirrornode.hedera.com/api/v1/transactions/',
    networkName: 'mainnet',
  },
  testnet: {
    transactionLink: hash => `https://testnet.hederaexplorer.io/search-details/transaction/${hash}`,
    walletLink: address => `https://testnet.hederaexplorer.io/search-details/account/${address}`,
    networkName: 'testnet',
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com/api/v1/transactions/',
  },
};

module.exports = { networks };
