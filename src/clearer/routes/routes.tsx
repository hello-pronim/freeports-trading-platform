import { lazy } from "react";

export default [
  {
    path: "/signin",
    exact: true,
    component: lazy(() => import("../components/Auth/SignIn")),
  },
  {
    path: "/signin-otp",
    exact: true,
    component: lazy(() => import("../components/Auth/OTPSignIn")),
  },
  {
    path: "/dashboard",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Dashboard")),
  },
  {
    path: "/organizations",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Organizations")),
  },
  {
    path: "/organizations/add",
    exact: true,
    auth: true,
    component: lazy(
      () => import("../components/Organizations/AddOrganization")
    ),
  },
  {
    path: "/organizations/edit/:id",
    exact: true,
    auth: true,
    component: lazy(
      () => import("../components/Organizations/EditOrganization")
    ),
  },
  {
    path: "/organizations/:organizationId/managers/add",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Organizations/AddManager")),
  },
  {
    path: "/nostro-accounts",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/NostroAccounts")),
  },
  {
    path: "/nostro-accounts/:id",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/NostroAccounts/Detail")),
  },
  {
    path: "/roles",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Roles")),
  },
  {
    path: "/roles/add/:vaultType",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Roles/AddRole")),
  },
  {
    path: "/",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Dashboard")),
  },
  {
    path: "/co-workers",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/CoWorker")),
  },
  {
    path: "/co-workers/:coWorkerId",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/CoWorker")),
  },
  {
    path: "/profile",
    exact: true,
    auth: true,
    component: lazy(() => import("../../components/Profile")),
  },
  {
    path: "/settings",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Settings")),
  },
  {
    path: "/reset-password/:userId/:token",
    exact: true,
    component: lazy(() => import("../components/Auth/ResetPassword")),
  },
  {
    path: "/vault-request",
    exact: true,
    auth: true,
    component: lazy(() => import("../../components/VaultRequest")),
  },
  /* {
    path: "/requests",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Requests")),
  }, */
];
