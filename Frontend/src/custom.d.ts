declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '/vite.svg' {
  const content: string;
  export default content;
}

// Allow importing CSS modules (if any). Keeps TypeScript happy for plain CSS imports.
declare module '*.css';
