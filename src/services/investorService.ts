import axios from "../util/axios";
import Account from "../types/Account";
import Investor from "../types/Investor";

const getAllInvestors = (): Promise<Investor[]> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/my/investor`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getInvestor = (
  organizationId: string,
  deskId: string,
  investorId: string
): Promise<Investor> => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}`
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const createInvestor = (
  organizationId: string,
  deskId: string,
  investor: Investor
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/organization/${organizationId}/desk/${deskId}/investor`, investor)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const deleteInvestor = (
  organizationId: string,
  deskId: string,
  investorId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}`
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const getInvestorAccounts = (
  organizationId: string,
  deskId: string,
  investorId: string
): Promise<Account[]> => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/account`
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const createInvestorAccount = (
  organizationId: string,
  deskId: string,
  investorId: string,
  account: Account
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/account`,
        account
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const deleteInvestorAccount = (
  organizationId: string,
  deskId: string,
  investorId: string,
  accountId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/account/${accountId}`
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const getInvestorAccountOperations = (
  organizationId: string,
  deskId: string,
  investorId: string,
  accountId: string
): Promise<Account[]> => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/account/${accountId}/operations`
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

export {
  getAllInvestors as default,
  getAllInvestors,
  getInvestor,
  createInvestor,
  deleteInvestor,
  getInvestorAccounts,
  createInvestorAccount,
  deleteInvestorAccount,
  getInvestorAccountOperations,
};
