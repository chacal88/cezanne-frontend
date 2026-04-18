import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { securityHeaders } from './src/lib/security';

export default defineConfig({
  plugins: [react()],
  server: {
    headers: securityHeaders,
  },
  preview: {
    headers: securityHeaders,
  },
});
