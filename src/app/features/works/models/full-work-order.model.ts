import { WorkOrder } from './work-order.model';

/**
 * Full representation of a WorkOrder, including client info and related data.
 * Matches Spring's FullWorkOrderModel (detail view).
 */
export interface FullWorkOrder extends WorkOrder {

  // Client summary included by assembler
  clientName?: string;
  clientPrimaryEmail?: string;
  clientPrimaryPhone?: string;

  // Timestamps the backend returns in the base model
  createdAt?: string | null;
  updatedAt?: string | null;

  // In case you later include works inside the order:
  // works?: Work[];
}
