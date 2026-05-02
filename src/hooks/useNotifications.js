import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { notificationAPI } from '../services/api'

export function useNotifications() {
  const { token } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const pollingIntervalRef = useRef(null)

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      setError(null)
      const data = await notificationAPI.getAllNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err.message || 'Failed to fetch notifications')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [token])

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return
    try {
      const data = await notificationAPI.getUnreadCount()
      setUnreadCount(data?.unreadCount || 0)
    } catch (err) {
      console.error('Error fetching unread count:', err)
      setUnreadCount(0)
    }
  }, [token])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!notificationId) return
    try {
      await notificationAPI.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, status: 'READ' } : n)
      )
      await fetchUnreadCount()
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [fetchUnreadCount])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }, [])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!notificationId) return
    try {
      await notificationAPI.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      await fetchUnreadCount()
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }, [fetchUnreadCount])

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationAPI.deleteAllNotifications()
      setNotifications([])
      setUnreadCount(0)
    } catch (err) {
      console.error('Error deleting all notifications:', err)
    }
  }, [])

  // Initialize and set up polling
  useEffect(() => {
    if (!token) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    // Initial fetch
    fetchNotifications()
    fetchUnreadCount()

    // Poll for new notifications every 15 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchUnreadCount()
      // Fetch full list periodically to catch any updates
      fetchNotifications()
    }, 15000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [token, fetchNotifications, fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  }
}
