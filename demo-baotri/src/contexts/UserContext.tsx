import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'maintenance' | 'department' | 'director';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  position: string;
}

const userProfiles: Record<UserRole, AppUser> = {
  maintenance: {
    id: 'U001',
    name: 'Trần Đức Mạnh',
    role: 'maintenance',
    departmentId: 'PKT',
    departmentName: 'Phòng Kỹ thuật',
    position: 'Trưởng phòng Kỹ thuật',
  },
  department: {
    id: 'U002',
    name: 'Hoàng Minh Tuấn',
    role: 'department',
    departmentId: 'PX1',
    departmentName: 'Trung tâm Vận hành Hạ tầng',
    position: 'Trưởng trung tâm',
  },
  director: {
    id: 'U003',
    name: 'Phạm Quốc Hưng',
    role: 'director',
    departmentId: 'BGD',
    departmentName: 'Ban Giám đốc',
    position: 'Giám đốc',
  },
};

export const roleLabels: Record<UserRole, string> = {
  maintenance: 'Phòng Kỹ thuật',
  department: 'Trung tâm',
  director: 'Ban Giám đốc',
};

interface UserContextType {
  currentUser: AppUser;
  switchRole: (role: UserRole) => void;
  isMaintenance: boolean;
  isDepartment: boolean;
  isDirector: boolean;
}

const UserContext = createContext<UserContextType>(null!);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('maintenance');
  const currentUser = userProfiles[role];

  const switchRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        switchRole,
        isMaintenance: role === 'maintenance',
        isDepartment: role === 'department',
        isDirector: role === 'director',
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
