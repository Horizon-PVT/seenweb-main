
const { exec } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

console.log('--- SYSTEM CHECK ---');

// Check FFmpeg
console.log('Checking ffmpeg...');
if (ffmpegStatic) {
    console.log('ffmpeg-static path:', ffmpegStatic);
    ffmpeg.setFfmpegPath(ffmpegStatic);
    ffmpeg.getAvailableFormats((err, formats) => {
        if (err) console.error('FFmpeg error:', err);
        else console.log('FFmpeg OK. Formats found:', Object.keys(formats).length);
    });
} else {
    console.error('ffmpeg-static NOT FOUND');
}

// Check EdgeTTS
console.log('Checking edge-tts...');
exec('edge-tts --version', (err, stdout, stderr) => {
    if (err) {
        console.error('edge-tts failed:', err.message);
        console.log('Try installing manually: pip install edge-tts');
    } else {
        console.log('edge-tts OK:', stdout.trim());
    }
});
