import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Usuario } from '../types';
import { authService } from '../services/authService';

interface AuthStore {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (documento: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (usuario: Usuario) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  verifyToken: () => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        usuario: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (documento: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.login({ documento, password });
            
            set({
              usuario: response.usuario,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error de autenticación';
            set({ 
              isLoading: false, 
              error: errorMessage,
              isAuthenticated: false,
              usuario: null,
              token: null,
            });
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true });
          try {
            await authService.logout();
          } catch (error) {
            console.error('Error al cerrar sesión:', error);
          } finally {
            set({
              usuario: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        setUser: (usuario: Usuario) => {
          set({ usuario, isAuthenticated: true });
        },

        setToken: (token: string) => {
          set({ token });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        verifyToken: async () => {
          try {
            const isValid = await authService.verifyToken();
            if (!isValid) {
              set({
                usuario: null,
                token: null,
                isAuthenticated: false,
              });
            }
            return isValid;
          } catch {
            set({
              usuario: null,
              token: null,
              isAuthenticated: false,
            });
            return false;
          }
        },

        changePassword: async (currentPassword: string, newPassword: string) => {
          set({ isLoading: true, error: null });
          try {
            await authService.changePassword(currentPassword, newPassword);
            set({ isLoading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al cambiar contraseña';
            set({ isLoading: false, error: errorMessage });
            throw error;
          }
        },

        initializeAuth: async () => {
          set({ isLoading: true });
          const token = localStorage.getItem('auth_token');
          const usuario = authService.getUserFromStorage();
          if (token && usuario) {
            // Verificar que el token siga siendo válido
            const isValid = await get().verifyToken();
            if (isValid) {
              set({
                usuario,
                token,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          }
          // Si no hay token válido o no existe en localStorage, limpiar todo
          localStorage.removeItem('auth_token');
          localStorage.removeItem('usuario');
          set({
            usuario: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          usuario: state.usuario,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);
