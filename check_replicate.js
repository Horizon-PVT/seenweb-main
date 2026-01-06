const Replicate = require('replicate');

const replicate = new Replicate({
    auth: 'r8_G64VXJ7Ku04TgqyqGdppokFYUTjrZCI1Ic9dY',
});

async function check() {
    try {
        const prediction = await replicate.predictions.get('w9zjg36x81rnc0cvhwe9xpf5aw');
        console.log(JSON.stringify(prediction, null, 2));
    } catch (e) {
        console.error(e);
    }
}

check();
