import { Network } from './types';

export const networks: Record<string, Network> = {
  main: {
    transactionLink: hash => `https://hashscan.io/mainnet/transaction/${hash}`,
    walletLink: address => `https://hashscan.io/mainnet/account/${address}`,
    mirrorNodeUrl: 'https://mainnet-public.mirrornode.hedera.com/api/v1/transactions/',
    networkName: 'mainnet',
  },
  testnet: {
    transactionLink: hash => `https://hashscan.io/testnet/transaction/${hash}`,
    walletLink: address => `https://hashscan.io/testnet/account/${address}`,
    networkName: 'testnet',
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com/api/v1/transactions/',
  },
};

module.exports = { networks };
