/// <reference types="vite/client" />

// Declare module for audio files with ?url suffix
declare module '*.mp3?url' {
  const src: string;
  export default src;
}

// Declare module for audio files without suffix (fallback)
declare module '*.mp3' {
  const src: string;
  export default src;
}
