import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));

/**
 * All app paths and page components live here — no duplicate path strings in App.jsx.
 * @type {import('react-router-dom').RouteObject[]}
 */
export const routes = [
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/chat",
    element: <RequireAuth><ChatPage /></RequireAuth>,
  },
  { path: "*", element: <Navigate to="/" replace /> },
];
