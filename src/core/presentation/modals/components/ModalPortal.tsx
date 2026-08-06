'use client';

import React, { useEffect, useState } from 'react';
import { useModalStore } from '../stores/useModalStore';
import ModalWrapper from './ModalWrapper';

const ModalPortal = () => {
  const [mounted, setMounted] = useState(false);
  const modals = useModalStore((state) => state.modals);

  useEffect(() => setMounted(true), []);

  if (!mounted || modals.length === 0) return null;

  // Each wrapper portals itself into `document.body` at open time, so stacked
  // overlays follow open order like any other dismissable layer.
  return (
    <>
      {modals.map((modal, index) => (
        <ModalWrapper
          key={modal.id}
          modal={modal}
          index={index}
          isLast={index === modals.length - 1}
        />
      ))}
    </>
  );
};

export default ModalPortal;
