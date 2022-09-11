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
  denom: 'uosmo',
  amount: 0.000005,
  decimals: 8,
  address: '0x6b175474e89094c44da98b954eedeac495271d0f',
};

// (async () => {
//     const date = await getTransaction(
//       '0.0.48189397@1662631612.548883749',
//       'testnet',
//     );
//     console.log('date: ', JSON.stringify(date));
//   })();

// const runtime = { transactionHash: '', transactionLink: '' };

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
      const result = await HederaLib.getBalance(
        testData.network,
        testData.decimals,
        testData.privateKey,
        testData.accountId,
        testData.address, // contract address
      );

      console.log({ result });
      expect(typeof result).toBe('number');
    },
    mainTimeout,
  );

  test(
    'should isValidWalletAddress',
    async function () {
      const result = await HederaLib.isValidWalletAddress(
        testData.toWalletAddress,
      );

      console.log({ result });
      expect(result).toBe(true);
    },
    mainTimeout * 3,
  );

  test(
    'should sendTransaction',
    async function () {
      const {
        toWalletAddress: to,
        network,
        amount,
        decimals,
        accountId,
        privateKey,
      } = testData;

      const result = await HederaLib.sendTransaction({
        to,
        amount,
        network,
        decimals,
        accountId,
        privateKey,
      });

      console.log({ result });

      runtime.transactionId = result.receipt.transactionId;

      expect(Object.keys(result.receipt)).toEqual(
        expect.arrayContaining(keys.sendTransactionResponse),
      );
    },
    mainTimeout * 3,
  );

  test(
    'should getTransaction',
    async function () {
      const { network, privateKey, accountId } = testData;
      const { transactionId: txnId } = runtime;
      const result = await HederaLib.getTransaction(
        txnId,
        network,
        privateKey,
        accountId,
      );
      console.log({ result });

      if (result)
        expect(Object.keys(result.receipt)).toEqual(
          expect.arrayContaining(keys.getTransactionResponse),
        );
    },
    mainTimeout * 3,
  );
});
