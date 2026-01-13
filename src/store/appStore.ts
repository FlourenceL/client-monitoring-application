import { create } from 'zustand';
import { persist } from "zustand/middleware";

export interface Client {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

interface AppState {
    user: string;
    setUser: (user: string) => void;
    isConnected: boolean;
    setIsConnected: (connected: boolean) => void;
    isAdmin: boolean;
    setIsAdmin: (admin: boolean) => void;
    isAuthenticated: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            user: '',
            setUser: (user: string) => set({ user }),
            isConnected: false,
            setIsConnected: (connected: boolean) => set({ isConnected: connected }),
            isAdmin: false,
            setIsAdmin: (admin: boolean) => set({ isAdmin: admin }),
            isAuthenticated: true,
            setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
        }),
        {
            name: "app-storage",
        }
    )
);