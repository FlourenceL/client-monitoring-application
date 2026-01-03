import { create } from 'zustand';

export interface Client {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

interface ClientState {
  clients: Client[];
  addClient: (name: string) => void;
  removeClient: (id: string) => void;
}

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  addClient: (name) => set((state) => ({
    clients: [
      ...state.clients,
      { id: crypto.randomUUID(), name, status: 'active' }
    ]
  })),
  removeClient: (id) => set((state) => ({
    clients: state.clients.filter((client) => client.id !== id)
  })),
}));