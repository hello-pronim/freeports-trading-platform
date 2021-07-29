import axios from "../util/axios";
import TradeRequest from "../types/TradeRequest";
import PaginatedResponse from "../types/PaginatedResponse";

const getAllTradeRequests = (): Promise<TradeRequest[]> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/my/request/trade`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getInvestorTradeRequests = (
  organizationId: string,
  deskId: string,
  investorId: string
): Promise<PaginatedResponse<TradeRequest[]>> => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/trade`
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getTradeRequest = (
  organizationId: string,
  deskId: string,
  investorId: string,
  tradeId: string
): Promise<TradeRequest> => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/trade/${tradeId}`
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const createTradeRequest = (
  organizationId: string,
  deskId: string,
  investorId: string,
  trade: TradeRequest
): Promise<TradeRequest[]> => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/trade`,
        trade
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

export {
  getAllTradeRequests as default,
  getAllTradeRequests,
  getTradeRequest,
  getInvestorTradeRequests,
  createTradeRequest,
};
