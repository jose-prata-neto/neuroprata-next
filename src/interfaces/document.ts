export type DocumentType = "pdf" | "image" | "report";

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: string;
}
