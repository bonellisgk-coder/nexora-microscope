export interface Specimen {
  id: number;
  name: string;
  image_data: string;
  analysis: string;
  magnification: string;
  microscope_type: string;
  created_at: string;
}

export type MicroscopeType = 'brightfield' | 'darkfield' | 'fluorescence';
export type AnalysisDepth = 'Quick' | 'Standard' | 'Detailed';
