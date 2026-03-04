import { create } from 'zustand';

interface RadioMessage {
  text: string;
  timestamp: number;
}

type ModalType = 'none' | 'quick-decision' | 'perk' | 'card-swap' | 'settings';

interface UIState {
  activeModal: ModalType;
  radioMessages: RadioMessage[];
  isAnimating: boolean;

  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  addRadioMessage: (text: string) => void;
  clearRadioMessages: () => void;
  setAnimating: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: 'none',
  radioMessages: [],
  isAnimating: false,

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: 'none' }),
  addRadioMessage: (text) =>
    set((s) => ({
      radioMessages: [...s.radioMessages, { text, timestamp: Date.now() }],
    })),
  clearRadioMessages: () => set({ radioMessages: [] }),
  setAnimating: (v) => set({ isAnimating: v }),
}));
