export default interface RefundRequest {
  id?: string;

  accountFrom: string;

  accountTo: string;

  currencyFrom?: string;

  currencyTo?: string;

  kind?: string;

  friendlyId?: string;

  quantity: string;

  description?: string;

  status?: string;

  createdAt?: string;
}
