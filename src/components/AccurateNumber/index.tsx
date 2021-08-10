import React from "react";
import { BigNumber } from "bignumber.js";

const AccurateNumber = ({
  number,
  decimalPlaces = 2,
}: {
  number: string;
  decimalPlaces?: number;
}): React.ReactElement => {
  return <>{new BigNumber(number).toFixed(decimalPlaces).toString()}</>;
};
AccurateNumber.defaultProps = { decimalPlaces: 2 };

export default AccurateNumber;
