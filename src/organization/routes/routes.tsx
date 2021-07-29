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
    path: "/",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Dashboard")),
  },
  {
    path: "/dashboard",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Dashboard")),
  },
  {
    path: "/desks",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Desks")),
  },
  {
    path: "/desks/:deskId",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Desks/Detail")),
  },
  {
    path: "/investors",
    exact: true,
    auth: true,
    certificate: true,
    component: lazy(() => import("../components/Investors")),
  },
  {
    path: "/desks/:deskId/investors/:investorId",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Investors/Detail")),
  },
  {
    path: "/trades",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Trades")),
  },
  {
    path: "/desks/:deskId/investors/:investorId/trades/:tradeId",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Trades/Detail")),
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
    path: "/roles",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Roles")),
  },
  {
    path: "/roles/add",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Roles/Add")),
  },
  {
    path: "/multi-desk/roles/add",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Roles/Add/MultiDeskRole")),
  },
  {
    path: "/desk/roles/add",
    exact: true,
    auth: true,
    component: lazy(() => import("../components/Roles/Add/DeskRole")),
  },
  {
    path: "/reset-password/:userId/:token",
    exact: true,
    component: lazy(() => import("../components/Auth/ResetPassword")),
  },
  /* {
    path: "/error",
    exact: true,l
    auth: true,
    component: lazy(() => import("../components/Error")),
  }, */
];
