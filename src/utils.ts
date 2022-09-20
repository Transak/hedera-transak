import { BigNumber, hethers } from '@hashgraph/hethers';

// converts any units to Hbars
export const _toDecimal = (amount: string, decimals: number): string => {
  // sting to BigNumber
  return hethers.utils.formatUnits(hethers.BigNumber.from(amount), decimals);
};

// converts Hbar to tinybar
export const _toCrypto = (amount: string, decimals: number): BigNumber => hethers.utils.parseUnits(amount, decimals);

export const _getTransactionNumber = (txnId: string): string => {
  const [accountId, rest] = txnId.split('@');
  const [realm ,timestamp ] = rest.split('.');
  
  return [accountId,realm,timestamp].join('-');
};




