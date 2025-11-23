/**
 * Base work data model (backend: WorkModel).
 */
export interface Work {
  id: number;

  /** Work family code (e.g. FIXED_PROSTHESIS, REMOVABLE_PROSTHESIS, etc.) */
  workFamily: string;

  /** Work type code (e.g. CROWN, BRIDGE, INLAY) */
  type: string;

  /** Linked client ID */
  clientId: number;
  client?: Client;

  /** Human-readable labels (from LookupService) */
  familyLabel?: string;
  typeLabel?: string;
  statusLabel?: string;

  /** Descriptive details */
  description?: string;
  shade?: string;
  status?: string;
  notes?: string;

  /** Audit info */
  createdAt?: string;
  updatedAt?: string;

  /** Optional HATEOAS links */
  _links?: any;
}

export interface Client {
  id: number;
  displayName: string;
  firstName: string;
  secondName?: string;
  lastName: string;
  secondLastName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  primaryAddress?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
