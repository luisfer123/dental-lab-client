/**
 * Generic Page interface matching Spring Data Page<T> structure.
 */
export interface Page<T> {
  content: T[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number: number;
  numberOfElements?: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
