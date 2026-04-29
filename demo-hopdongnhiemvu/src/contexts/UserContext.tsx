import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'planning' | 'department' | 'director';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  position: string;
}

const userProfiles: Record<UserRole, AppUser> = {
  planning: {
    id: 'U001',
    name: 'Hoàng Minh Tuấn',
    role: 'planning',
    departmentId: 'PKH',
    departmentName: 'Phòng Kế hoạch',
    position: 'Trưởng phòng KH',
  },
  department: {
    id: 'U002',
    name: 'Nguyễn Thanh Sơn',
    role: 'department',
    departmentId: 'PX1',
    departmentName: 'Trung tâm Hệ thống Monitoring',
    position: 'Trưởng Trung tâm Alpha',
  },
  director: {
    id: 'U003',
    name: 'Phạm Quốc Hưng',
    role: 'director',
    departmentId: 'BGD',
    departmentName: 'Ban Giám đốc',
    position: 'Giám đốc Doanh nghiệp A',
  },
};

export const roleLabels: Record<UserRole, string> = {
  planning: 'Phòng KH',
  department: 'Trung tâm',
  director: 'Ban Giám đốc',
};

interface UserContextType {
  currentUser: AppUser;
  switchRole: (role: UserRole) => void;
  isPlanning: boolean;
  isDepartment: boolean;
  isDirector: boolean;
}

const UserContext = createContext<UserContextType>(null!);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('planning');
  const currentUser = userProfiles[role];

  const switchRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        switchRole,
        isPlanning: role === 'planning',
        isDepartment: role === 'department',
        isDirector: role === 'director',
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
