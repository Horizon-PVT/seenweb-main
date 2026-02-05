// TTS Engine Configuration
// Routes requests to appropriate TTS backend based on language

export const TTS_ENGINES = {
    en: process.env.TTS_SERVER_URL || 'http://127.0.0.1:8000',
    vi: process.env.VIENEU_TTS_URL || 'https://seenweb-main-production.up.railway.app'
} as const;

export type TTSLanguage = 'en' | 'vi';

// Preset voices for each engine
export const PRESET_VOICES = {
    en: [
        { id: 'alba', name: 'Alba', gender: 'female' },
        { id: 'marius', name: 'Marius', gender: 'male' },
        { id: 'javert', name: 'Javert', gender: 'male' },
        { id: 'jean', name: 'Jean', gender: 'male' },
        { id: 'fantine', name: 'Fantine', gender: 'female' },
        { id: 'cosette', name: 'Cosette', gender: 'female' },
        { id: 'eponine', name: 'Eponine', gender: 'female' },
        { id: 'azelma', name: 'Azelma', gender: 'female' },
    ],
    vi: [
        { id: 'vn_female_1', name: 'Hồng Nhung', gender: 'female' },
        { id: 'vn_male_1', name: 'Minh Tuấn', gender: 'male' },
        { id: 'vn_female_2', name: 'Thu Hà', gender: 'female' },
        { id: 'vn_male_2', name: 'Quốc Việt', gender: 'male' },
    ]
};

export function getTTSEndpoint(language: TTSLanguage): string {
    return TTS_ENGINES[language] || TTS_ENGINES.en;
}
