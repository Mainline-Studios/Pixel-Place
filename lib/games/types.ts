import type { ComponentType } from 'react';

export interface GameInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  component: ComponentType<any>;
  thumbnail?: string;
  background?: string;
  is3D?: boolean;
  props?: any;
}
