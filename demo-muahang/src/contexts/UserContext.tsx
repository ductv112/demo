import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'procurement' | 'department' | 'director';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  position: string;
}

const userProfiles: Record<UserRole, AppUser> = {
  procurement: {
    id: 'U001',
    name: 'Lê Văn Hải',
    role: 'procurement',
    departmentId: 'PHCKT',
    departmentName: 'Phòng Logistics - Kỹ thuật',
    position: 'Trưởng phòng LG-KT',
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
    position: 'Giám đốc Doanh nghiệp A',
  },
};

export const roleLabels: Record<UserRole, string> = {
  procurement: 'Phòng LG-KT',
  department: 'Phòng ban',
  director: 'Ban Giám đốc',
};

interface UserContextType {
  currentUser: AppUser;
  switchRole: (role: UserRole) => void;
  isProcurement: boolean;
  isDepartment: boolean;
  isDirector: boolean;
}

const UserContext = createContext<UserContextType>(null!);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('procurement');
  const currentUser = userProfiles[role];

  const switchRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        switchRole,
        isProcurement: role === 'procurement',
        isDepartment: role === 'department',
        isDirector: role === 'director',
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
