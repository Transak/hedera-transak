import { TransactionResponse, TransactionRecord, TransactionReceipt } from '@hashgraph/sdk';

export type Network = {
  networkName: string;
  transactionLink: (arg0: string) => string;
  walletLink: (arg0: string) => string;
};

export type GetTransactionResult = {
  transactionData: TransactionRecord;
  receipt: {
    amount: number;
    date: Date | null;
    from: string;
    gasCostCryptoCurrency: string;
    gasCostInCrypto: number;
    gasLimit: number;

    isPending: boolean;
    isExecuted: boolean;
    isSuccessful: boolean;
    isFailed: boolean;
    isInvalid: boolean;
    network: string;
    nonce: number;
    transactionHash: string;
    transactionId: string;
    transactionLink: string;
  };
};

export type SendTransactionParams = {
  to: string;
  amount: number;
  network: string;
  decimals: number;
  accountId: string;
  privateKey: string;
  tokenId?: string;
};

export type SendTransactionResult = {
  transactionData: TransactionResponse;
  receipt: {
    amount: number;
    date: Date | null;
    from: string;
    gasCostCryptoCurrency: string;
    network: string;
    nonce: number;
    to: string;
    transactionHash: Uint8Array;
    transactionLink: string;
    transactionId: string;
    transactionReceipt: TransactionReceipt;
  };
};
