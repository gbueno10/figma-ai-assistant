// Tipos e interfaces para o AI Design Assistant

export interface AISuggestion {
  type: 'text' | 'layout' | 'style' | 'structure';
  elementId?: string;
  elementName?: string;
  currentValue?: string;
  suggestedValue: string;
  confidence: number;
  reasoning: string;
}

export interface AIResponse {
  suggestions: AISuggestion[];
  summary: string;
  improvements: string[];
}

export interface DesignAnalysis {
  elements: any[];
  totalElements: number;
  textElements: number;
  colorElements: number;
  layoutElements: number;
}

export interface ElementGroups {
  textElements: any[];
  imageElements: any[];
  shapeElements: any[];
  containerElements: any[];
  buttonElements: any[];
  iconElements: any[];
}

export interface DesignStats {
  totalElements: number;
  textElements: number;
  imageElements: number;
  shapeElements: number;
  containerElements: number;
  buttonElements: number;
  iconElements: number;
  maxDepth: number;
  layoutType: string;
  colorPalette: string[];
}

export interface AIOptimizedData {
  design: {
    id: string;
    name: string;
    dimensions: { width: number; height: number };
    timestamp: string;
  };
  summary: {
    totalElements: number;
    elementTypes: Record<string, number>;
    complexity: 'low' | 'medium' | 'high';
    layoutType: string;
    colorPalette: string[];
  };
  elements: {
    texts: any[];
    buttons: any[];
    containers: any[];
  };
  patterns: any;
  accessibility: any;
  context: {
    purpose: string;
    requestedImprovements: string[];
  };
}
