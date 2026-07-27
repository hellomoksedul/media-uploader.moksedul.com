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
          var rawCss = ${JSON.stringify(css)};
          var imports = [];
          var bodyCss = rawCss.replace(/@import[^;]+;/g, function(match) {
            imports.push(match);
            return '';
          });
          style.textContent = imports.join('\\n') + '\\n@layer utilities {\\n' + bodyCss + '\\n}';
          document.head.appendChild(style);
        }
      }
    `;
  },
});
