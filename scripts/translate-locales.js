const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

/**
 * Translation Script using Gemini API
 * Translates Vietnamese locale to multiple languages
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Target languages
const TARGET_LANGUAGES = [
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'th', name: 'Thai' },
    { code: 'id', name: 'Indonesian' },
    { code: 'es', name: 'Spanish' },
    { code: 'en', name: 'English' }
];

const LOCALES_DIR = path.join(__dirname, '..', 'public', 'locales');
const SOURCE_FILE = path.join(LOCALES_DIR, 'vi', 'common.json');

/**
 * Call Gemini API to translate JSON content using official SDK
 */
async function translateWithGemini(jsonContent, targetLang) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `You are a professional translator for a YouTube creator tool website called SeenYT.

Translate the following JSON content from Vietnamese to ${targetLang}.

CRITICAL RULES:
1. Preserve ALL JSON structure exactly (keys, nesting, formatting)
2. ONLY translate the VALUES, NEVER translate the keys
3. Keep placeholders like {{variable}} exactly as-is
4. Keep HTML tags exactly as-is
5. Maintain the same tone: professional, helpful, and motivating
6. For technical terms (YouTube, SEO, AI, etc.), keep them in English or use appropriate transliteration
7. Return ONLY valid JSON, no explanations or markdown

Source JSON (Vietnamese):
${JSON.stringify(jsonContent, null, 2)}

Respond with the translated JSON in ${targetLang}:`;

    try {
        const result = await model.generateContent(prompt, {
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 8000
            }
        });

        const response = await result.response;
        const translatedText = response.text();

        // Extract JSON from markdown if wrapped
        const jsonMatch = translatedText.match(/```json\n?([\s\S]*?)\n?```/) ||
            translatedText.match(/```\n?([\s\S]*?)\n?```/);

        const jsonString = jsonMatch ? jsonMatch[1] : translatedText;

        return JSON.parse(jsonString.trim());
    } catch (error) {
        throw new Error(`Failed to translate: ${error.message}`);
    }
}

/**
 * Main translation function
 */
async function translateLocales() {
    console.log('🌍 Starting multi-language translation...\n');

    // Check API key
    if (!GEMINI_API_KEY) {
        console.error('❌ Error: GEMINI_API_KEY not found in environment variables');
        console.log('Please add GEMINI_API_KEY to your .env file');
        process.exit(1);
    }

    // Read source file
    console.log('📖 Reading source file: vi/common.json');
    const sourceContent = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));

    // Translate to each target language
    for (const lang of TARGET_LANGUAGES) {
        try {
            console.log(`\n🔄 Translating to ${lang.name} (${lang.code})...`);

            const translated = await translateWithGemini(sourceContent, lang.name);

            // Create directory if not exists
            const targetDir = path.join(LOCALES_DIR, lang.code);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            // Write translated file
            const targetFile = path.join(targetDir, 'common.json');
            fs.writeFileSync(targetFile, JSON.stringify(translated, null, 2), 'utf8');

            console.log(`✅ Successfully created: ${lang.code}/common.json`);

            // Wait a bit to avoid rate limiting (if needed)
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`❌ Error translating to ${lang.name}:`, error.message);
            // Continue with other languages
        }
    }

    console.log('\n🎉 Translation complete! Generated files:');
    TARGET_LANGUAGES.forEach(lang => {
        const filePath = path.join(LOCALES_DIR, lang.code, 'common.json');
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`   ✓ ${lang.code}/common.json (${(stats.size / 1024).toFixed(1)} KB)`);
        }
    });
}

// Run the script
translateLocales().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
