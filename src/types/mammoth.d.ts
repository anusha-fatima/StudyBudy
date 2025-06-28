declare module 'mammoth' {
    export interface ExtractRawTextResult {
      value: string;
      messages: Array<{message: string}>;
    }
  
    export function extractRawText(options: { 
      arrayBuffer: ArrayBuffer 
    }): Promise<ExtractRawTextResult>;
  
    // Add other Mammoth functions you use
  }