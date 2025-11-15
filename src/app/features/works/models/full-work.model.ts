import { BridgeWork } from './bridge-work.model';
import { CrownWork } from './crown-work.model';
import { Work } from './work.model';


/**
 * Represents a complete work entity combining the base WorkModel
 * with its specific extension (CrownWork, BridgeWork, etc.).
 *
 * Mirrors backend: com.dentallab.api.model.FullWorkModel
 */
export interface FullWork {
  /** Base data from WorkModel */
  base: Work;

  /** Work family code (e.g. FIXED_PROSTHESIS) */
  workFamily: string;

  /** Work type code (e.g. CROWN, BRIDGE, INLAY, etc.) */
  type: string;

  /** Readable labels resolved via LookupService */
  familyLabel?: string;
  typeLabel?: string;

  /** Polymorphic subtype model (depending on work type) */
  extension?: WorkExtension;

  /** Optional hypermedia links if backend uses HATEOAS */
  _links?: any;
}

/**
 * Union type for all possible work extensions.
 * Extend this as new types (InlayWork, OnlayWork, etc.) are added.
 */
export type WorkExtension = CrownWork | BridgeWork;
