export default interface MoveRequest {
  id?: string;

  accountFrom: string;

  publicAddressTo: string;

  kind?: string;

  friendlyId?: string;

  quantity: string;

  description?: string;

  status?: string;

  createdAt?: string;
}
