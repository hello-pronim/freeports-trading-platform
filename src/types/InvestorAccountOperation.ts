interface InvestorAccountAddressTx {
  txHash: string;
  blockHeight: number;
  txInputN: number;
  txOutputN: number;
  value: number;
  refBalance: number;
  spent: boolean;
  confirmations: number;
  confirmed: string;
  doubleSpend: boolean;
}
export default interface InvestorAccountOperation {
  txrefs?: Array<InvestorAccountAddressTx>;
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
