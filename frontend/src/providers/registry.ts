import type { ComponentType } from "react";
import { OvhCredentialForm } from "./ovh/OvhCredentialForm";

export interface ProviderFormProps {
  settings: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const forms: Record<string, ComponentType<ProviderFormProps>> = {
  OVH: OvhCredentialForm,
};

export function getProviderForm(name: string): ComponentType<ProviderFormProps> | undefined {
  return forms[name];
}
