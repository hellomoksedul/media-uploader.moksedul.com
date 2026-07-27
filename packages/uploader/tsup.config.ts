import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
  injectStyle(css) {
    return `
      if (typeof document !== 'undefined') {
        var id = 'media-uploader-styles';
        if (!document.getElementById(id)) {
          var style = document.createElement('style');
          style.id = id;
          style.textContent = ${JSON.stringify(css)};
          document.head.appendChild(style);
        }
      }
    `;
  },
});
