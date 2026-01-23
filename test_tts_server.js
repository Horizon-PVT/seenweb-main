// script to test tts server
const fetch = require('node-fetch'); // You might need to install node-fetch or use native fetch if Node 18+
// In Node 18+, fetch is global. If this script fails with 'fetch is not defined', run with node --experimental-fetch or ensure Node 18.
const FormData = require('form-data'); // Need 'form-data' package for Node scripts specifically if native FormData is missing features, BUT native should work.

const TTS_URL = 'https://seenweb-main-production.up.railway.app';

async function testGenerate() {
    console.log('Testing TTS Generate Endpoint:', `${TTS_URL}/generate`);
    try {
        const formData = new URLSearchParams(); // Try Simple Form first (x-www-form-urlencoded)
        // Wait, Server expects Form. URLSearchParams sends application/x-www-form-urlencoded.
        formData.append('text', 'Hello testing');
        formData.append('voice', 'alba');

        console.log('Sending request...');
        const res = await fetch(`${TTS_URL}/generate`, {
            method: 'POST',
            body: formData
        });

        console.log('Status:', res.status, res.statusText);
        if (!res.ok) {
            const txt = await res.text();
            console.log('Error Body:', txt);
        } else {
            console.log('Success! Content-Type:', res.headers.get('content-type'));
        }
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

testGenerate();
