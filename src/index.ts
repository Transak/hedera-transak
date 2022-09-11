import { networks } from './config';
import { _toDecimal, _toCrypto, _getAccountNumber } from './utils';
import {
  Client,
  TransferTransaction,
  AccountBalanceQuery,
  TransactionRecordQuery,
  Hbar,
} from '@hashgraph/sdk';
import {
  Network,
  GetTransactionResult,
  SendTransactionResult,
  SendTransactionParams,
} from './types';


const validWallet =
  /^(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))(?:-([a-z]{5}))?$/;

/**
 * Get the network config
 * @param network
 * @returns
 */
const getNetwork = (network: string) =>
  (network === 'main' ? networks[network] : networks.testnet) as Network;

/**
 * Validate the wallet address
 * @param address
 * @returns
 */
const isValidWalletAddress = (address: string) =>
  new RegExp(validWallet).test(address) as boolean;

/**
 *
 * @param txId
 * @param network
 * @returns
 */
const getTransactionLink = (txId: string, network: string) =>
  getNetwork(network).transactionLink(txId) as string;

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
async function getClient(
  network: string,
  privateKey: string,
  accountId: string,
): Promise<any> {
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
 * Get the balance of the transak wallet address
 * @param address
 * @param network
 * @param decimals
 * @returns
 */
async function getBalance(
  network: string,
  decimals: number,
  privateKey: string,
  accountId: string,
  address: string, // contract address
): Promise<number> {
  const client = await getClient(network, privateKey, accountId);
  // account's balance is retured in the Hbar unit
  const balance = await new AccountBalanceQuery()
    // .setContractId(address) // TODO - add support for ERC20-Eqv tokens
    .setAccountId(client.operatorAccountId.toString()) //  transak's account id
    .execute(client);

  return Number(_toDecimal(balance.hbars.toTinybars().toString(), decimals));
}

/**
 * Get the transaction details by transaction id
 * @param txId
 * @param network
 * @param decimals
 * @returns
 */
async function getTransaction(
  txnId: string,
  network: string,
  privateKey: string,
  accountId: string,
): Promise<GetTransactionResult | null> {
  const client = await getClient(network, privateKey, accountId);

  const TransactionRecord = await new TransactionRecordQuery()
    .setTransactionId(txnId)
    .setIncludeDuplicates(true)
    .execute(client);

  return {
    transactionData: TransactionRecord,
    receipt: {
      amount: TransactionRecord.transfers[1].amount.toTinybars().toNumber(),
      date: TransactionRecord.consensusTimestamp.toDate(),
      from: TransactionRecord.transactionId.accountId?.toString() || '',
      gasCostCryptoCurrency: 'HBAR',
      gasCostInCrypto: TransactionRecord.transactionFee
        .toBigNumber()
        .toNumber(),
      gasLimit: 1,
      isPending: false,
      isExecuted: true,
      isSuccessful: TransactionRecord.receipt.status.toString() === 'SUCCESS',
      isFailed: TransactionRecord.receipt.status.toString() !== 'SUCCESS',
      isInvalid: TransactionRecord.receipt.status.toString() !== 'SUCCESS',
      network,
      nonce: TransactionRecord.transactionId.nonce?.toNumber() || 0,
      transactionHash: TransactionRecord.transactionHash.toString(),
      transactionId: TransactionRecord.transactionId.toString(),
      transactionLink: getTransactionLink(
        TransactionRecord.transactionId.toString(),
        network,
      ),
    },
  };
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
}: SendTransactionParams): Promise<SendTransactionResult> {
  const client = await getClient(network, privateKey, accountId);

  // amount in lowest denomination - tinybars in this case
  const amountInCrypto = _toCrypto(amount.toString(), decimals);

  const from = client.operatorAccountId.toString(); // transak wallet address

  // TODO - Add support for ERC20-Eqv tokens
  //Create the transfer transaction
  const sendTransactionResponse = await new TransferTransaction()
    .addHbarTransfer(from, Hbar.fromTinybars(-amountInCrypto.toNumber())) //Sending account
    .addHbarTransfer(to, Hbar.fromTinybars(amountInCrypto.toNumber())) //Receiving account
    .execute(client);

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
      transactionHash: sendTransactionResponse.transactionHash,
      transactionId: sendTransactionResponse.transactionId.toString(),
      transactionLink: getTransactionLink(
        sendTransactionResponse.transactionId.toString(),
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
};
