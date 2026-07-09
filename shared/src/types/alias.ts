export interface Alias {
  id: string;
  email: string;
  provider: "ovh";
  providerId: string;
  domain: string;
  serviceName?: string;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string;
}

export interface CreateAliasInput {
  email: string;
  domain: string;
  serviceName?: string;
  description?: string;
  tags?: string[];
}

export interface UpdateAliasInput {
  email?: string;
  serviceName?: string;
  description?: string;
  tags?: string[];
}

export interface GeneratedAlias {
  prefix: string;
  domain: string;
  email: string;
}
