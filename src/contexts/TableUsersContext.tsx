import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socketService } from '../services/socket';
import { tableService } from '../services/api';

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
  loading: boolean;
}

const TableUsersContext = createContext<TableUsersContextType | undefined>(undefined);

interface TableUsersProviderProps {
  children: React.ReactNode;
}

export const TableUsersProvider: React.FC<TableUsersProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<TableUser[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  // Cargar usuarios reales de la mesa
  const loadTableUsers = useCallback(async () => {
    try {
      setLoading(true);
      const tableId = await AsyncStorage.getItem('tableId');
      if (!tableId) {
        // Si no hay tableId, usar solo el usuario actual
        const currentUserId = await AsyncStorage.getItem('userId');
        const currentUserName = await AsyncStorage.getItem('userName');
        const isOwner = await AsyncStorage.getItem('isOwner');
        
        if (currentUserId && currentUserName) {
          const currentUser = {
            userId: currentUserId,
            userName: currentUserName,
            isOwner: isOwner === 'true',
            joinedAt: new Date().toISOString()
          };
          setUsers([currentUser]);
        }
        return;
      }

      // Intentar obtener usuarios de la mesa desde la API
      try {
        const tableInfo = await tableService.getTableInfo(tableId);
        if (tableInfo && tableInfo.users) {
          const formattedUsers = tableInfo.users.map((user: any) => ({
            userId: user.userId || user.uuid || user.id,
            userName: user.userName || user.name,
            isOwner: user.isOwner || false,
            joinedAt: user.joinedAt || new Date().toISOString()
          }));
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.log('No se pudieron cargar usuarios de la mesa, usando solo usuario actual');
        // Fallback: usar solo el usuario actual
        const currentUserId = await AsyncStorage.getItem('userId');
        const currentUserName = await AsyncStorage.getItem('userName');
        const isOwner = await AsyncStorage.getItem('isOwner');
        
        if (currentUserId && currentUserName) {
          const currentUser = {
            userId: currentUserId,
            userName: currentUserName,
            isOwner: isOwner === 'true',
            joinedAt: new Date().toISOString()
          };
          setUsers([currentUser]);
        }
      }
    } catch (error) {
      console.error('Error loading table users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    loadCurrentUser();
  }, [getCurrentUser]);

  useEffect(() => {
    loadTableUsers();
  }, [loadTableUsers]);

  const totalUsers = users.length;

  return (
    <TableUsersContext.Provider value={{
      users,
      totalUsers,
      currentUser,
      addUser,
      removeUser,
      updateUsers,
      loading
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