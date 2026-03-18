export interface ToolContent {
  type: 'text';
  text: string;
  [key: string]: unknown;
}

export interface ToolResult {
  content: ToolContent[];
  [key: string]: unknown;
}
