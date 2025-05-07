export type PageReview = {
  locale: string;
  backUrl: string;
  title: string;
  text?: string;
  sections: Section[];
  submitButtonText: string;
};

export type Section = {
  title: string;
  fields: Field[];
};

export type Field = {
  id: string;
  name: string;
  label: string;
  values: string[];
};
