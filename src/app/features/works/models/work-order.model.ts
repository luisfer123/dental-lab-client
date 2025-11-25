/**
 * Lightweight representation of a WorkOrder.
 * Matches Spring's WorkOrderModel (pagination list view).
 */
export interface WorkOrder {
  id: number;

  clientId: number;

  dateReceived: string | null;   // ISO datetime
  dueDate: string | null;        // ISO datetime
  deliveredAt: string | null;    // ISO datetime

  status: string | null;
  notes?: string | null;

  // Optional HATEOAS links
  _links?: any;
}
