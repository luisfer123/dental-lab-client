import { BridgeVariant } from "../enums/bridge-variant.enum";
import { BuildingTechnique } from "../enums/building-technique.enum";

/**
 * Extension model for bridge works (backend: BridgeWorkModel).
 */
export interface BridgeWork {
  workId: number;
  bridgeVariant: BridgeVariant;
  buildingTechnique: BuildingTechnique;
  abutmentTeeth?: string; // JSON array string (["24","26"])
  ponticTeeth?: string;   // JSON array string (["25"])
  coreMaterialId?: number;
  veneeringMaterialId?: number;
  connectorType?: string;
  ponticDesign?: string;
  notes?: string;
}
