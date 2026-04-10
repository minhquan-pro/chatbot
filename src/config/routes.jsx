import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { RequireAuth } from "@/components/RequireAuth";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const NewChatPage = lazy(() => import("@/pages/NewChatPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const ChatbotPage = lazy(() => import("@/pages/ChatbotPage"));

/**
 * All app paths and page components live here — no duplicate path strings in App.jsx.
 * @type {import('react-router-dom').RouteObject[]}
 */
export const routes = [
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      {
        path: "/users",
        element: (
          <RequireAuth>
            <UsersPage />
          </RequireAuth>
        ),
      },
      {
        path: "/newchat",
        element: (
          <RequireAuth>
            <NewChatPage />
          </RequireAuth>
        ),
      },
      {
        path: "/chat/:conversationId",
        element: (
          <RequireAuth>
            <ChatPage />
          </RequireAuth>
        ),
      },
      {
        path: "/chatbot",
        element: (
          <RequireAuth>
            <ChatbotPage />
          </RequireAuth>
        ),
      },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "*", element: <Navigate to="/" replace /> },
];
