const Replicate = require('replicate');

const replicate = new Replicate({
    auth: 'r8_G64VXJ7Ku04TgqyqGdppokFYUTjrZCI1Ic9dY',
});

async function getLatestVersion() {
    try {
        const model = await replicate.models.get("zedge", "live-portrait");
        console.log("Latest Version ID:", model.latest_version.id);
    } catch (e) {
        console.error("Error fetching model:", e);
    }
}

getLatestVersion();
