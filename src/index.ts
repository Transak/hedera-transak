import axios from 'axios';
import { networks } from './config';
import { _toDecimal, _toCrypto, _getTransactionNumber } from './utils';
import { Client, TransferTransaction, AccountBalanceQuery, Hbar } from '@hashgraph/sdk';
import { Network, GetTransactionResult, SendTransactionResult, SendTransactionParams } from './types';

const validWallet = /^(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))(?:-([a-z]{5}))?$/;

/**
 * Get the network config
 * @param network
 * @returns
 */
const getNetwork = (network: string) => (network === 'main' ? networks[network] : networks.testnet) as Network;

/**
 * Validate the wallet address
 * @param address
 * @returns
 */
const isValidWalletAddress = (address: string) => new RegExp(validWallet).test(address) as boolean;

/**
 *
 * @param txId
 * @param network
 * @returns
 */
const getTransactionLink = (txId: string, network: string) => getNetwork(network).transactionLink(txId) as string;

/**
 * get wallet link for the given address
 * @param walletAddress
 * @param network
 * @returns
 */
const getWalletLink = (walletAddress: string, network: string) =>
  getNetwork(network).walletLink(walletAddress) as string;

/**
 * create a client instance
 * @param network
 * @returns
 */
async function getClient(network: string, privateKey: string, accountId: string): Promise<any> {
  const config = getNetwork(network);

  // If we weren't able to grab it, we should throw a new error
  if (accountId == null || privateKey == null) {
    throw new Error('variables privateKey and accountId must be present');
  }

  // Create our connection to the Hedera network
  const client = Client.forName(config.networkName); // valid names mainnet, testnet ,previewnet
  client.setOperator(accountId, privateKey);

  return client;
}

/**
 * Get the tokenAssociate transaction details by token id
 * @param network
 * @param privateKey
 * @param accountId
 * @param userAccountId  // user account id
 * @param tokenId
 * @returns
 */
async function isTokenAssociated(
  network: string,
  privateKey: string,
  accountId: string,
  userAccountId: string,
  tokenId: string,
): Promise<boolean> {
  const client = await getClient(network, privateKey, accountId);

  const balance = await new AccountBalanceQuery()
    .setAccountId(userAccountId) //  user's account id
    .execute(client);

  const token = balance.tokens?.get(tokenId); // will return null if token is not associated

  return !!token;
}

/**
 * Get the balance of the transak wallet address
 * @param network
 * @param decimals
 * @param privateKey
 * @param accountId
 * @param tokenId // tokenId
 * @returns
 */
async function getBalance(
  network: string,
  decimals: number,
  privateKey: string,
  accountId: string,
  tokenId?: string,
): Promise<number> {
  const client = await getClient(network, privateKey, accountId);

  const balance = await new AccountBalanceQuery()
    .setAccountId(client.operatorAccountId.toString()) //  transak's account id
    .execute(client);

  // if token id is present then return the token balance
  if (tokenId) {
    return Number(_toDecimal(balance.tokens?.get(tokenId)?.toString() || '0', decimals));
  }

  // else return the hbar balance
  return Number(_toDecimal(balance.hbars.toTinybars().toString(), decimals));
}

/**
 * Get the transaction details by transaction id
 * @param txnId
 * @param network
 * @param privateKey
 * @param accountId
 * @returns
 */
async function getTransaction(
  txnId: string,
  network: string,
  privateKey: string,
  accountId: string,
): Promise<GetTransactionResult | null> {
  try {
    const { mirrorNodeUrl } = getNetwork(network);

    if (txnId.includes('@')) {
      txnId = _getTransactionNumber(txnId);
    }

    const response = await axios({
      method: 'get',
      url: mirrorNodeUrl + txnId,
      headers: {
        accept: 'application/json',
      },
    });

    const transactionData = response.data.transactions[0];

    return {
      transactionData: transactionData,
      receipt: {
        date: transactionData.consensus_timestamp,
        gasCostCryptoCurrency: 'HBAR',
        gasCostInCrypto: +_toDecimal(transactionData.charged_tx_fee.toString(), 8),
        gasLimit: +_toDecimal(transactionData.max_fee.toString(), 8),
        isPending: false,
        isExecuted: true,
        isSuccessful: transactionData.result === 'SUCCESS',
        isFailed: transactionData.result !== 'SUCCESS',
        isInvalid: transactionData.result !== 'SUCCESS',
        network,
        nonce: transactionData.nonce || 0,
        transactionHash: transactionData.transaction_id,
        transactionLink: getTransactionLink(txnId, network),
      },
    };
  } catch (error) {
    return null;
  }
}

/**
 * Send the transaction to the Hedera network
 * @param param0
 * @returns
 */
async function sendTransaction({
  to,
  amount,
  network,
  accountId,
  privateKey,
  decimals,
  tokenId,
}: SendTransactionParams): Promise<SendTransactionResult> {
  const client = await getClient(network, privateKey, accountId);

  // amount in lowest denomination - tinybars in this case
  const amountInCrypto = _toCrypto(amount.toString(), decimals);

  const from = client.operatorAccountId.toString(); // transak wallet address

  // Create the transfer transaction
  const transferTransaction = new TransferTransaction();

  if (!tokenId) {
    transferTransaction
      .addHbarTransfer(from, Hbar.fromTinybars(-amountInCrypto.toNumber())) // Sending account
      .addHbarTransfer(to, Hbar.fromTinybars(amountInCrypto.toNumber())); // Receiving account
  }

  if (tokenId) {
    // user needs to associate the token with the account before sending the token
    transferTransaction
      .addTokenTransferWithDecimals(tokenId, from, -amountInCrypto.toNumber(), decimals) // Sending account
      .addTokenTransferWithDecimals(tokenId, to, amountInCrypto.toNumber(), decimals) // Receiving account
      .freezeWith(client)
      .signWithOperator(client);
  }
  const sendTransactionResponse = await transferTransaction.execute(client);

  const transactionReceipt = await sendTransactionResponse.getReceipt(client);

  return {
    transactionData: sendTransactionResponse,
    receipt: {
      amount,
      date: sendTransactionResponse.transactionId.validStart?.toDate() || null,
      from,
      gasCostCryptoCurrency: 'HBAR',
      transactionReceipt,
      network,
      nonce: sendTransactionResponse.transactionId.nonce?.toNumber() || 0,
      to,
      transactionHash: _getTransactionNumber(sendTransactionResponse.transactionId.toString()),
      transactionLink: getTransactionLink(
        _getTransactionNumber(sendTransactionResponse.transactionId.toString()),
        network,
      ),
    },
  };
}

export = {
  getTransactionLink,
  getWalletLink,
  getTransaction,
  isValidWalletAddress,
  sendTransaction,
  getBalance,
  isTokenAssociated,
};
