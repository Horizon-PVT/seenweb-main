// lib/localization-seo.ts
// Phase 6: Multi-Language SEO - Local keyword research and SEO optimization per market

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface LocalSEOConfig {
  language: string;
  country: string;
  locale: string;
  currency: string;
  label: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LocalSEOConfig[] = [
  { language: 'vi', country: 'VN', locale: 'vi-VN', currency: 'VND', label: 'Vietnamese', flag: '🇻🇳' },
  { language: 'en', country: 'US', locale: 'en-US', currency: 'USD', label: 'English (US)', flag: '🇺🇸' },
  { language: 'en', country: 'GB', locale: 'en-GB', currency: 'USD', label: 'English (UK)', flag: '🇬🇧' },
  { language: 'th', country: 'TH', locale: 'th-TH', currency: 'THB', label: 'Thai', flag: '🇹🇭' },
  { language: 'id', country: 'ID', locale: 'id-ID', currency: 'IDR', label: 'Indonesian', flag: '🇮🇩' },
  { language: 'ja', country: 'JP', locale: 'ja-JP', currency: 'JPY', label: 'Japanese', flag: '🇯🇵' },
  { language: 'ko', country: 'KR', locale: 'ko-KR', currency: 'KRW', label: 'Korean', flag: '🇰🇷' },
  { language: 'es', country: 'ES', locale: 'es-ES', currency: 'USD', label: 'Spanish', flag: '🇪🇸' },
];

export interface LocalSEOResult {
  original: {
    title: string;
    description: string;
    tags: string[];
  };
  translations: Record<string, {
    title: string;
    description: string;
    tags: string[];
    localKeywords: string[];
    seoTips: string[];
  }>;
}

export async function generateLocalSEO(
  originalTitle: string,
  originalDescription: string,
  originalTags: string[],
  targetLocales: string[]
): Promise<LocalSEOResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const localesToTranslate = SUPPORTED_LOCALES.filter(
    l => targetLocales.includes(l.locale)
  );

  const translations: LocalSEOResult['translations'] = {};

  for (const locale of localesToTranslate) {
    try {
      const prompt = `
You are a YouTube SEO expert specializing in ${locale.label} markets.

Translate and optimize this YouTube content for ${locale.label} (${locale.locale}):

ORIGINAL CONTENT:
Title: ${originalTitle}
Description: ${originalDescription}
Tags: ${originalTags.join(', ')}

REQUIREMENTS:
1. Translate title to ${locale.label} - keep it engaging, under 100 characters
2. Translate and expand description - add local context, keep it natural, 200-300 words
3. Adapt tags for local search - include local language variations
4. Provide 5 local keywords that resonate with ${locale.country} audience
5. Give 3 SEO tips specific to the ${locale.label} YouTube market

Respond in JSON format:
{
  "title": "translated title",
  "description": "translated and expanded description",
  "tags": ["local tag 1", "local tag 2", "local tag 3", "local tag 4", "local tag 5"],
  "localKeywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"],
  "seoTips": ["tip 1", "tip 2", "tip 3"]
}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        translations[locale.locale] = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error(`Failed to translate for ${locale.locale}:`, err);
    }
  }

  return {
    original: {
      title: originalTitle,
      description: originalDescription,
      tags: originalTags,
    },
    translations,
  };
}

// Get SEO score for a video
export async function getSEOScore(
  title: string,
  description: string,
  tags: string[],
  locale: string = 'vi-VN'
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      score: 0,
      analysis: { titleScore: 0, descriptionScore: 0, tagScore: 0, keywordScore: 0 },
      suggestions: ['API not configured'],
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
Analyze this YouTube video SEO and provide scores (0-100) with suggestions:

Title: ${title}
Description: ${description}
Tags: ${tags.join(', ')}
Locale: ${locale}

Scoring criteria:
- Title: keyword presence, length (50-60 chars optimal), hook words, numbers
- Description: length (200+ words), keyword usage, CTA, timestamps
- Tags: 5-15 tags, mix of broad and specific, keyword-rich
- Keywords: relevance to title, search volume indicators

Respond JSON:
{
  "score": overall_score,
  "analysis": {
    "titleScore": number,
    "descriptionScore": number,
    "tagScore": number,
    "keywordScore": number
  },
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as {
        score: number;
        analysis: {
          titleScore: number;
          descriptionScore: number;
          tagScore: number;
          keywordScore: number;
        };
        suggestions: string[];
      };
    }
  } catch (err) {
    console.error('SEO analysis failed:', err);
  }

  return {
    score: 50,
    analysis: { titleScore: 50, descriptionScore: 50, tagScore: 50, keywordScore: 50 },
    suggestions: ['Analysis unavailable'],
  };
}
