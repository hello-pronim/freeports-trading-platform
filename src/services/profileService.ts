import axios from "../util/axios";

const getUserProfile = (orgId: string, userId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (orgId) {
      // get profile for organization user
      axios
        .get(`/organization/${orgId}/user/${userId}`)
        .then((res: any) => {
          return resolve(res.data);
        })
        .catch((err) => {
          return reject(err.response.data);
        });
    } else {
      // get profile for clearer
      axios
        .get(`/user/${userId}`)
        .then((res: any) => {
          return resolve(res.data);
        })
        .catch((err) => {
          return reject(err.response.data);
        });
    }
  });
};

const addPublicKey = (key: string, name: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/my/public-key`, { key, name })
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

const revokeKey = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(`/my/public-key/revoke`)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch((err) => {
        return reject(err.response.data);
      });
  });
};

export { getUserProfile as default, getUserProfile, addPublicKey, revokeKey };
