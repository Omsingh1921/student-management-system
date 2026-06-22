import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(
              '[PROXY]', req.method, req.url, '→', proxyReq.path,
              '| Auth:', proxyReq.getHeader('authorization')
                ? 'Bearer ...' + String(proxyReq.getHeader('authorization')).slice(-10)
                : '❌ MISSING'
            );
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('[PROXY RES]', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
});
