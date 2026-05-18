import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface MobileSidebarContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MobileSidebarCtx = createContext<MobileSidebarContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openFn = useCallback(() => setIsOpen(true), []);
  const closeFn = useCallback(() => setIsOpen(false), []);
  const toggleFn = useCallback(() => setIsOpen((v) => !v), []);

  const ctx = {
    isOpen,
    open: openFn,
    close: closeFn,
    toggle: toggleFn,
  };

  return (
    <MobileSidebarCtx.Provider value={ctx}>
      {children}
    </MobileSidebarCtx.Provider>
  );
}

export function useMobileSidebar() {
  return useContext(MobileSidebarCtx);
}
