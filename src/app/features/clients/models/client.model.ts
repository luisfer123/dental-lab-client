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
