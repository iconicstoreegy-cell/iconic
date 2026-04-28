import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllOrders } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../services/orderService';
import { playNotificationSound } from '../utils/notificationSound';

// Polls every 30s and surfaces new orders as notifications
export function useAdminNotifications() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin-notifications') || '[]'); } catch { return []; }
  });
  const lastSeenRef = useRef(
    localStorage.getItem('admin-last-seen') || new Date(0).toISOString()
  );

  const { data } = useQuery({
    queryKey: ['adminOrdersPoll'],
    queryFn: () => getAllOrders({ limit: 10, page: 1 }),
    enabled: !!isAdmin,
    refetchInterval: 30000,
    refetchIntervalInBackground: true
  });

  useEffect(() => {
    if (!data?.orders) return;
    const lastSeen = new Date(lastSeenRef.current);
    const newOrders = data.orders.filter(o => new Date(o.createdAt) > lastSeen);

    if (newOrders.length > 0) {
      const newNotifs = newOrders.map(o => ({
        id: o._id,
        type: 'new_order',
        title: 'New Order',
        message: `${o.customerInfo?.name} — ${o.totalPrice} EGP`,
        orderId: o._id,
        createdAt: o.createdAt,
        read: false
      }));
      playNotificationSound('order');
      setNotifications(prev => {
        const merged = [...newNotifs, ...prev].slice(0, 20);
        localStorage.setItem('admin-notifications', JSON.stringify(merged));
        return merged;
      });
      // Update last seen to latest order
      const latest = newOrders[0].createdAt;
      lastSeenRef.current = latest;
      localStorage.setItem('admin-last-seen', latest);
    }
  }, [data]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('admin-notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('admin-notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('admin-notifications');
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markAllRead, markRead, clearAll };
}

// For regular users — polls their own orders for status changes
export function useUserNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`user-notifications-${user?._id}`) || '[]'); } catch { return []; }
  });
  const prevOrdersRef = useRef(null);

  const { data } = useQuery({
    queryKey: ['myOrdersPoll'],
    queryFn: getMyOrders,
    enabled: !!user && !user?.role === 'admin',
    refetchInterval: 30000,
    refetchIntervalInBackground: true
  });

  useEffect(() => {
    if (!data || !prevOrdersRef.current) {
      prevOrdersRef.current = data;
      return;
    }
    const newNotifs = [];
    data.forEach(order => {
      const prev = prevOrdersRef.current?.find(o => o._id === order._id);
      if (prev && prev.orderStatus !== order.orderStatus) {
        newNotifs.push({
          id: `${order._id}-${order.orderStatus}`,
          type: 'status_change',
          title: 'Order Updated',
          message: `Order #${order._id.slice(-6).toUpperCase()} is now ${order.orderStatus}`,
          orderId: order._id,
          createdAt: new Date().toISOString(),
          read: false
        });
      }
    });
    if (newNotifs.length > 0) {
      playNotificationSound('status');
      setNotifications(prev => {
        const merged = [...newNotifs, ...prev].slice(0, 10);
        localStorage.setItem(`user-notifications-${user?._id}`, JSON.stringify(merged));
        return merged;
      });
    }
    prevOrdersRef.current = data;
  }, [data, user]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(`user-notifications-${user?._id}`, JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const markRead = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(`user-notifications-${user?._id}`, JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;
  return { notifications, unreadCount, markAllRead, markRead };
}
