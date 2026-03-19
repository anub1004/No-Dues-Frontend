// src/store/requestStore.js
import { create } from 'zustand'
import { MOCK_REQUESTS } from '../constants/mockData'

export const useRequestStore = create((set, get) => ({
  requests: [...MOCK_REQUESTS],

  addRequest: (req) =>
    set((state) => ({ requests: [req, ...state.requests] })),

  updateDeptStatus: (requestId, deptId, status, remarks, approvedBy) =>
    set((state) => ({
      requests: state.requests.map((req) => {
        if (req.id !== requestId) return req
        const updated = req.departmentStatuses.map((ds) =>
          ds.deptId === deptId
            ? { ...ds, status, remarks, approvedAt: new Date().toISOString().split('T')[0], approvedBy }
            : ds
        )
        const allApproved = updated.every((d) => d.status === 'APPROVED')
        const anyRejected = updated.some((d) => d.status === 'REJECTED')
        const overallStatus = allApproved
          ? 'APPROVED'
          : anyRejected
          ? 'REJECTED'
          : 'IN_PROGRESS'
        return { ...req, departmentStatuses: updated, overallStatus }
      }),
    })),

  getRequestsByEmpId: (empId) =>
    get().requests.filter((r) => r.empId === empId),

  getRequestsByDeptId: (deptId) =>
    get().requests.filter((r) =>
      r.departmentStatuses.some((ds) => ds.deptId === deptId)
    ),

  getPendingForDept: (deptId) =>
    get().requests.filter((r) =>
      r.departmentStatuses.some(
        (ds) => ds.deptId === deptId && ds.status === 'PENDING'
      )
    ),
}))
