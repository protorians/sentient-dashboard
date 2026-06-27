'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModalStore } from '../stores/useModalStore';
import ModalWrapper from './ModalWrapper';

const ModalPortal = () => {
  const [mounted, setMounted] = useState(false);
  const modals = useModalStore((state) => state.modals);

  useEffect(() => setMounted(true), []);

  if (!mounted || modals.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 pointer-events-none">
      {modals.map((modal, index) => (
        <ModalWrapper 
          key={modal.id} 
          modal={modal} 
          index={index} 
          isLast={index === modals.length - 1} 
        />
      ))}
    </div>,
    document.body
  );
};

export default ModalPortal;
