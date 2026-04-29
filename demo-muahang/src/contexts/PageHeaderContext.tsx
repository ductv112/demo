import React, { createContext, useContext, useState } from 'react';

interface PageHeaderContextType {
  headerActions: React.ReactNode;
  setHeaderActions: (actions: React.ReactNode) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType>({
  headerActions: null,
  setHeaderActions: () => {},
});

export const PageHeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [headerActions, setHeaderActions] = useState<React.ReactNode>(null);
  return (
    <PageHeaderContext.Provider value={{ headerActions, setHeaderActions }}>
      {children}
    </PageHeaderContext.Provider>
  );
};

export const usePageHeader = () => useContext(PageHeaderContext);
