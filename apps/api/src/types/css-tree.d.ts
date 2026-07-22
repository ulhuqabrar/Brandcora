declare module 'css-tree' {
  export function parse(content: string, options?: any): any;
  export function generate(ast: any, options?: any): string;
  export function walk(ast: any, handlers: any): void;
  export function find(ast: any, fn: (node: any) => boolean): any;
  export function findAll(ast: any, fn: (node: any) => boolean): any[];
  export function toCSS(ast: any, options?: any): string;
  export function fromJSON(json: string): any;
  export function toJSON(ast: any): string;
}
