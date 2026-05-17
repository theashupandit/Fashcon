export interface MediaAsset {
  _id: string;
  imageId: string;
  originalFilename: string;
  displayName?: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  altText: string;
  usageCount: number;
  folderId: string | null;
  folderName?: string;
  folderPath?: string;
  createdAt: string;
  metadata: {
    size: number;
    format: string;
    dimensions: string;
  };
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface Folder {
  _id: string;
  name: string;
  parentId: string | null;
  path: string;
}
