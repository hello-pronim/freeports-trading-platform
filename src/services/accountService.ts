import axios from "../util/axios";
import Account from "../types/Account";

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

const createAccount = (account: Account): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .put(`/account`, account)
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

export {
  getAllAccounts as default,
  getAllAccounts,
  createAccount,
  assignOrganizationAccount,
  unassignOrganizationAccount,
};
