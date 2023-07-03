import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ChakraProvider } from "@chakra-ui/react";
// ChakraProvider is component based library which makes app and development really faster

import "./index.css";
import App from "./App";
import HomePage from "./Pages/HomePage";
import ChatPage from "./Pages/ChatPage";
import EmailVerify from "./Pages/components/Authentication/EmailVerify";
import ForgotPassword from "./Pages/components/Authentication/ForgotPassword";

const root = ReactDOM.createRoot(document.getElementById("root"));

const routingConfiguration = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/user/:email/forgotpassword",
        element: <ForgotPassword />,
      },
      {
        path: "/user/:id/verify/:timestamp",
        element: <EmailVerify />,
      },
      {
        path: "/chats",
        element: <ChatPage />,
      },
    ],
  },
]);
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <RouterProvider router={routingConfiguration}></RouterProvider>
    </ChakraProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
