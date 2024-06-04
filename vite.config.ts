import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      react: resolve('./node_modules/react'),
      'react-dom': resolve('./node_modules/react-dom'),
      'react-router': resolve('./node_modules/react-router'),
      'react-router-dom': resolve('./node_modules/react-router-dom'),
      '@zer0-os/zos-component-library': resolve('./node_modules/@zer0-os/zos-component-library'),
    },
  },
});
