import { Work } from './work.model';

export interface WorkExtension {
  crownWork?: CrownWork;
  bridgeWork?: BridgeWork;
  inlayWork?: InlayWork;
  // ... otros tipos futuros
}

export interface CrownWork {
}

export interface BridgeWork {
  // agrega aquí campos específicos de Puente
}

export interface InlayWork {
  // agrega aquí campos de Incrustación
}

export interface FullWork {
  id: number;
  base: Work;          // WorkModel
  extension?: WorkExtension;

  workFamily: string;
  type: string;
  familyLabel?: string;
  typeLabel?: string;

  _links?: any;
}
