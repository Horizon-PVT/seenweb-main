// lib/pinecone.ts
// Pinecone client for RAG knowledge base - Using REST API directly

const PINECONE_HOST = process.env.PINECONE_HOST || 'https://seenyt-knowledge-30b8dih.svc.aped-4627-b74a.pinecone.io';

// Generate embeddings using OpenAI ada-002
export async function generateEmbedding(text: string): Promise<number[]> {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
            model: 'text-embedding-ada-002',
            input: text,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate embedding: ${errorText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
}

// Upsert a document using REST API
export async function upsertDocument(id: string, content: string, metadata?: Record<string, any>) {
    const embedding = await generateEmbedding(content);
    const apiKey = process.env.PINECONE_API_KEY;

    if (!apiKey) {
        throw new Error('PINECONE_API_KEY is not configured');
    }

    const response = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
        },
        body: JSON.stringify({
            vectors: [{
                id,
                values: embedding,
                metadata: {
                    content,
                    ...metadata,
                },
            }],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upsert failed: ${errorText}`);
    }

    return await response.json();
}

// Batch upsert multiple documents using REST API
export async function batchUpsertDocuments(documents: { id: string; content: string; metadata?: Record<string, any> }[]) {
    const apiKey = process.env.PINECONE_API_KEY;

    if (!apiKey) {
        throw new Error('PINECONE_API_KEY is not configured');
    }

    const batchSize = 5;
    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);

        try {
            const vectors = await Promise.all(batch.map(async (doc) => {
                const embedding = await generateEmbedding(doc.content);
                return {
                    id: doc.id,
                    values: embedding,
                    metadata: {
                        content: doc.content,
                        ...doc.metadata,
                    },
                };
            }));

            const response = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': apiKey,
                },
                body: JSON.stringify({ vectors }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            successCount += vectors.length;
            console.log(`Upserted batch ${i}-${i + batchSize}, total success: ${successCount}`);
        } catch (error: any) {
            console.error(`Batch ${i} error:`, error.message);
            errors.push(`Batch ${i}-${i + batchSize}: ${error.message}`);
        }

        // Delay between batches
        if (i + batchSize < documents.length) {
            await new Promise(r => setTimeout(r, 1500));
        }
    }

    return { success: successCount, failed: documents.length - successCount, errors };
}

// Search for similar documents using REST API
export async function searchKnowledge(query: string, topK: number = 5): Promise<string[]> {
    try {
        const embedding = await generateEmbedding(query);
        const apiKey = process.env.PINECONE_API_KEY;

        if (!apiKey) {
            return [];
        }

        const response = await fetch(`${PINECONE_HOST}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': apiKey,
            },
            body: JSON.stringify({
                vector: embedding,
                topK,
                includeMetadata: true,
            }),
        });

        if (!response.ok) {
            console.error('Search failed:', await response.text());
            return [];
        }

        const data = await response.json();
        return data.matches
            ?.filter((m: any) => m.metadata?.content)
            .map((m: any) => m.metadata?.content as string) || [];
    } catch (error) {
        console.error('Error searching knowledge:', error);
        return [];
    }
}
