import { jsx as _jsx } from "react/jsx-runtime";
// @ts-nocheck
import { createContext, useContext } from "react";
import { NoRuntimeOpenClawAdapter } from "./NoRuntimeAdapter";
const OpenClawAdapterContext = createContext(new NoRuntimeOpenClawAdapter());
export const OpenClawAdapterProvider = ({ adapter, children }) => {
  return _jsx(OpenClawAdapterContext.Provider, {
    value: adapter,
    children: children,
  });
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
