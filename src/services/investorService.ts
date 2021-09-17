import axios from "../util/axios";
import Account from "../types/Account";
import Investor from "../types/Investor";
import FundRequest from "../types/FundRequest";
import RefundRequest from "../types/RefundRequest";
import MoveRequest from "../types/MoveRequest";

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

const getInvestorAccount = (
  organizationId: string,
  deskId: string,
  investorId: string,
  accountId: string
): Promise<Account> => {
  return new Promise((resolve, reject) => {
    axios
      .get(
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
): Promise<any> => {
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

const getInvestorAccountBalance = (
  organizationId: string,
  deskId: string,
  investorId: string,
  accountId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/account/${accountId}/balance`
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const getFundRequests = (
  organizationId: string,
  deskId: string,
  investorId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/fund`
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const createFundRequest = (
  organizationId: string,
  deskId: string,
  investorId: string,
  request: FundRequest
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/fund`,
        request
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const getRefundRequests = (
  organizationId: string,
  deskId: string,
  investorId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/refund`
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const createRefundRequest = (
  organizationId: string,
  deskId: string,
  investorId: string,
  request: RefundRequest
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/refund`,
        request
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const getMoveRequests = (
  organizationId: string,
  deskId: string,
  investorId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/move`
      )
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const createMoveRequest = (
  organizationId: string,
  deskId: string,
  investorId: string,
  request: MoveRequest
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `/organization/${organizationId}/desk/${deskId}/investor/${investorId}/move`,
        request
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
  getInvestorAccount,
  createInvestorAccount,
  deleteInvestorAccount,
  getInvestorAccountOperations,
  getInvestorAccountBalance,
  getFundRequests,
  createFundRequest,
  getRefundRequests,
  createRefundRequest,
  getMoveRequests,
  createMoveRequest,
};
