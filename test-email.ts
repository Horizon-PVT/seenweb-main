import { sendZoomWelcomeEmail } from './lib/email-zoom';

async function testEmail() {
    console.log("Starting email test...");
    const result = await sendZoomWelcomeEmail('phamanhtung.jp@gmail.com', 'Anh Tùng Tester');
    console.log("Email test result:", result);
}

testEmail();
