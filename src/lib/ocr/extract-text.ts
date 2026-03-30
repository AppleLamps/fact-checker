export type OCRInput = {
  name: string;
  mimeType: string;
  size: number;
};

export interface OCRAdapter {
  extractText: (image: OCRInput) => Promise<string>;
}

export const noopOCRAdapter: OCRAdapter = {
  async extractText() {
    return "";
  }
};
