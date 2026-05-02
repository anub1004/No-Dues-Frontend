import { X, Check, Trash2, CheckCheck, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationPanel({
  notifications = [],
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll,
  error = null,
  loading = false
}) {
  const unreadNotifications = notifications.filter(n => n.status === 'UNREAD')

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'APPROVAL':
        return '✓'
      case 'REJECTION':
        return '✕'
      case 'EXIT_INTERVIEW':
        return '📅'
      default:
        return 'ℹ'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'APPROVAL':
        return 'bg-green-50 border-green-200'
      case 'REJECTION':
        return 'bg-red-50 border-red-200'
      case 'EXIT_INTERVIEW':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  const handleNotificationClick = (notification) => {
    if (notification.status === 'UNREAD' && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-10" onClick={onClose} />

      {/* Notification Panel */}
      <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-slate-200 z-20 animate-fade-in max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200 flex items-center gap-2 text-xs text-red-700">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        {notifications.length > 0 && !error && (
          <div className="flex gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50">
            {unreadNotifications.length > 0 && (
              <button
                onClick={onMarkAllAsRead}
                disabled={loading}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded transition disabled:opacity-50"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onDeleteAll}
                disabled={loading}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 rounded transition ml-auto disabled:opacity-50"
              >
                <Trash2 size={14} /> Clear all
              </button>
            )}
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="px-4 py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
              <p className="text-xs text-slate-500 mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-slate-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 border-l-4 cursor-pointer transition hover:bg-opacity-100 ${getNotificationColor(
                    notification.type
                  )} ${notification.status === 'UNREAD' ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        <h3 className="text-xs font-bold text-slate-900">
                          {notification.title}
                        </h3>
                        {notification.status === 'UNREAD' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true
                        })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(notification.id)
                      }}
                      className="text-slate-400 hover:text-slate-600 flex-shrink-0 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && !error && (
          <div className="px-4 py-2 border-t border-slate-100 text-center">
            <a
              href="/notifications"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
            >
              View all notifications
            </a>
          </div>
        )}
      </div>
    </>
  )
}

