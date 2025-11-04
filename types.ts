export interface FontStoreLink {
  name: string;
  url: string;
}

export interface FontAnalysisResult {
  fontName: string;
  description: string;
  storeLinks: FontStoreLink[];
}

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
}
