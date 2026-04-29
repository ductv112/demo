import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'finance' | 'department' | 'director';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  position: string;
}

const userProfiles: Record<UserRole, AppUser> = {
  finance: {
    id: 'U001',
    name: 'Nguyễn Thị Lan',
    role: 'finance',
    departmentId: 'PTCKT',
    departmentName: 'Phòng Tài chính - Kế toán',
    position: 'Trưởng phòng TC-KT',
  },
  department: {
    id: 'U002',
    name: 'Hoàng Minh Tuấn',
    role: 'department',
    departmentId: 'PKH',
    departmentName: 'Phòng Kế hoạch',
    position: 'Trưởng phòng',
  },
  director: {
    id: 'U003',
    name: 'Phạm Quốc Hưng',
    role: 'director',
    departmentId: 'BGD',
    departmentName: 'Ban Giám đốc',
    position: 'Tổng Giám đốc',
  },
};

export const roleLabels: Record<UserRole, string> = {
  finance: 'Phòng TC-KT',
  department: 'Phòng ban',
  director: 'Ban Giám đốc',
};

interface UserContextType {
  currentUser: AppUser;
  switchRole: (role: UserRole) => void;
  isFinance: boolean;
  isDepartment: boolean;
  isDirector: boolean;
}

const UserContext = createContext<UserContextType>(null!);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('finance');
  const currentUser = userProfiles[role];

  const switchRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        switchRole,
        isFinance: role === 'finance',
        isDepartment: role === 'department',
        isDirector: role === 'director',
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
