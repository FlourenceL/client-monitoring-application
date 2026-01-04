import { create } from 'zustand';
import { persist } from "zustand/middleware";

export interface Client {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

interface AppState {
	isConnected: boolean;
	setIsConnected: (connected: boolean) => void;
	isAdmin: boolean;
	setIsAdmin: (admin: boolean) => void;
}

export const useAppStore = create<AppState>()(
	persist(
		(set) => ({
			isConnected: false,
			setIsConnected: (connected: boolean) => set({ isConnected: connected }),
			isAdmin: false,
			setIsAdmin: (admin: boolean) => set({ isAdmin: admin }),
		}),
		{
			name: "app-storage",
		}
	)
);