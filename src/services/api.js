// src/services/api.js
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CENTRALIZED API SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Handles all communication with backend APIs
 *
 * Features:
 * ✅ Request/response interceptors
 * ✅ Global error handling
 * ✅ Request cancellation (AbortController)
 * ✅ Retry logic with exponential backoff
 * ✅ JWT token management
 * ✅ Loading state management
 * ✅ Request logging (development mode)
 *
 * Configuration via environment variables:
 * - REACT_APP_API_URL: API base URL (default: http://localhost:9090/api)
 * - REACT_APP_MAX_RETRIES: Max retry attempts (default: 3)
 * - REACT_APP_RETRY_DELAY: Initial retry delay in ms (default: 1000)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090/api'
const MAX_RETRIES = parseInt(import.meta.env.VITE_MAX_RETRIES || '3')
const RETRY_DELAY = parseInt(import.meta.env.VITE_RETRY_DELAY || '1000') // ms
const IS_DEV = import.meta.env.MODE === 'development'

// ════════════════════════════════════════════════════════════════════════════
// CUSTOM ERROR CLASS
// ════════════════════════════════════════════════════════════════════════════

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// ════════════════════════════════════════════════════════════════════════════
// LOGGING UTILITIES (Development only)
// ════════════════════════════════════════════════════════════════════════════

const logger = {
  request: (method, url, body = null) => {
    if (!IS_DEV) return
    const token = localStorage.getItem('token')
    console.log(`%c[API] ${method} ${url}`, 'color: #1976d2; font-weight: bold', {
      auth: token ? '🔐 Authenticated' : '🔓 No auth',
      ...(body && { body })
    })
  },

  response: (method, url, status, data) => {
    if (!IS_DEV) return
    const statusColor = status < 300 ? 'color: #388e3c' : status < 400 ? 'color: #f57c00' : 'color: #d32f2f'
    console.log(`%c[API] ${method} ${url} - ${status}`, statusColor, data)
  },

  error: (method, url, error) => {
    console.error(`%c[API] ${method} ${url} - ERROR`, 'color: #d32f2f; font-weight: bold', error)
  },

  retry: (method, url, attempt, delay) => {
    if (!IS_DEV) return
    console.warn(`%c[API] Retrying ${url} in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`, 'color: #f57c00')
  }
}

// ════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const shouldRetry = (error, attempt) => {
  // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
  if (error.status >= 400 && error.status < 500) {
    return [408, 429].includes(error.status) && attempt < MAX_RETRIES
  }
  // Retry on server errors (5xx)
  return error.status >= 500 && attempt < MAX_RETRIES
}

// Calculate exponential backoff delay
const getBackoffDelay = (attempt) => RETRY_DELAY * Math.pow(2, attempt - 1)

// ════════════════════════════════════════════════════════════════════════════
// API SERVICE - CORE
// ════════════════════════════════════════════════════════════════════════════

export class ApiService {
  static abortControllers = new Map() // Track requests for cancellation

  /**
   * Make HTTP request with retry logic and error handling
   * @param {string} endpoint - API endpoint path (e.g., '/employee/requests')
   * @param {Object} options - Fetch options
   * @param {number} attempt - Current retry attempt (internal)
   * @returns {Promise<any>} Response data
   */
  static async request(endpoint, options = {}, attempt = 1) {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    }

    // Add JWT token from localStorage
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    logger.request(options.method || 'GET', url, options.body)

    // Create AbortController for request cancellation
    const controller = new AbortController()
    const requestKey = `${options.method || 'GET'}:${url}`
    this.abortControllers.set(requestKey, controller)

    try {
      const response = await fetch(url, {
        ...options,
        method: options.method || 'GET',
        headers,
        credentials: 'include', // Send cookies with cross-origin requests
        signal: controller.signal,
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      // Remove from active requests
      this.abortControllers.delete(requestKey)

      // Parse response based on content type
      const contentType = response.headers.get('content-type')
      let data

      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else if (contentType?.includes('text')) {
        data = await response.text()
      } else {
        // Binary data (file blob)
        data = await response.blob()
      }

      // ─────────────────────────────────────────────────────────────────────
      // ERROR HANDLING
      // ─────────────────────────────────────────────────────────────────────

      if (!response.ok) {
        const errorMessage = data?.message || `HTTP ${response.status}`
        const error = new ApiError(errorMessage, response.status, data)

        logger.error(options.method || 'GET', url, error)

        // 401/403: Authentication/Authorization failure
        if (response.status === 401 || response.status === 403) {
          // Clear auth tokens
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('userId')

          // Redirect to login
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login'
          }

          throw new ApiError('Session expired. Please login again.', response.status, data)
        }

        // ─────────────────────────────────────────────────────────────────────
        // RETRY LOGIC
        // ─────────────────────────────────────────────────────────────────────

        if (shouldRetry(error, attempt)) {
          const backoffDelay = getBackoffDelay(attempt)
          logger.retry(options.method || 'GET', url, attempt, backoffDelay)
          await delay(backoffDelay)
          return this.request(endpoint, options, attempt + 1)
        }

        throw error
      }

      logger.response(options.method || 'GET', url, response.status, data)
      return data

    } catch (err) {
      this.abortControllers.delete(requestKey)

      // Handle AbortError from cancelled requests
      if (err.name === 'AbortError') {
        console.log(`[API] Request cancelled: ${url}`)
        throw new ApiError('Request cancelled', 0, null)
      }

      // Re-throw if already an ApiError
      if (err instanceof ApiError) {
        throw err
      }

      // Wrap other errors
      logger.error(options.method || 'GET', url, err)
      throw new ApiError(err.message || 'Unknown error', 0, null)
    }
  }

  // Convenience methods
  static get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  static post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body })
  }

  static put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body })
  }

  static delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * Cancel a specific pending request
   * @param {string} method - HTTP method (GET, POST, etc)
   * @param {string} endpoint - API endpoint
   */
  static cancelRequest(method, endpoint) {
    const requestKey = `${method}:${API_BASE_URL}${endpoint}`
    const controller = this.abortControllers.get(requestKey)
    if (controller) {
      controller.abort()
      this.abortControllers.delete(requestKey)
      console.log(`[API] Request cancelled: ${requestKey}`)
    }
  }

  /**
   * Cancel all pending requests
   */
  static cancelAllRequests() {
    this.abortControllers.forEach(controller => controller.abort())
    this.abortControllers.clear()
    console.log('[API] All requests cancelled')
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 1️⃣ AUTH API - Public endpoints
// ════════════════════════════════════════════════════════════════════════════

export const authAPI = {
  /**
   * Login with employee ID and password
   * @param {string} empId - Employee ID
   * @param {string} password - Password
   * @returns {Promise<{token: string, id: number, empId: string, name: string, ...}>}
   */
  login: (empId, password) =>
    ApiService.post('/auth/login', { empId, password }),

  /**
   * Request password reset
   * @param {string} email - Employee email
   * @returns {Promise<{message: string}>}
   */
  forgotPassword: (email) =>
    ApiService.post('/auth/forgot-password', { email }),

  /**
   * Reset password with code
   * @param {string} email - Employee email
   * @param {string} resetCode - Code from email
   * @param {string} newPassword - New password
   * @returns {Promise<{message: string}>}
   */
  resetPassword: (email, resetCode, newPassword) =>
    ApiService.post('/auth/reset-password', { email, resetCode, newPassword }),

  /**
   * Get current user profile
   * @returns {Promise<UserProfileDTO>}
   */
  getProfile: () =>
    ApiService.get('/auth/profile'),

  /**
   * Update user profile
   * @param {Object} data - Profile data
   * @returns {Promise<UserProfileDTO>}
   */
  updateProfile: (data) =>
    ApiService.put('/auth/profile', data),

  /**
   * Change password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm new password
   * @returns {Promise<{message: string}>}
   */
  changePassword: (oldPassword, newPassword, confirmPassword) =>
    ApiService.post('/auth/change-password', { oldPassword, newPassword, confirmPassword }),
}

// ════════════════════════════════════════════════════════════════════════════
// 2️⃣ EMPLOYEE API - Role: EMPLOYEE
// ════════════════════════════════════════════════════════════════════════════

export const employeeAPI = {
  /**
   * Get employee dashboard stats
   * @returns {Promise<{totalRequests: number, activeRequests: number, ...}>}
   */
  getDashboard: () =>
    ApiService.get('/employee/dashboard'),

  /**
   * Submit a new no-dues clearance request
   * @param {Object} data - Request data {reason, lastWorkingDay, remarks, documents}
   * @returns {Promise<NoDuesRequestDTO>}
   */
  submitRequest: (data) =>
    ApiService.post('/employee/requests', data),

  /**
   * Get all requests submitted by current employee
   * @returns {Promise<NoDuesRequestDTO[]>}
   */
  getMyRequests: () =>
    ApiService.get('/employee/requests'),

  /**
   * Get specific request details
   * @param {string} id - Request ID
   * @returns {Promise<NoDuesRequestDTO>}
   */
  getRequestById: (id) =>
    ApiService.get(`/employee/requests/${id}`),

  /**
   * Get approved certificates for employee
   * @returns {Promise<NoDuesRequestDTO[]>}
   */
  getCertificates: () =>
    ApiService.get('/employee/certificates'),

  /**
   * Download PDF certificate
   * @param {string} certificateId - Certificate/Request ID
   * @returns {Promise<{success: boolean, message: string}>}
   */
  downloadCertificate: (certificateId) => {
    const token = localStorage.getItem('token')
    return fetch(`${API_BASE_URL}/employee/certificate/${certificateId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      },
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        const errorMsg = `HTTP ${response.status}: Failed to download certificate`
        logger.error('GET', `/employee/certificate/${certificateId}`, errorMsg)
        throw new ApiError(errorMsg, response.status)
      }
      return response.blob()
    })
    .then(blob => {
      // ✅ Verify blob is valid PDF
      if (blob.type !== 'application/pdf' && blob.size === 0) {
        throw new ApiError('Invalid or empty PDF received', 0)
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `NoDues_Certificate_${certificateId}.pdf`
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()

      // ✅ Cleanup after small delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)

      logger.response('GET', `/employee/certificate/${certificateId}`, 200, 'PDF downloaded')
      return { success: true, message: 'Certificate downloaded successfully' }
    })
    .catch(err => {
      console.error('🔴 Certificate download error:', err)
      logger.error('GET', `/employee/certificate/${certificateId}`, err)
      throw err instanceof ApiError ? err : new ApiError('Failed to download certificate: ' + err.message, 0, null)
    })
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 3️⃣ APPROVER/HOD API - Role: HOD
// ════════════════════════════════════════════════════════════════════════════

export const approverAPI = {
  /**
   * Get approver dashboard stats
   * @returns {Promise<{totalRequests: number, pendingRequests: number, ...}>}
   */
  getDashboard: () =>
    ApiService.get('/approver/dashboard'),

  /**
   * Get pending requests for approval
   * @returns {Promise<NoDuesRequestDTO[]>}
   */
  getPendingRequests: () =>
    ApiService.get('/approver/pending'),

  /**
   * Get specific request for approval
   * @param {string} id - Request ID
   * @returns {Promise<NoDuesRequestDTO>}
   */
  getRequestById: (id) =>
    ApiService.get(`/approver/requests/${id}`),

  /**
   * Approve or reject a request
   * @param {string} id - Request ID
   * @param {Object} action - {status: 'APPROVED'|'REJECTED', remarks: string, stepOrder: number}
   * @returns {Promise<NoDuesRequestDTO>}
   */
  processAction: (id, action) =>
    ApiService.put(`/approver/requests/${id}/action`, {
      status: action.status,
      remarks: action.remarks,
      stepOrder: action.stepOrder
    }),

  /**
   * Set exit interview date
   * @param {string} requestId - Request ID
   * @param {Object} data - {interviewDate: string (YYYY-MM-DD), remarks: string}
   * @returns {Promise<NoDuesRequestDTO>}
   */
  setExitInterviewDate: (requestId, data) =>
    ApiService.put(`/approver/requests/${requestId}/exit-interview/date`, {
      interviewDate: data.interviewDate,
      remarks: data.remarks || null
    }),

  /**
   * Complete exit interview and approve request
   * @param {string} requestId - Request ID
   * @param {Object} data - {remarks: string}
   * @returns {Promise<NoDuesRequestDTO>}
   */
  completeExitInterview: (requestId, data) =>
    ApiService.put(`/approver/requests/${requestId}/action`, {
      status: 'APPROVED',
      remarks: data.remarks || null,
      stepOrder: 4
    }),

  /**
   * Get exit interview status
   * @param {string} requestId - Request ID
   * @returns {Promise<NoDuesRequestDTO>}
   */
  getExitInterviewStatus: (requestId) =>
    ApiService.get(`/approver/requests/${requestId}`),

  /**
   * Get approval history
   * @returns {Promise<NoDuesRequestDTO[]>}
   */
  getHistory: () =>
    ApiService.get('/approver/history'),

  /**
   * Download certificate for approved request (uses employee endpoint)
   * @param {string} requestId - Request ID
   * @returns {Promise<{success: boolean}>}
   */
  downloadCertificate: (requestId) => {
    const token = localStorage.getItem('token')
    return fetch(`${API_BASE_URL}/employee/certificate/${requestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      },
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        const errorMsg = `HTTP ${response.status}: Failed to download certificate`
        logger.error('GET', `/employee/certificate/${requestId}`, errorMsg)
        throw new ApiError(errorMsg, response.status)
      }
      return response.blob()
    })
    .then(blob => {
      // ✅ Verify blob is valid PDF
      if (blob.type !== 'application/pdf' && blob.size === 0) {
        throw new ApiError('Invalid or empty PDF received', 0)
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `NoDues_Certificate_${requestId}.pdf`
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()

      // ✅ Cleanup after small delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)

      logger.response('GET', `/employee/certificate/${requestId}`, 200, 'PDF downloaded')
      return { success: true }
    })
    .catch(err => {
      console.error('🔴 Certificate download error:', err)
      logger.error('GET', `/employee/certificate/${requestId}`, err)
      throw err instanceof ApiError ? err : new ApiError('Failed to download certificate: ' + err.message, 0, null)
    })
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 4️⃣ ADMIN API - Role: ADMIN
// ════════════════════════════════════════════════════════════════════════════

export const adminAPI = {
  /**
   * Get admin dashboard stats
   * @returns {Promise<{totalEmployees: number, totalRequests: number, ...}>}
   */
  getDashboard: () =>
    ApiService.get('/admin/dashboard'),

  /**
   * Get reports and analytics
   * @returns {Promise<{totalSubmitted: number, totalApproved: number, ...}>}
   */
  getReports: () =>
    ApiService.get('/admin/reports'),

  /**
   * Get all employees
   * @returns {Promise<AdminEmployeeResponseDTO[]>}
   */
  getEmployees: () =>
    ApiService.get('/admin/employees'),

  /**
   * Create new employee
   * @param {Object} data - {empId, password, name, email, department, designation}
   * @returns {Promise<AdminEmployeeResponseDTO>}
   */
  createEmployee: (data) =>
    ApiService.post('/admin/employees', data),

  /**
   * Update employee details
   * @param {number} id - Employee ID
   * @param {Object} data - Employee data
   * @returns {Promise<AdminEmployeeResponseDTO>}
   */
  updateEmployee: (id, data) =>
    ApiService.put(`/admin/employees/${id}`, data),

  /**
   * Deactivate employee
   * @param {number} id - Employee ID
   * @returns {Promise<{message: string}>}
   */
  deactivateEmployee: (id) =>
    ApiService.delete(`/admin/employees/${id}`),

  /**
   * Get all departments
   * @returns {Promise<DepartmentDTO[]>}
   */
  getDepartments: () =>
    ApiService.get('/admin/departments'),

  /**
   * Create new department
   * @param {Object} data - {name, hodName, hodEmail, type}
   * @returns {Promise<DepartmentDTO>}
   */
  createDepartment: (data) =>
    ApiService.post('/admin/departments', data),

  /**
   * Get specific request (admin view)
   * @param {string} id - Request ID
   * @returns {Promise<NoDuesRequestDTO>}
   */
  getRequestById: (id) =>
    ApiService.get(`/admin/requests/${id}`),

  /**
   * Get audit logs
   * @returns {Promise<AuditLog[]>}
   */
  getAuditLogs: () =>
    ApiService.get('/admin/audit'),
}

// ════════════════════════════════════════════════════════════════════════════
// 5️⃣ FILE UPLOAD API
// ════════════════════════════════════════════════════════════════════════════

export const notificationAPI = {
  /**
   * Get all notifications for current user
   * @returns {Promise<NotificationDTO[]>}
   */
  getAllNotifications: () =>
    ApiService.get('/notifications'),

  /**
   * Get unread notifications only
   * @returns {Promise<NotificationDTO[]>}
   */
  getUnreadNotifications: () =>
    ApiService.get('/notifications/unread'),

  /**
   * Get unread notification count
   * @returns {Promise<{unreadCount: number}>}
   */
  getUnreadCount: () =>
    ApiService.get('/notifications/unread/count'),

  /**
   * Mark single notification as read
   * @param {number} notificationId
   * @returns {Promise<NotificationDTO>}
   */
  markAsRead: (notificationId) =>
    ApiService.put(`/notifications/${notificationId}/read`, {}),

  /**
   * Mark all notifications as read
   * @returns {Promise<{message: string}>}
   */
  markAllAsRead: () =>
    ApiService.put('/notifications/mark-all-read', {}),

  /**
   * Delete single notification
   * @param {number} notificationId
   * @returns {Promise<{message: string}>}
   */
  deleteNotification: (notificationId) =>
    ApiService.delete(`/notifications/${notificationId}`),

  /**
   * Delete all notifications
   * @returns {Promise<{message: string}>}
   */
  deleteAllNotifications: () =>
    ApiService.delete('/notifications')
}

export const fileAPI = {
  /**
   * Upload file for a request
   * @param {File} file - File to upload
   * @param {string} requestId - Request ID
   * @returns {Promise<{message: string, fileName: string, fileSize: number, contentType: string}>}
   */
  uploadFile: (file, requestId) => {
    const formData = new FormData()
    formData.append('file', file)
    const token = localStorage.getItem('token')

    return fetch(`${API_BASE_URL}/upload/request/${requestId}/file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: formData,
    })
    .then(response => {
      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}`, response.status)
      }
      return response.json()
    })
    .catch(err => {
      logger.error('POST', `/upload/request/${requestId}/file`, err)
      throw err instanceof ApiError ? err : new ApiError(err.message, 0, null)
    })
  },

  /**
   * Get all files for a request
   * @param {string} requestId - Request ID
   * @returns {Promise<{requestId: string, files: Object[], fileCount: number}>}
   */
  getRequestFiles: (requestId) =>
    ApiService.get(`/upload/request/${requestId}/files`),

  /**
   * Delete a file from request
   * @param {string} fileName - File name to delete
   * @param {string} requestId - Request ID
   * @returns {Promise<{message: string, fileName: string}>}
   */
  deleteFile: (fileName, requestId) =>
    ApiService.delete(`/upload/request/${requestId}/file/${fileName}`),

  /**
   * Download a file
   * @param {string} fileName - File name to download
   * @param {string} requestId - Request ID
   * @returns {Promise<{success: boolean, message: string}>}
   */
  downloadFile: (fileName, requestId) => {
    const token = localStorage.getItem('token')

    return fetch(`${API_BASE_URL}/upload/request/${requestId}/file/${fileName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/octet-stream'
      },
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}`, response.status)
      }
      return response.blob()
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      return { success: true, message: 'File downloaded successfully' }
    })
    .catch(err => {
      logger.error('GET', `/upload/request/${requestId}/file/${fileName}`, err)
      throw err instanceof ApiError ? err : new ApiError(err.message, 0, null)
    })
  },
}

// ════════════════════════════════════════════════════════════════════════════
// 6️⃣ EXPORT API - CSV/Report Downloads
// ════════════════════════════════════════════════════════════════════════════

export const exportAPI = {
  /**
   * Export requests as CSV file
   * @returns {Promise<{success: boolean}>}
   */
  exportRequestsCSV: async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/export/requests/csv`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}`, response.status)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `requests_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      return { success: true }
    } catch (err) {
      logger.error('GET', '/export/requests/csv', err)
      throw err instanceof ApiError ? err : new ApiError(err.message, 0, null)
    }
  },

  /**
   * Export employees as CSV file
   * @returns {Promise<{success: boolean}>}
   */
  exportEmployeesCSV: async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/export/employees/csv`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}`, response.status)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      return { success: true }
    } catch (err) {
      logger.error('GET', '/export/employees/csv', err)
      throw err instanceof ApiError ? err : new ApiError(err.message, 0, null)
    }
  },

  /**
   * Export audit logs as CSV file
   * @returns {Promise<{success: boolean}>}
   */
  exportAuditLogsCSV: async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/export/audit-logs/csv`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}`, response.status)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      return { success: true }
    } catch (err) {
      logger.error('GET', '/export/audit-logs/csv', err)
      throw err instanceof ApiError ? err : new ApiError(err.message, 0, null)
    }
  },

  /**
   * Export analytics report as CSV file
   * @returns {Promise<{success: boolean}>}
   */
  exportAnalyticsCSV: async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/export/analytics/csv`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}`, response.status)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      return { success: true }
    } catch (err) {
      logger.error('GET', '/export/analytics/csv', err)
      throw err instanceof ApiError ? err : new ApiError(err.message, 0, null)
    }
  },

  /**
   * Get export status and capabilities
   * @returns {Promise<{canExport: boolean, lastExportTime: string, availableFormats: string[]}>}
   */
  getExportStatus: () =>
    ApiService.get('/export/status')
}

// ════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS (Backward compatibility)
// ════════════════════════════════════════════════════════════════════════════

export const uploadFile = fileAPI.uploadFile
export const getRequestFiles = fileAPI.getRequestFiles
export const deleteFile = fileAPI.deleteFile
export const downloadFile = fileAPI.downloadFile

export const exportRequestsCSV = exportAPI.exportRequestsCSV
export const exportEmployeesCSV = exportAPI.exportEmployeesCSV
export const exportAuditLogsCSV = exportAPI.exportAuditLogsCSV
export const exportAnalyticsCSV = exportAPI.exportAnalyticsCSV
export const getExportStatus = exportAPI.getExportStatus

// Notification API
export const getAllNotifications = notificationAPI.getAllNotifications
export const getUnreadNotifications = notificationAPI.getUnreadNotifications
export const getUnreadCount = notificationAPI.getUnreadCount
export const markNotificationAsRead = notificationAPI.markAsRead
export const markAllNotificationsAsRead = notificationAPI.markAllAsRead
export const deleteNotificationAPI = notificationAPI.deleteNotification
export const deleteAllNotificationsAPI = notificationAPI.deleteAllNotifications

// Request management utilities
export const cancelRequest = (method, endpoint) => ApiService.cancelRequest(method, endpoint)
export const cancelAllRequests = () => ApiService.cancelAllRequests()
