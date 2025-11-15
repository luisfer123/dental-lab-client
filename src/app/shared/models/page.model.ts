/**
 * Generic Page interface matching Spring Data Page<T> structure.
 */
export interface PageModel<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}
