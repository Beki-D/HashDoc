export interface FileRecord {
  id: number;
  filename: string;
  size: number;
  created_at: string;
  signedUrl?: string;
  hash?: string;
  is_duplicate?: boolean;
}
