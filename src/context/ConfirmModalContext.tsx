import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ConfirmModalState {
  show: boolean;
  message: string;
  onConfirm: () => void;
}

interface ConfirmModalContextValue {
  confirmModal: ConfirmModalState;
  showConfirm: (message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;
  handleConfirm: () => void;
}

const ConfirmModalContext = createContext<ConfirmModalContextValue | null>(null);

export function ConfirmModalProvider({ children }: { children: ReactNode }) {
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    show: false,
    message: "",
    onConfirm: () => {},
  });

  const showConfirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirmModal({ show: true, message, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal({ show: false, message: "", onConfirm: () => {} });
  }, []);

  const handleConfirm = useCallback(() => {
    confirmModal.onConfirm();
    closeConfirm();
  }, [confirmModal, closeConfirm]);

  return (
    <ConfirmModalContext.Provider value={{ confirmModal, showConfirm, closeConfirm, handleConfirm }}>
      {children}
    </ConfirmModalContext.Provider>
  );
}

export function useConfirmModal() {
  const context = useContext(ConfirmModalContext);
  if (!context) {
    throw new Error("useConfirmModal must be used within a ConfirmModalProvider");
  }
  return context;
}
