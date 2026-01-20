// Simple test to check if extension loads
console.log('🔴 [SeenYT TEST] Content script loaded!', new Date().toISOString());

// Check if React and Widget are available
setTimeout(() => {
    const widget = document.querySelector('[class*="border-red-600"]');
    if (widget) {
        console.log('✅ [SeenYT TEST] Widget found in DOM!');
    } else {
        console.error('❌ [SeenYT TEST] Widget NOT found in DOM!');
    }
}, 3000);

// Log every 5 seconds to confirm script is running
setInterval(() => {
    console.log('💚 [SeenYT TEST] Still alive...', new Date().toISOString());
}, 5000);
