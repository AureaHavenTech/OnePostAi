"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  addNotification: (title: string, message: string, type: NotificationType) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((title: string, message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substring(2, 11);
    setNotifications((prev) => [...prev, { id, title, message, type }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className={`
                p-4 rounded-xl border shadow-lg flex gap-3 backdrop-blur-md
                ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  notification.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                  notification.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-slate-900/80 border-slate-800 text-slate-300'}
              `}>
                <div className="shrink-0 mt-0.5">
                  {notification.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                  {notification.type === 'error' && <AlertCircle className="h-5 w-5" />}
                  {notification.type === 'warning' && <AlertCircle className="h-5 w-5" />}
                  {notification.type === 'info' && <Info className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold">{notification.title}</h4>
                  <p className="text-xs mt-1 opacity-80">{notification.message}</p>
                </div>
                <button 
                  onClick={() => removeNotification(notification.id)}
                  className="shrink-0 h-5 w-5 flex items-center justify-center hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
