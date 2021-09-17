export default interface FundRequest {
  id?: string;

  accountFrom: string;

  accountTo: string;

  kind?: string;

  friendlyId?: string;

  quantity: string;

  description?: string;

  status?: string;

  createdAt?: string;
}
