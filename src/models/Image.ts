export interface Image {
  id: string; // Unique identifier
  name: string;
  dateAdded: Date;
  savedFolder: string;
  isCaptioned: boolean;
  version: number;
  quality: number; // 1-100 scale
}