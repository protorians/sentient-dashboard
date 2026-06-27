'use client';

import React, { useMemo, useEffect } from 'react';
import { useModalStore } from '../stores/useModalStore';
import { ModalInstance } from '../types/modal.type';
import ModalBox from './ModalBox';
import { cn } from '@/core/infrastructure/utilities/utils';

interface ModalWrapperProps {
  modal: ModalInstance;
  index: number;
  isLast: boolean;
}

const ModalWrapper = ({ modal, index, isLast }: ModalWrapperProps) => {
  const closeModal = useModalStore((state) => state.closeModal);
  
  useEffect(() => {
    if (!isLast) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const isLocked = modal.options?.locked === true;

        if (!isLocked) {
          closeModal(modal.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLast, modal.id, modal.options?.locked, modal.options?.closable, closeModal]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    const isLocked = modal.options?.locked === true;
    const isClosable = modal.options?.closable !== false;
    if (e.target === e.currentTarget && !isLocked) closeModal(modal.id);
  };

  const stackStyle = useMemo(() => {
    return {
      zIndex: 100 + index,
      backgroundColor: modal.options?.backColor,
    };
  }, [index, modal.options?.backColor]);

  const isClosing = modal.options?.isClosing;

  return (
    <div 
      className={cn(
        "fixed inset-0 flex items-center justify-center p-4 transition-all duration-300 pointer-events-auto",
        isLast ? (modal.options?.blurred !== false ? "bg-background/50 backdrop-blur-xl" : "bg-background/80") : "bg-transparent",
        isClosing && "opacity-0"
      )}
      onClick={handleOverlayClick}
      style={stackStyle}
    >
      <div 
        className={cn(
          "w-full flex justify-center transition-all duration-300 ease-out",
          isClosing ? "animate-zoom-out" : "animate-in fade-in zoom-in-95"
        )}
        style={{ zIndex: 100 + index }}
      >
        <ModalBox modal={modal} />
      </div>
    </div>
  );
};

export default ModalWrapper;
