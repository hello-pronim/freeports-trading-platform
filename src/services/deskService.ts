import axios from "../util/axios";
import Desk, { TradeLevel } from "../types/Desk";

const getAllDesks = (organizationId: string): Promise<Desk[]> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/organization/${organizationId}/desk`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getMyDesks = (): Promise<Desk[]> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/my/desk`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getDesk = (organizationId: string, deskId: string): Promise<Desk> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/organization/${organizationId}/desk/${deskId}`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const createDesk = (organizationId: string, desk: Desk): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/organization/${organizationId}/desk`, desk)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const deleteDesk = (organizationId: string, deskId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/organization/${organizationId}/desk/${deskId}`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const updateTradeLevels = (
  organizationId: string,
  deskId: string,
  tradeLevels: TradeLevel[]
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .patch(`/organization/${organizationId}/desk/${deskId}/trade-level`, {
        tradeLevels,
      })
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

export {
  getAllDesks as default,
  getAllDesks,
  getMyDesks,
  getDesk,
  createDesk,
  deleteDesk,
  updateTradeLevels,
};
