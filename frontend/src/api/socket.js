import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    import('socket.io-client').then(({ io }) => {
      const newSocket = io(SOCKET_URL);
      newSocket.on('connect', () => {
        newSocket.emit('join', user.id);
      });
      setSocket(newSocket);
      return () => newSocket.close();
    });
  }, [user]);

  return socket;
};