const fs = require('fs');
const files = [
  'pages/api/platforms/connect.ts',
  'pages/api/tools/tts/download.ts',
  'pages/api/tools/tts/edge.ts',
  'pages/api/tools/tts/generate-dialogue.ts',
  'pages/api/tools/tts/generate-file.ts',
  'pages/api/tools/tts/generate-srt.ts',
  'pages/api/tools/tts/status.ts',
  'pages/api/trends/detect.ts',
  'pages/api/user/upload-avatar.ts'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/['\"]\.\.?\/\.\.?\/auth\/\[\.\.\.nextauth\]['\"]/g, "'@/pages/api/auth/[...nextauth]'");
  content = content.replace(/['\"]\.\/auth\/\[\.\.\.nextauth\]['\"]/g, "'@/pages/api/auth/[...nextauth]'");
  fs.writeFileSync(f, content);
});
