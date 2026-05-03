import { create } from 'zustand';
import type { EventType } from '@apex/engine';
import type { RadioContext } from '../i18n';

interface EventRadioMessage {
  source: 'event';
  key: EventType;
  flavorIndex: number;
  timestamp: number;
}

interface GenericRadioMessage {
  source: 'radio';
  key: RadioContext;
  flavorIndex: number;
  timestamp: number;
}

export type RadioMessage = EventRadioMessage | GenericRadioMessage;
type AddRadioMessageInput =
  | { source: 'event'; key: EventType; flavorIndex: number }
  | { source: 'radio'; key: RadioContext; flavorIndex: number };

type ModalType = 'none' | 'quick-decision' | 'perk' | 'card-swap' | 'settings';

interface UIState {
  activeModal: ModalType;
  radioMessages: RadioMessage[];
  isAnimating: boolean;

  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  addRadioMessage: (message: AddRadioMessageInput) => void;
  clearRadioMessages: () => void;
  setAnimating: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: 'none',
  radioMessages: [],
  isAnimating: false,

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: 'none' }),
  addRadioMessage: (message) =>
    set((s) => ({
      radioMessages: [
        ...s.radioMessages,
        message.source === 'event'
          ? {
              source: 'event',
              key: message.key,
              flavorIndex: message.flavorIndex,
              timestamp: Date.now(),
            }
          : {
              source: 'radio',
              key: message.key,
              flavorIndex: message.flavorIndex,
              timestamp: Date.now(),
            },
      ],
    })),
  clearRadioMessages: () => set({ radioMessages: [] }),
  setAnimating: (v) => set({ isAnimating: v }),
}));
