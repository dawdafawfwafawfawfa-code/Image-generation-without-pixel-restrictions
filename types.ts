export enum AspectRatio {
  Square = "1:1",
  Landscape = "16:9",
  Portrait = "9:16",
  Wide = "4:3",
  Tall = "3:4"
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
  timestamp: number;
  resolution?: '1K' | '2K' | '4K';
}

export interface GenerateImageParams {
  prompt: string;
  aspectRatio: AspectRatio;
}