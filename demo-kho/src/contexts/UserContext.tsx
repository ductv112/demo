import React, { createContext, useContext } from 'react';

export interface AppUser {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  position: string;
}

const currentUser: AppUser = {
  id: 'U001',
  name: 'Trần Đức Mạnh',
  departmentId: 'PHCKT',
  departmentName: 'Phòng Logistics - Kỹ thuật',
  position: 'Trưởng phòng Logistics-KT',
};

interface UserContextType {
  currentUser: AppUser;
}

const UserContext = createContext<UserContextType>(null!);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UserContext.Provider value={{ currentUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
