export default interface Account {
  id?: string;

  name: string;

  currency: string;

  type: string;

  balance?: number;

  balanceUpdatedAt?: string;

  iban?: string;

  publicAddress?: string;

  vaultWalletId?: string;
}
