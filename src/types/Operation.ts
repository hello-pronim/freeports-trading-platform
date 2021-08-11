export default interface Operation {
  id?: string;

  account?: string;

  amount: number;

  date: string;

  label?: string;

  type: string;

  createdAt?: string;

  importId?: string;
}
