export type AdLibraryStatus = "ALL" | "ACTIVE" | "INACTIVE";

export type SavedCreative = {
  id: string;
  name?: string | null;
  imageUrl: string;
  prompt: string;
  aspectRatio?: string | null;
  createdAt: string;
};
