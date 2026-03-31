// src/store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: (userData, token) => {
        if (token) {
          localStorage.setItem('token', token)
        }
        set({ user: userData, isAuthenticated: true, token })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, isAuthenticated: false, token: null })
      },

      updateUser: (data) =>
        set((state) => ({ user: { ...state.user, ...data } })),

      setTokenFromStorage: (token) => {
        if (token) {
          localStorage.setItem('token', token)
          set({ token })
        }
      },
    }),
    { name: 'cdgi-auth' }
  )
)
