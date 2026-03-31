// src/services/api.js
// When using npm run dev, Vite proxy intercepts /api calls
// and forwards to http://localhost:9090/api
const API_BASE_URL = 'http://localhost:9090/api'

export class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    }

    // Add JWT token to Authorization header if it exists
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    console.log(`[API] ${options.method || 'GET'} ${url}`, { headers: { Authorization: token ? 'Bearer ***' : 'none' } })

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })

      console.log(`[API] Response status: ${response.status}`)

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      let data
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        // Handle 401/403 - authentication/authorization issues
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token')
          const error = new Error('Your session has expired. Please login again.')
          error.status = response.status
          throw error
        }

        const error = new Error(data?.message || `HTTP Error ${response.status}`)
        error.status = response.status
        error.data = data
        console.error(`[API] Error:`, error)
        throw error
      }

      console.log(`[API] Success:`, data)
      return data
    } catch (err) {
      console.error(`[API] Fetch error:`, err)
      throw err
    }
  }

  static async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  static async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) })
  }

  static async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) })
  }

  static async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}

// ────────────────────────────────────────
// AUTH API
// ────────────────────────────────────────
export const authAPI = {
  login: (empId, password) =>
    ApiService.post('/auth/login', { empId, password }),

  forgotPassword: (email) =>
    ApiService.post('/auth/forgot-password', { email }),

  resetPassword: (email, resetCode, newPassword) =>
    ApiService.post('/auth/reset-password', { email, resetCode, newPassword }),

  getProfile: () =>
    ApiService.get('/auth/profile'),

  updateProfile: (data) =>
    ApiService.put('/auth/profile', data),

  changePassword: (oldPassword, newPassword, confirmPassword) =>
    ApiService.post('/auth/change-password', { oldPassword, newPassword, confirmPassword }),
}

// ────────────────────────────────────────
// EMPLOYEE API
// ────────────────────────────────────────
export const employeeAPI = {
  getDashboard: () =>
    ApiService.get('/employee/dashboard'),

  submitRequest: (data) =>
    ApiService.post('/employee/requests', data),

  getMyRequests: () =>
    ApiService.get('/employee/requests'),

  getRequestById: (id) =>
    ApiService.get(`/employee/requests/${id}`),

  getCertificates: () =>
    ApiService.get('/employee/certificates'),
}

// ────────────────────────────────────────
// APPROVER / HOD API
// ────────────────────────────────────────
export const approverAPI = {
  getDashboard: () =>
    ApiService.get('/approver/dashboard'),

  getPendingRequests: () =>
    ApiService.get('/approver/pending'),

  getRequestById: (id) =>
    ApiService.get(`/approver/requests/${id}`),

  processAction: (id, action) =>
    ApiService.put(`/approver/requests/${id}/action`, action),

  getHistory: () =>
    ApiService.get('/approver/history'),
}

// ────────────────────────────────────────
// ADMIN API
// ────────────────────────────────────────
export const adminAPI = {
  getDashboard: () =>
    ApiService.get('/admin/dashboard'),

  getEmployees: () =>
    ApiService.get('/admin/employees'),

  createEmployee: (data) =>
    ApiService.post('/admin/employees', data),

  updateEmployee: (id, data) =>
    ApiService.put(`/admin/employees/${id}`, data),

  deactivateEmployee: (id) =>
    ApiService.delete(`/admin/employees/${id}`),

  getDepartments: () =>
    ApiService.get('/admin/departments'),

  createDepartment: (data) =>
    ApiService.post('/admin/departments', data),

  getRequestById: (id) =>
    ApiService.get(`/admin/requests/${id}`),

  getAuditLogs: () =>
    ApiService.get('/admin/audit'),

  getReports: () =>
    ApiService.get('/admin/reports'),
}

// ────────────────────────────────────────
// FILE UPLOAD API
// ────────────────────────────────────────
export const fileAPI = {
  uploadFile: (file, requestId) => {
    const formData = new FormData()
    formData.append('file', file)
    const token = localStorage.getItem('token')

    return fetch(`${API_BASE_URL}/upload/request/${requestId}/file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`)
      }
      return response.json()
    })
    .catch(err => {
      console.error('[API] File upload error:', err)
      throw err
    })
  },

  getRequestFiles: (requestId) =>
    ApiService.get(`/upload/request/${requestId}/files`),

  deleteFile: (fileName, requestId) =>
    ApiService.delete(`/upload/request/${requestId}/file/${fileName}`),

  downloadFile: (fileName, requestId) => {
    const token = localStorage.getItem('token')
    return `${API_BASE_URL}/upload/request/${requestId}/file/${fileName}?token=${token}`
  },

  viewFile: (fileName, requestId) => {
    const token = localStorage.getItem('token')
    return `${API_BASE_URL}/upload/request/${requestId}/file/${fileName}/view?token=${token}`
  }
}

// Export individual functions for easier import
export const uploadFile = fileAPI.uploadFile
export const getRequestFiles = fileAPI.getRequestFiles
export const deleteFile = fileAPI.deleteFile
export const downloadFile = fileAPI.downloadFile
export const viewFile = fileAPI.viewFile
