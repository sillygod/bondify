import { createContext, useContext, useState, ReactNode } from "react";

interface LayoutControlContextType {
  hideHeader: boolean;
  setHideHeader: (hide: boolean) => void;
}

const LayoutControlContext = createContext<LayoutControlContextType>({
  hideHeader: false,
  setHideHeader: () => {},
});

export const LayoutControlProvider = ({ children }: { children: ReactNode }) => {
  const [hideHeader, setHideHeader] = useState(false);

  return (
    <LayoutControlContext.Provider value={{ hideHeader, setHideHeader }}>
      {children}
    </LayoutControlContext.Provider>
  );
};

export const useLayoutControl = () => useContext(LayoutControlContext);
