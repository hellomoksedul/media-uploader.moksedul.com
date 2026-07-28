import './index.css';

// ── Media uploader public API ──────────────────────────────────────────────
// This package ships the uploader (box + dialog + image editor/cropper), plus
// the standalone preview + image-editor dialogs. No media-library list /
// page-header / gallery components are included.

// Upload dialog with tabs (Upload / My Files / Unsplash) + built-in image
// editor & cropper. Exposes `MediaUploader` (default) and `MediaUploadDialog`.
export * from './components/file-uploads';

// Required context provider + shared types (ApiMedia, MediaConfig, etc.)
export * from './components/MediaProvider';

// Standalone preview dialog (view + rename + delete + open editor).
export * from './components/MediaPreviewDialog';
// Full-screen image editor for an existing media item (crop / adjust / filter,
// re-uploads through the provider).
export * from './components/MediaEditImageDialog';

// Configurable inline uploader field — variants: box | button | avatar | dropzone.
export * from './components/MediaUploadField';
// Low-level presentational dropzone primitive.
export * from './components/MediaDropzone';

// Image component used internally by the uploader; exported for convenience.
export { default as SmartImage } from './components/SmartImage';
