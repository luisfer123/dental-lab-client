import { WorkExtensionModel } from "./full-work.model";

export interface CreateWorkRequest {
  base: {
    clientId: number;
    workFamily: string;
    type: string;
    description?: string | null;
    shade?: string | null;
    notes?: string | null;
  };
  extension: WorkExtensionModel;
}
