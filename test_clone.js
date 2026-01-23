// test_clone.js
const fs = require('fs');
// const fetch = require('node-fetch'); // Native in Node 18

const TTS_URL = 'https://seenweb-main-production.up.railway.app';

async function testClone() {
    console.log('Testing Clone Endpoint:', `${TTS_URL}/clone`);

    // Create a dummy WAV file (minimal header if possible, or just text and hope server validates later)
    // Actually server.py checks extension.
    if (!fs.existsSync('test_audio.wav')) {
        fs.writeFileSync('test_audio.wav', 'Fake Audio Content');
    }

    try {
        const fileContent = fs.readFileSync('test_audio.wav');
        const formData = new FormData();

        // Node 18 Blob
        const blob = new Blob([fileContent], { type: 'audio/wav' });

        formData.append('audio_file', blob, 'test_audio.wav');
        formData.append('name', 'Test Voice Script');

        console.log('Uploading file...');
        const res = await fetch(`${TTS_URL}/clone`, {
            method: 'POST',
            body: formData
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text);

    } catch (e) {
        console.error('Error:', e);
    }
}

testClone();
