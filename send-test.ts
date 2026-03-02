import { sendZoomWelcomeEmail } from './lib/email-zoom';

async function main() {
    try {
        console.log('Sending test email to founder@seenyt.net ...');
        // I will send it to founder@seenyt.net so the user might receive it if they want
        // or phamanhtung.jp@gmail.com
        const success = await sendZoomWelcomeEmail('phamanhtung.jp@gmail.com', 'Tùng Phạm');
        console.log('Test success?', success);
    } catch (e) {
        console.error('Error in test script:', e);
    }
}

main();
