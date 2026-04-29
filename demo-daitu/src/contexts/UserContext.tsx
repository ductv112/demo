import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'technical' | 'department' | 'director';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  position: string;
}

const userProfiles: Record<UserRole, AppUser> = {
  technical: {
    id: 'U001',
    name: 'Trần Văn Hùng',
    role: 'technical',
    departmentId: 'PKT',
    departmentName: 'Phòng Kỹ thuật',
    position: 'Trưởng phòng Kỹ thuật',
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
    position: 'Giám đốc Trung tâm',
  },
};

export const roleLabels: Record<UserRole, string> = {
  technical: 'Phòng Kỹ thuật',
  department: 'Phòng ban',
  director: 'Ban Giám đốc',
};

interface UserContextType {
  currentUser: AppUser;
  switchRole: (role: UserRole) => void;
  isTechnical: boolean;
  isDepartment: boolean;
  isDirector: boolean;
}

const UserContext = createContext<UserContextType>(null!);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('technical');
  const currentUser = userProfiles[role];

  const switchRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        switchRole,
        isTechnical: role === 'technical',
        isDepartment: role === 'department',
        isDirector: role === 'director',
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
