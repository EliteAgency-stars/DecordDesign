'use client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Espacio, Estilo, Prioridad, Servicio } from './buildScene';

export type Estado = {
  paso: number;
  servicio?: Servicio;
  espacio?: Espacio;
  metros: number;
  zonas?: number;
  estilo?: Estilo;
  prioridades: Prioridad[];
  presupuesto?: string;
  plazo?: string;
  ciudad: string;
  datos: { nombre: string; empresa: string; whatsapp: string; email: string; acepta: boolean };
  enviado: string | null; // id del lead
};

type Acciones = {
  set: (p: Partial<Estado>) => void;
  ir: (paso: number) => void;
  reiniciar: () => void;
};

export const TOTAL_PASOS = 10;

const inicial: Estado = {
  paso: 0,
  metros: 60,
  prioridades: [],
  ciudad: '',
  datos: { nombre: '', empresa: '', whatsapp: '', email: '', acepta: false },
  enviado: null,
};

// localStorage puede no existir o lanzar (modo privado, cookies bloqueadas): el progreso es una comodidad.
const almacen = {
  getItem: (k: string) => {
    try { return localStorage.getItem(k); } catch { return null; }
  },
  setItem: (k: string, v: string) => {
    try { localStorage.setItem(k, v); } catch {}
  },
  removeItem: (k: string) => {
    try { localStorage.removeItem(k); } catch {}
  },
};

export const useConfigurador = create<Estado & Acciones>()(
  persist(
    (set) => ({
      ...inicial,
      set: (p) => set(p),
      ir: (paso) => set({ paso: Math.max(0, Math.min(TOTAL_PASOS - 1, paso)) }),
      reiniciar: () => set(inicial),
    }),
    { name: 'decord-configurador', storage: createJSONStorage(() => almacen), version: 1 },
  ),
);
