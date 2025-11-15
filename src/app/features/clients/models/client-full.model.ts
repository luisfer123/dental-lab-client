import { Client } from './client.model';
import { AnyProfile } from './profile.model';

export interface ClientFull extends Client {
  profiles: AnyProfile[];
}
