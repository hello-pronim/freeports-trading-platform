export default interface InvestorAccountBalance {
  address: string;
  totalReceived: number;
  totalSent: number;
  balance: number;
  unconfirmedBalance: number;
  finalBalance: number;
  nTx: number;
  unconfirmedNTx: number;
  finalNTx: number;
}
