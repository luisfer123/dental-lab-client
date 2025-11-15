import { BuildingTechnique } from '../enums/building-technique.enum';
import { CrownVariant } from '../enums/crown-variant.enum';

/**
 * Extension model for crown works (backend: CrownWorkModel).
 */
export interface CrownWork {
  workId: number;
  toothNumber: string;
  crownVariant: CrownVariant;
  buildingTechnique: BuildingTechnique;
  coreMaterialId?: number;
  veneeringMaterialId?: number;
  isMonolithic?: boolean;
  notes?: string;
}
