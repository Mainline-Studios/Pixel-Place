'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ModalPayload = {
  title?: string;
  description?: string;
  content: React.ReactNode;
};

type ModalContextValue = {
  openModal: (payload: ModalPayload) => void;
  closeModal: () => void;
};

const ModalContext = React.createContext<ModalContextValue | null>(null);

export function useAppModal() {
  const ctx = React.useContext(ModalContext);
  if (!ctx) throw new Error('useAppModal must be used within ModalProvider');
  return ctx;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [payload, setPayload] = React.useState<ModalPayload | null>(null);

  const openModal = React.useCallback((p: ModalPayload) => {
    setPayload(p);
    setOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setOpen(false);
    window.setTimeout(() => setPayload(null), 200);
  }, []);

  const value = React.useMemo(
    () => ({ openModal, closeModal }),
    [openModal, closeModal]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className={payload?.title ? undefined : 'sr-only'}>
              {payload?.title ?? 'Modal'}
            </DialogTitle>
            {payload?.description && (
              <DialogDescription>{payload.description}</DialogDescription>
            )}
          </DialogHeader>
          {payload?.content}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
}
