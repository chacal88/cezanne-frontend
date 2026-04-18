export type CustomFieldDefinition = {
  id: string;
  label: string;
  scope: 'candidate' | 'public-application';
  required: boolean;
};

export type CustomFieldsSettingsConfigView = {
  schemaId: string;
  fields: CustomFieldDefinition[];
  simulateSubmissionFailure: boolean;
};
