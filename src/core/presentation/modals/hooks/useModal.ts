import { ReactNode, useCallback } from 'react';
import { useModalStore } from '../stores/useModalStore';
import { ModalOptions } from '../types/modal.type';

export const useModal = () => {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const closeAllModals = useModalStore((state) => state.closeAllModals);
  const updateModalOptions = useModalStore((state) => state.updateModalOptions);

  const open = useCallback(
    (component: ReactNode | ((props: any) => ReactNode), props?: any, options?: ModalOptions) => {
      return openModal(component, props, options);
    },
    [openModal]
  );

  const close = useCallback(
    (id: string) => {
      closeModal(id);
    },
    [closeModal]
  );

  const update = useCallback(
    (id: string, options: Partial<ModalOptions>) => {
      updateModalOptions(id, options);
    },
    [updateModalOptions]
  );

  return {
    open,
    close,
    closeAll: closeAllModals,
    update,
  };
};
