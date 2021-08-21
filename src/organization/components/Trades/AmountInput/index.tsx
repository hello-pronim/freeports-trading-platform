import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import Lockr from "lockr";
import { tradeDetailActions } from "../Detail/slice";
import { selectTradeAmount } from "../Detail/slice/selectors";

const AmountInput = (): React.ReactElement => {
  const tradeAmount = useSelector(selectTradeAmount);
  const dispatch = useDispatch();
  const { organizationId } = Lockr.get("USER_DATA");
  const { deskId, investorId, tradeId }: any = useParams();
  const handleAmountChange = (event: any) => {
    console.log("input change ", event.target.value);
    if (event.target.value !== tradeAmount) {
      dispatch(tradeDetailActions.setTradeAmount(event.target.value));
    }
    dispatch(
      tradeDetailActions.getRfqs({
        organizationId,
        deskId,
        investorId,
        tradeId,
      })
    );

    console.log("input change handeled");
  };

  return (
    <input onChange={handleAmountChange} type="number" value={tradeAmount} />
  );
};

export default AmountInput;
