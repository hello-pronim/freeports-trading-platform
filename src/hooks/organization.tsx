import { useDispatch } from "react-redux";
import {
  retrieveOrganizations,
  retrieveOrganization,
  createOrganization,
  updateOrganization,
  retrieveOrganizationManagers,
  retrieveOrganizationManager,
  createOrganizationManager,
  updateOrganizationManager,
  suspendOrganizationManager,
  resumeOrganizationManager,
} from "../services/organizationService";
import { useGlobalSlice } from "../slice";

function useOrganization(): any {
  const dispatch = useDispatch();
  const { actions } = useGlobalSlice();

  const getOrganizations = async () => {
    dispatch(actions.clearError());
    const organizations = await retrieveOrganizations()
      .then((data: any) => {
        return data;
      })
      .catch((err) => {
        dispatch(actions.setError(err));
      });
    return organizations;
  };
  const getOrganization = async (id: string) => {
    dispatch(actions.clearError());
    const organizationDetail = await retrieveOrganization(id)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        dispatch(actions.setError(err));
      });
    return organizationDetail;
  };

  const addOrganization = async (
    name: string,
    street: string,
    street2: string,
    zip: string,
    city: string,
    country: string,
    logo: string,
    commissionOrganization: string,
    commissionClearer: string
  ) => {
    dispatch(actions.clearError());
    const newOrganization = await createOrganization({
      name,
      street,
      street2,
      zip,
      city,
      country,
      logo,
      commissionOrganization,
      commissionClearer,
    })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        dispatch(actions.setError(err));
      });
    return newOrganization;
  };

  const editOrganization = async (
    organizerId: string,
    createdAt: Date,
    name: string,
    logo: string,
    commissionOrganization: string,
    commissionClearer: string
  ) => {
    dispatch(actions.clearError());
    const updatedOrganization = await updateOrganization(
      organizerId,
      createdAt,
      name,
      logo,
      commissionOrganization,
      commissionClearer
    )
      .then((data) => {
        return data;
      })
      .catch((err) => {
        dispatch(actions.setError(err));
      });
    return updatedOrganization;
  };

  const getManagers = async (id: string) => {
    dispatch(actions.clearError());
    const managers = await retrieveOrganizationManagers(id)
      .then((data) => {
        return data.content;
      })
      .catch((err) => {
        dispatch(actions.setError(err));
      });
    return managers;
  };

  const getManager = async (organizedId: string, managerId: string) => {
    dispatch(actions.clearError());
    const manager = await retrieveOrganizationManager(organizedId, managerId)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        dispatch(actions.setError(err));
      });
    return manager;
  };

  const addManager = async (
    organizerId: string,
    nickname: string,
    email: string,
    password: string,
    phone: string,
    avatar: string
  ) => {
    dispatch(actions.clearError());
    const manager = await createOrganizationManager(
      organizerId,
      nickname,
      email,
      password,
      phone,
      avatar
    )
      .then((data) => {
        return data;
      })
      .catch((err) => {
        dispatch(actions.setError(err));
      });
    return manager;
  };

  const editManager = async (
    organizerId: string,
    managerId: string,
    nickname: string,
    email: string,
    phone: string,
    avatar: string
  ) => {
    dispatch(actions.clearError());
    const updatedOrganizationManager = await updateOrganizationManager(
      organizerId,
      managerId,
      nickname,
      email,
      phone,
      avatar
    )
      .then((data) => {
        return data;
      })
      .catch((err) => {
        dispatch(actions.setError(err));
      });
    return updatedOrganizationManager;
  };

  const suspendManager = async (organizerId: string, managerId: string) => {
    dispatch(actions.clearError());
    const suspend = await suspendOrganizationManager(organizerId, managerId)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        dispatch(actions.setError(err));
      });
    return suspend;
  };

  const resumeManager = async (organizerId: string, managerId: string) => {
    dispatch(actions.clearError());
    const resume = await resumeOrganizationManager(organizerId, managerId)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        dispatch(actions.setError(err));
      });
    return resume;
  };

  return {
    getOrganizations,
    getOrganization,
    addOrganization,
    editOrganization,
    getManagers,
    getManager,
    addManager,
    editManager,
    suspendManager,
    resumeManager,
  };
}

export default useOrganization;
