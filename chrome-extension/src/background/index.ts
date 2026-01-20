// Background Service Worker
console.log('[SeenYT] Background script loaded.');

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('[SeenYT] Extension installed successfully!');
});
