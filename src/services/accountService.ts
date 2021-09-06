import axios from "../util/axios";
import Account from "../types/Account";
import Operation from "../types/Operation";

const getAllAccounts = (): Promise<Account[]> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/account`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const getAccount = (accountId: string): Promise<Account> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/account/${accountId}`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const createAccount = (account: Account): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/account`, account)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const deleteAccount = (accountId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/account/${accountId}`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const assignOrganizationAccount = (
  organizerId: string,
  accountId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .put(`/account/${accountId}/${organizerId}`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const unassignOrganizationAccount = (
  organizerId: string,
  accountId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/account/${accountId}/${organizerId}`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const getAllOperations = (accountId: string): Promise<Operation[]> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/account/${accountId}/operation`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const createOperation = (
  accountId: string,
  operations: Array<Operation>
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/account/${accountId}/operation`, operations)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const deleteOperation = (
  accountId: string,
  operationId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/account/${accountId}/operation/${operationId}`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response);
      });
  });
};

const getAllMoveRequests = (accountId: string): Promise<Operation[]> => {
  return new Promise((resolve, reject) => {
    axios
      .get(`/account/${accountId}/request`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

export {
  getAllAccounts as default,
  getAllAccounts,
  getAccount,
  createAccount,
  deleteAccount,
  assignOrganizationAccount,
  unassignOrganizationAccount,
  createOperation,
  getAllOperations,
  deleteOperation,
  getAllMoveRequests,
};
