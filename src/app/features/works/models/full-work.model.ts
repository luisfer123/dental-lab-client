// ===============================
// Base model already exists
// export interface Work { ... }
// ===============================

import { Work } from "./work.model";

export type WorkExtensionType = 'CROWN' | 'BRIDGE';

/**
 * EXTENSION MODELS
 */
export interface CrownExtension {
  type: 'CROWN';

  toothNumber: string | null;                     // e.g. "11"
  crownVariant: 'MONOLITHIC' | 'STRATIFIED' | 'METAL' | 'TEMPORARY';
  buildingTechnique: 'DIGITAL' | 'MANUAL' | 'HYBRID';

  coreMaterialId: number | null;                  // FK material
  veneeringMaterialId: number | null;             // FK material
  isMonolithic: boolean | null; 
}

export interface BridgeExtension {
  type: 'BRIDGE';

  bridgeVariant: 'MONOLITHIC' | 'STRATIFIED' | 'METAL' | 'TEMPORARY';
  buildingTechnique: 'DIGITAL' | 'MANUAL' | 'HYBRID';

  abutmentTeeth: string | null;       // JSON string en backend → mandamos string
  ponticTeeth: string | null;         // JSON string

  coreMaterialId: number | null;
  veneeringMaterialId: number | null;

  connectorType: string | null;       // “Double”, “Round”, “Modified ridge lap”
  ponticDesign: string | null;        // “Ovate”, “Sanitary”, etc.

  notes?: string | null;
}

/**
 * UNION TYPE: one or the other
 */
export type WorkExtensionModel =
  | CrownExtension
  | BridgeExtension;

/**
 * FULL WORK RECEIVED FROM BACKEND
 */
export interface FullWork {
  base: Work;
  extension: WorkExtensionModel | null;

  family: string;      // same as base.workFamily
  type: string;        // same as base.type
  familyLabel?: string;
  typeLabel?: string;

  _links?: any;
}
