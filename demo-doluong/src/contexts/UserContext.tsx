import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'metrology' | 'department' | 'director';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  position: string;
}

const userProfiles: Record<UserRole, AppUser> = {
  metrology: {
    id: 'U001',
    name: 'Trần Quốc Bảo',
    role: 'metrology',
    departmentId: 'PKCDB',
    departmentName: 'Phòng QA & Đảm bảo CL',
    position: 'Trưởng phòng QA',
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
    position: 'Tổng Giám đốc Doanh nghiệp A',
  },
};

export const roleLabels: Record<UserRole, string> = {
  metrology: 'Phòng QA',
  department: 'Phòng ban',
  director: 'Ban Giám đốc',
};

interface UserContextType {
  currentUser: AppUser;
  switchRole: (role: UserRole) => void;
  isMetrology: boolean;
  isDepartment: boolean;
  isDirector: boolean;
}

const UserContext = createContext<UserContextType>(null!);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('metrology');
  const currentUser = userProfiles[role];

  const switchRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        switchRole,
        isMetrology: role === 'metrology',
        isDepartment: role === 'department',
        isDirector: role === 'director',
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
