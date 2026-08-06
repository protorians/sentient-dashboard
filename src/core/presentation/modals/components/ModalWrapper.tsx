'use client';

import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DismissableLayer } from 'radix-ui/internal';
import { useModalStore } from '../stores/useModalStore';
import { ModalInstance } from '../types/modal.type';
import ModalBox from './ModalBox';
import { cn } from '@/core/infrastructure/utilities/utils';

interface ModalWrapperProps {
  modal: ModalInstance;
  index: number;
  isLast: boolean;
}

const ModalWrapper = ({ modal, isLast }: ModalWrapperProps) => {
  const closeModal = useModalStore((state) => state.closeModal);

  const handleOverlayClick = (e: React.MouseEvent) => {
    const isLocked = modal.options?.locked === true;
    if (e.target === e.currentTarget && !isLocked) closeModal(modal.id);
  };

  const stackStyle = useMemo(() => {
    return {
      backgroundColor: modal.options?.backColor,
    };
  }, [modal.options?.backColor]);

  const isClosing = modal.options?.isClosing;
  const isLocked = modal.options?.locked === true;

  // Each modal is portaled directly into `document.body` at open time (like any
  // Radix overlay) and lives in the shared Radix dismissable-layer stack. This
  // lets components opened afterwards (Sheet, Popover, Select, AlertDialog, ...)
  // stack above the modal, and ensures Escape / outside interactions only dismiss
  // the topmost layer instead of closing the modal unintentionally.
  return createPortal(
    <DismissableLayer.Root
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 pointer-events-auto",
        isLast ? (modal.options?.blurred !== false ? "bg-background/50 backdrop-blur-xl" : "bg-background/80") : "bg-transparent",
        isClosing && "opacity-0"
      )}
      style={stackStyle}
      onClick={handleOverlayClick}
      onEscapeKeyDown={() => {
        if (!isLocked) closeModal(modal.id);
      }}
    >
      <div
        className={cn(
          "w-full flex justify-center transition-all duration-300 ease-out",
          isClosing ? "animate-zoom-out" : "animate-in fade-in zoom-in-95"
        )}
      >
        <ModalBox modal={modal} />
      </div>
    </DismissableLayer.Root>,
    document.body
  );
};

export default ModalWrapper;
