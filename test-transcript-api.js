// Test script - run in browser console
const testVideos = [
    'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up (has captions)
    'jNQXAC9IVRw', // Me at the zoo (might not have captions)
    '9bZkp7q19f0', // Gangnam Style (has captions)
];

for (const videoId of testVideos) {
    fetch(`https://seenyt.net/api/youtube/transcript?videoId=${videoId}`)
        .then(r => r.json())
        .then(data => console.log(`${videoId}:`, data.success ? '✅ SUCCESS' : '❌ FAIL', data))
        .catch(e => console.error(`${videoId}: ERROR`, e));
}
