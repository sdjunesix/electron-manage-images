export interface Image {
  id: string; // Unique identifier
  name: string;
  dateAdded: Date;
  savedFolder: string;
  isCaptioned: boolean;
  version: number;
  quality: number; // 1-100 scale
}

export interface Node {
  
}

export interface TreeNode {
  id: string;
  type: string;
  path: string;
  name: string;
  data?: Record<string, any>;
  children?: TreeNode[];
};
