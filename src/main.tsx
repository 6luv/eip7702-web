import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import WalletProvider from "./contexts/WalletProvider";
import "./styles/global.css";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <WalletProvider>
        <RouterProvider router={router} />
      </WalletProvider>
    </ChakraProvider>
  </React.StrictMode>,
);
