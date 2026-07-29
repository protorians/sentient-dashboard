import { ReactNode } from 'react';
import {SizeEnum} from "@/core/domain/enums/size.enum";

export interface ModalOptions {
  title?: ReactNode;
  description?: ReactNode;
  size?: keyof typeof SizeEnum;
  useHeight?: boolean;
  locked?: boolean;
  backColor?: string;
  blurred?: boolean;
  closable?: boolean;
  className?: string;
  isClosing?: boolean;
  onClose?: () => void;
  scrollable?: boolean;
  [key: string]: any; // Pour la personnalisation étendue
}

export interface ModalInstance {
  id: string;
  component: ReactNode | ((props: any) => ReactNode);
  props?: any;
  options?: ModalOptions;
}

export interface ModalStore {
  modals: ModalInstance[];
  openModal: (component: ReactNode | ((props: any) => ReactNode), props?: any, options?: ModalOptions) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  updateModalOptions: (id: string, options: Partial<ModalOptions>) => void;
}
