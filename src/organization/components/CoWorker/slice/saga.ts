import { PayloadAction } from "@reduxjs/toolkit";
import {
  takeEvery,
  call,
  put,
  select,
  take,
  takeLatest,
  delay,
} from "redux-saga/effects";

import { coWorkActions as actions } from ".";
import {
  createOrgUser,
  getOrgUsers,
  getOrgUser,
  suspendOrgUser,
  resumeOrgUser,
  updateOrgUser,
  sendResetPasswordEmail,
} from "../../../../services/orgUsersService";
import {
  assignOrgRolesToUser,
  updateOrgRolesToUser,
} from "../../../../services/roleService";
import PaginatedResponse from "../../../../types/PaginatedResponse";
import { ResourceCreatedResponse } from "../../../../types/ResourceCreatedResponse";
import User from "../../../../types/User";
import { selectCoWorkers, selectSelectedCoWorker } from "./selectors";
import { snackbarActions } from "../../../../components/Snackbar/slice";

export function* getCoWorkers({
  payload,
}: PayloadAction<{ organizationId: string; search?: string }>): Generator<any> {
  try {
    yield delay(300);
    const response = yield call(
      getOrgUsers,
      payload.organizationId,
      payload.search
    );
    yield put(
      actions.getCoWorkersSuccess((response as PaginatedResponse<User>).content)
    );
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* createCoWorker({
  payload,
}: PayloadAction<{ organizationId: string; user: User }>): Generator<any> {
  try {
    const response = yield call(
      createOrgUser,
      payload.organizationId,
      payload.user
    );

    // assign user roles
    if (payload.user.roles?.length) {
      yield call(
        assignOrgRolesToUser,
        payload.organizationId,
        (response as ResourceCreatedResponse).id,
        payload.user.roles
      );
    }
    yield put(
      actions.createCoWorkerSuccess(response as ResourceCreatedResponse)
    );
    yield put(
      snackbarActions.showSnackbar({
        message: "Co-Worker Created",
        type: "success",
      })
    );
    yield put(actions.getCoWorkers({ organizationId: payload.organizationId }));

    yield take(actions.getCoWorkersSuccess);

    const coWorkers = yield select(selectCoWorkers);
    const selectedCoWorker = (coWorkers as Array<User>).find(
      (c) => c.id === (response as ResourceCreatedResponse).id
    );
    if (selectedCoWorker) {
      yield put(actions.selectCoWorker(selectedCoWorker));
    }
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* updateCoWorker({
  payload,
}: PayloadAction<{
  organizationId: string;
  id: string;
  updates: Partial<User>;
}>): Generator<any> {
  try {
    const response = yield call(
      updateOrgUser,
      payload.organizationId,
      payload.id,
      payload.updates
    );
    if (payload.updates.roles) {
      yield call(
        updateOrgRolesToUser,
        payload.organizationId,
        payload.id,
        payload.updates.roles
      );
    }

    yield put(
      actions.updateCoWorkerSuccess(response as ResourceCreatedResponse)
    );
    yield put(
      snackbarActions.showSnackbar({
        message: "Co-Worker updated",
        type: "success",
      })
    );
    yield put(actions.getCoWorkers({ organizationId: payload.organizationId }));

    yield take(actions.getCoWorkersSuccess);

    const coWorkers = yield select(selectCoWorkers);
    const selectedCoWorker = (coWorkers as Array<User>).find(
      (c) => c.id === (response as ResourceCreatedResponse).id
    );
    if (selectedCoWorker) {
      yield put(actions.selectCoWorker(selectedCoWorker));
    }
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* getCoWorker({ payload }: PayloadAction<User>): Generator<any> {
  try {
    if (payload.organization && payload.id) {
      const response: any = yield call(
        getOrgUser,
        payload.organization,
        payload.id
      );

      if (!(response as User).roles || !(response as User).roles?.length) {
        (response as User).roles = [""];
      } else {
        response.roles = response.roles?.map((r: any) => r.id);
      }
      yield put(actions.selectCoWorkerSuccess(response as User));
    } else {
      yield put(actions.selectCoWorkerSuccess(payload));
    }
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}
/* 
export function* suspendCoWorker({
  payload,
}: PayloadAction<{ id: string }>): Generator<any> {
  try {
    if (payload.id) {
      yield call(suspendOrgUser, payload.id);
      yield put(actions.suspendCoWorkerSuccess());
      const selectedCoWorker = yield select(selectSelectedCoWorker);
      yield put(actions.selectCoWorker(selectedCoWorker as User));
      yield put(
        snackbarActions.showSnackbar({
          message: "User Suspended",
          type: "success",
        })
      );
    }
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}
export function* resumeCoWorker({
  payload,
}: PayloadAction<{ id: string }>): Generator<any> {
  try {
    if (payload.id) {
      yield call(resumeOrgUser, payload.id);
      yield put(actions.resumeCoWorkerSuccess());
      const selectedCoWorker = yield select(selectSelectedCoWorker);
      yield put(actions.selectCoWorker(selectedCoWorker as User));
      yield put(
        snackbarActions.showSnackbar({
          message: "User reactivated",
          type: "success",
        })
      );
    }
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
}

export function* sendCoWorkerResetPasswordEmail({
  payload,
}: PayloadAction<{ id: string }>): Generator<any> {
  try {
    if (payload.id) {
      const response: any = yield call(sendResetPasswordEmail, payload.id);
      yield put(actions.sendCoWorkerResetPasswordEmailSuccess());
      if (response.success) {
        yield put(
          snackbarActions.showSnackbar({
            message: "Successfully sent reset password email",
            type: "success",
          })
        );
      } else {
        yield put(
          snackbarActions.showSnackbar({
            message: "Failed to send email",
            type: "error",
          })
        );
      }
    }
  } catch (error) {
    yield put(
      snackbarActions.showSnackbar({
        message: error.data.message,
        type: "error",
      })
    );
  }
} */

export function* coWorkersSaga(): Generator<any> {
  yield takeLatest(actions.getCoWorkers, getCoWorkers);
  /* yield takeEvery(actions.createCoWorker, createCoWorker); */
  yield takeEvery(actions.selectCoWorker, getCoWorker);
  yield takeEvery(actions.updateCoWorker, updateCoWorker);
  /* yield takeEvery(actions.suspendCoWorker, suspendCoWorker);
  yield takeEvery(actions.resumeCoWorker, resumeCoWorker);
  yield takeEvery(
    actions.sendCoWorkerResetPasswordEmail,
    sendCoWorkerResetPasswordEmail
  ); */
}