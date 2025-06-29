import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socketService } from '../services/socket';

interface TableUser {
  userId: string;
  userName: string;
  isOwner?: boolean;
  joinedAt?: string;
}

interface TableUsersContextType {
  users: TableUser[];
  totalUsers: number;
  currentUser: TableUser | null;
  addUser: (user: TableUser) => void;
  removeUser: (userId: string) => void;
  updateUsers: (users: TableUser[]) => void;
}

const TableUsersContext = createContext<TableUsersContextType | undefined>(undefined);

interface TableUsersProviderProps {
  children: React.ReactNode;
}

export const TableUsersProvider: React.FC<TableUsersProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<TableUser[]>([]);
  
  // Detectar el usuario actual dinámicamente
  const getCurrentUser = useCallback(async () => {
    const currentUserId = await AsyncStorage.getItem('userId');
    const currentUserName = await AsyncStorage.getItem('userName');
    const isOwner = await AsyncStorage.getItem('isOwner');
    
    if (!currentUserId || !currentUserName) return null;
    
    const userFromList = users.find(user => user.userId === currentUserId);
    
    // Si el usuario no está en la lista pero tenemos sus datos en AsyncStorage, crearlo
    if (!userFromList) {
      const newUser = {
        userId: currentUserId,
        userName: currentUserName,
        isOwner: isOwner === 'true',
        joinedAt: new Date().toISOString()
      };
      return newUser;
    }
    
    return userFromList;
  }, [users]);

  const [currentUser, setCurrentUser] = useState<TableUser | null>(null);

  const addUser = useCallback((user: TableUser) => {
    setUsers(prev => {
      const exists = prev.find(u => u.userId === user.userId);
      if (exists) {
        return prev.map(u => u.userId === user.userId ? { ...u, ...user } : u);
      }
      return [...prev, user];
    });
  }, []);

  const removeUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(user => user.userId !== userId));
  }, []);

  const updateUsers = useCallback((newUsers: TableUser[]) => {
    setUsers(newUsers);
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    loadCurrentUser();
  }, [getCurrentUser]);

  useEffect(() => {
    const loadInitialUser = async () => {
      const currentUserId = await AsyncStorage.getItem('userId');
      const currentUserName = await AsyncStorage.getItem('userName');
      const isOwner = await AsyncStorage.getItem('isOwner');
      
      if (currentUserId && currentUserName && !users.find(u => u.userId === currentUserId)) {
        addUser({
          userId: currentUserId,
          userName: currentUserName,
          isOwner: isOwner === 'true',
          joinedAt: new Date().toISOString()
        });
      }
    };
    loadInitialUser();
  }, [users, addUser]);

  // Por ahora, simulamos usuarios de la mesa
  // En una implementación real, esto vendría del socket o API
  useEffect(() => {
    const mockUsers: TableUser[] = [
      { userId: '1', userName: 'Juan', isOwner: true },
      { userId: '2', userName: 'María' },
      { userId: '3', userName: 'Carlos' },
    ];
    setUsers(mockUsers);
  }, []);

  const totalUsers = users.length;

  return (
    <TableUsersContext.Provider value={{
      users,
      totalUsers,
      currentUser,
      addUser,
      removeUser,
      updateUsers
    }}>
      {children}
    </TableUsersContext.Provider>
  );
};

export const useTableUsers = () => {
  const context = useContext(TableUsersContext);
  if (context === undefined) {
    throw new Error('useTableUsers must be used within a TableUsersProvider');
  }
  return context;
}; 