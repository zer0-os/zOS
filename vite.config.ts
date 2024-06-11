import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: '/',
    plugins: [
      react(),
      svgr({
        include: '**/*.svg',
      }),
    ],
    envPrefix: 'REACT_APP_',
    css: {
      preprocessorOptions: {
        scss: {
          // @note 06/09/2024
          // This is a temporary fix to allow for importing SCSS files from node_modules
          // using the ~ prefix, which is a common convention in sass-loader
          importer(url) {
            if (url.startsWith('~')) {
              return { file: resolve(__dirname, 'node_modules', url.substring(1)) };
            }
            return { file: url };
          },
        },
      },
    },
    define: {
      'process.env': { ...process.env, ...loadEnv(mode, process.cwd(), '') },
    },
    resolve: {
      alias: {
        react: resolve('./node_modules/react'),
        'react-dom': resolve('./node_modules/react-dom'),
        'react-router': resolve('./node_modules/react-router'),
        'react-router-dom': resolve('./node_modules/react-router-dom'),
        '@zer0-os/zos-component-library': resolve('./node_modules/@zer0-os/zos-component-library'),
      },
    },
  };
});
