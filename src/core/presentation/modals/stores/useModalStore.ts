import { create } from 'zustand';
import { ModalInstance, ModalOptions, ModalStore } from '../types/modal.type';
import {SizeEnum} from "@/core/domain/enums/size.enum";

export const useModalStore = create<ModalStore>((set) => ({
  modals: [],

  openModal: (component, props = {}, options = {}) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newModal: ModalInstance = {
      id,
      component,
      props,
      options: {
        closable: true,
        size: SizeEnum.MD,
        ...options,
      },
    };

    set((state) => ({
      modals: [...state.modals, newModal],
    }));

    return id;
  },

  closeModal: (id) => {
    set((state) => {
      const modalToClose = state.modals.find((m) => m.id === id);
      if (!modalToClose) return state;

      if (modalToClose.options?.isClosing) return state;

      // Start closing animation
      setTimeout(() => {
        set((state) => {
          const modalStillExists = state.modals.find((m) => m.id === id);
          if (modalStillExists?.options?.onClose) {
            modalStillExists.options.onClose();
          }
          return {
            modals: state.modals.filter((m) => m.id !== id),
          };
        });
      }, 300); // match duration-300

      return {
        modals: state.modals.map((m) =>
          m.id === id ? { ...m, options: { ...m.options, isClosing: true } } : m
        ),
      };
    });
  },

  closeAllModals: () => {
    set((state) => {
      state.modals.forEach((m) => {
        if (!m.options?.isClosing) {
          // On peut soit déclencher l'animation pour tous, soit tout fermer d'un coup.
          // Pour respecter la demande d'animation, on devrait aussi le faire ici.
          setTimeout(() => {
            set((state) => {
              const modalStillExists = state.modals.find((mod) => mod.id === m.id);
              if (modalStillExists?.options?.onClose) modalStillExists.options.onClose();
              return {
                modals: state.modals.filter((mod) => mod.id !== m.id),
              };
            });
          }, 300);
        }
      });

      return {
        modals: state.modals.map((m) => ({
          ...m,
          options: { ...m.options, isClosing: true },
        })),
      };
    });
  },

  updateModalOptions: (id, options) => {
    set((state) => ({
      modals: state.modals.map((m) =>
        m.id === id ? { ...m, options: { ...m.options, ...options } } : m
      ),
    }));
  },
}));
