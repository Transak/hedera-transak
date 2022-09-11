import HederaLib from '../src/index';
import { describe, expect, test } from '@jest/globals';
import * as dotenv from 'dotenv';

dotenv.config();

// variables
const mainTimeout = 14000;

// testData
const testData = {
  accountId: process.env.MY_ACCOUNT_ID || '',
  privateKey: process.env.MY_PRIVATE_KEY || ' ',
  toWalletAddress: process.env.TOWALLETADDRESS || '',
  network: process.env.NETWORK || '',
  crypto: 'HBAR',
  amount: 0.000005,
  decimals: 1,
  tokenId: '0.0.48220500', // '0.0.48219534'
};

const keys = {
  sendTransactionResponse: [
    'amount',
    'date',
    'from',
    'gasCostCryptoCurrency',
    'network',
    'nonce',
    'to',
    'transactionHash',
    'transactionLink',
    'transactionReceipt',
  ],
  getTransactionResponse: [
    'amount',
    'date',
    'from',
    'gasCostCryptoCurrency',
    'gasCostInCrypto',
    'gasLimit',
    'isPending',
    'isExecuted',
    'isSuccessful',
    'isFailed',
    'isInvalid',
    'network',
    'nonce',
    'transactionHash',
    'transactionLink',
  ],
};

const runtime = { transactionId: '' };

describe('Hedera module', () => {
  test(
    'should getBalance',
    async function () {
      const { network, decimals, privateKey, accountId, tokenId } = testData;

      const result = await HederaLib.getBalance(
        network,
        decimals,
        privateKey,
        accountId,
        tokenId, // token Id
      );

      console.log({ result });
      expect(typeof result).toBe('number');
    },
    mainTimeout,
  );

  test.skip(
    'should isValidWalletAddress',
    async function () {
      const result = await HederaLib.isValidWalletAddress(testData.toWalletAddress);

      console.log({ result });
      expect(result).toBe(true);
    },
    mainTimeout * 3,
  );

  test(
    'should sendTransaction',
    async function () {
      const { toWalletAddress: to, network, amount, decimals, accountId, privateKey, tokenId } = testData;

      const result = await HederaLib.sendTransaction({
        to,
        amount: 2,
        network,
        decimals: 1,
        accountId,
        privateKey,
        tokenId: '0.0.48220500',
      });

      console.log({ result });

      runtime.transactionId = result.receipt.transactionId;

      expect(Object.keys(result.receipt)).toEqual(expect.arrayContaining(keys.sendTransactionResponse));
    },
    mainTimeout * 3,
  );

  test.skip(
    'should getTransaction',
    async function () {
      const { network, privateKey, accountId } = testData;
      const { transactionId: txnId } = runtime;
      const result = await HederaLib.getTransaction(txnId, network, privateKey, accountId);
      console.log({ result });

      if (result) expect(Object.keys(result.receipt)).toEqual(expect.arrayContaining(keys.getTransactionResponse));
    },
    mainTimeout * 3,
  );
});
