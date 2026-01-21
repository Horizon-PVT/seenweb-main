const { YoutubeTranscript } = require('youtube-transcript');

async function test() {
    console.log('Testing Transcript Fetch...');
    try {
        // Video: Never Gonna Give You Up (captions enabled)
        const videoId = 'dQw4w9WgXcQ';
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        console.log('✅ SUCCESS!');
        console.log('First 5 lines:', transcript.slice(0, 5));
    } catch (e) {
        console.error('❌ FAILED:', e);
    }
}

test();
