import { create } from 'zustand';
import socket from '../services/socket';

export interface Notification {
  id: string;
  type: 'new_order' | 'low_stock' | 'system' | 'order_delivered';
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notif) => {
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };
    
    set((state) => ({
      notifications: [newNotif, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1
    }));

    // Trigger a browser notification if permitted
    if (Notification.permission === 'granted') {
       new Notification('StockUp Alert', { body: notif.message });
    }
  },

  markAllAsRead: () => set({ unreadCount: 0 }),
  
  clearAll: () => set({ notifications: [], unreadCount: 0 })
}));

// Initialize Socket Listener
socket.on('notification', (data) => {
  useNotificationStore.getState().addNotification({
    type: data.type || 'system',
    message: data.message
  });
});
