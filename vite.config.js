import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The React plugin was listed as a dependency but never configured,
// so editing a component reloaded the whole page instead of hot
// swapping just that component.
export default defineConfig({
  plugins: [react()],
});
