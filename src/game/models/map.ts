export interface CameraRegion {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TiledObjectProperty {
  name: string;
  type: string;
  value: unknown;
}

export interface SignDetails {
  message: string;
}

export type SignData = Record<string, SignDetails>;
