
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Bundle analyzer - generates stats.html in dist folder
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Use treemap for better visualization
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build performance
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: mode === 'development', // Only in dev
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunk
          vendor: ['react', 'react-dom'],
          // Router chunk
          router: ['react-router-dom'],
          // UI components chunk
          ui: [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-toast',
            '@radix-ui/react-select',
            '@radix-ui/react-checkbox'
          ],
          // Query and state management
          query: ['@tanstack/react-query'],
          // Admin pages chunk (lazy loaded)
          'admin-pages': [
            // These will be in separate chunks due to lazy loading
          ],
          // Utilities
          utils: ['clsx', 'tailwind-merge', 'date-fns'],
          // Charts and visualization (only loaded when needed)
          charts: ['recharts'],
          // Supabase
          supabase: ['@supabase/supabase-js'],
          // Icons
          icons: ['lucide-react'],
        },
      },
    },
    // Performance budgets
    chunkSizeWarningLimit: 500, // Reduced for better performance
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
    ],
    exclude: [
      // Exclude heavy dependencies that should be lazy loaded
      'recharts'
    ]
  },
  // Performance optimizations
  esbuild: {
    // Drop console logs in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
