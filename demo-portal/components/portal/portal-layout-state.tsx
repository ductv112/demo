"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type LayoutState = {
  /** When true, the slim header slides up out of view (used during nav handoff). */
  headerHidden: boolean;
  setHeaderHidden: Dispatch<SetStateAction<boolean>>;
};

const Ctx = createContext<LayoutState | null>(null);

export function PortalLayoutStateProvider({ children }: { children: ReactNode }) {
  const [headerHidden, setHeaderHidden] = useState(false);
  return (
    <Ctx.Provider value={{ headerHidden, setHeaderHidden }}>
      {children}
    </Ctx.Provider>
  );
}

/** Safe to call from anywhere — returns no-op state when used outside the provider. */
export function useLayoutState(): LayoutState {
  const ctx = useContext(Ctx);
  if (ctx) return ctx;
  return { headerHidden: false, setHeaderHidden: () => {} };
}
