export interface ClientSummary {
  id: number;

  displayName: string;

  firstName?: string | null;
  secondName?: string | null;
  lastName?: string | null;
  secondLastName?: string | null;

  primaryEmail?: string | null;
  primaryPhone?: string | null;
  primaryAddress?: string | null;

  active?: boolean;
}
