import { createContext, useContext, useState, ReactNode } from "react";
import { AdminModeContext } from "@/types";

const AppContext = createContext<AdminModeContext | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [adminMode, setAdminMode] = useState(false);

  const toggleAdminMode = () => {
    setAdminMode(prev => !prev);
  };

  return (
    <AppContext.Provider value={{ adminMode, toggleAdminMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
