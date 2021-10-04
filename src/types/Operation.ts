export default interface Operation {
  id?: string;

  account?: string;

  quantity: string;

  date: string;

  label?: string;

  type: string;

  createdAt?: string;

  importId?: string;

  reconciledId?: string;
}
