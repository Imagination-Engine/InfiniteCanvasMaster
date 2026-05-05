// @ts-nocheck
import React, { createContext, useContext } from "react";
import type { OpenClawBlockAdapter } from "../../contracts/openclaw";
import { NoRuntimeOpenClawAdapter } from "./NoRuntimeAdapter";

const OpenClawAdapterContext = createContext<OpenClawBlockAdapter>(
  new NoRuntimeOpenClawAdapter(),
);

export const OpenClawAdapterProvider: React.FC<{
  adapter: OpenClawBlockAdapter;
  children: React.ReactNode;
}> = ({ adapter, children }) => {
  return (
    <OpenClawAdapterContext.Provider value={adapter}>
      {children}
    </OpenClawAdapterContext.Provider>
  );
};

export const useOpenClawAdapter = () => {
  const context = useContext(OpenClawAdapterContext);
  if (!context) {
    throw new Error(
      "useOpenClawAdapter must be used within an OpenClawAdapterProvider",
    );
  }
  return context;
};
