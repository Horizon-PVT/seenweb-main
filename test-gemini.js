
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // For v1beta, we might not have listModels exposed cleanly in the helper, 
        // but let's try strict invocation or just raw fetch if this fails.
        // Actually @google/generative-ai doesn't have listModels on the instance usually, 
        // it's on the ModelManager or similar? 
        // Wait, the SDK is simple.
        // Let's try to just instantiate a model and run a dummy prompt, 
        // catching specific errors.

        console.log("Checking gemini-pro...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const res = await model.generateContent("Test");
            console.log("SUCCESS: gemini-pro is working.");
        } catch (e) { console.log("FAILED gemini-pro:", e.message); }

        console.log("Checking gemini-1.5-flash...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const res = await model.generateContent("Test");
            console.log("SUCCESS: gemini-1.5-flash is working.");
        } catch (e) { console.log("FAILED gemini-1.5-flash:", e.message); }

        console.log("Checking gemini-1.5-flash-latest...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            const res = await model.generateContent("Test");
            console.log("SUCCESS: gemini-1.5-flash-latest is working.");
        } catch (e) { console.log("FAILED gemini-1.5-flash-latest:", e.message); }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
