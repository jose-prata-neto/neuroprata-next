export interface Tag {
  id: string;
  text: string;
}

export interface SuggestedTag extends Tag {
  relevance: number;
}
