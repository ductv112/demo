import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'safety' | 'department' | 'director';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  position: string;
}

const userProfiles: Record<UserRole, AppUser> = {
  safety: {
    id: 'U001',
    name: 'Nguyễn Văn Đức',
    role: 'safety',
    departmentId: 'PKCDB',
    departmentName: 'Phòng KCS & Đảm bảo CL',
    position: 'Trưởng phòng An toàn',
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
  safety:     'Phòng An toàn',
  department: 'Phòng ban / TT',
  director:   'Ban Giám đốc',
};

interface UserContextType {
  currentUser: AppUser;
  switchRole: (role: UserRole) => void;
  isSafety: boolean;
  isDepartment: boolean;
  isDirector: boolean;
}

const UserContext = createContext<UserContextType>(null!);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('safety');
  const currentUser = userProfiles[role];

  const switchRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        switchRole,
        isSafety:     role === 'safety',
        isDepartment: role === 'department',
        isDirector:   role === 'director',
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
