import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'vongdoi' | 'department' | 'director';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  position: string;
}

const userProfiles: Record<UserRole, AppUser> = {
  vongdoi: {
    id: 'U001',
    name: 'Trần Đức Thắng',
    role: 'vongdoi',
    departmentId: 'PKT',
    departmentName: 'Phòng Kỹ thuật',
    position: 'Trưởng phòng Kỹ thuật',
  },
  department: {
    id: 'U002',
    name: 'Hoàng Minh Tuấn',
    role: 'department',
    departmentId: 'PX1',
    departmentName: 'TT Monitoring',
    position: 'Trưởng nhóm Trung tâm',
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
  vongdoi: 'P. Kỹ thuật',
  department: 'Trung tâm',
  director: 'Ban Giám đốc',
};

interface UserContextType {
  currentUser: AppUser;
  switchRole: (role: UserRole) => void;
  isVongDoi: boolean;
  isDepartment: boolean;
  isDirector: boolean;
}

const UserContext = createContext<UserContextType>(null!);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('vongdoi');
  const currentUser = userProfiles[role];

  const switchRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        switchRole,
        isVongDoi: role === 'vongdoi',
        isDepartment: role === 'department',
        isDirector: role === 'director',
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
