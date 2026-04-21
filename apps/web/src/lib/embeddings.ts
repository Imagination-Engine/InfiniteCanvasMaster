/**
 * Generates an embedding for the given text using Google's Gemini Embedding API.
 * @param text The text to embed.
 * @returns A promise that resolves to an array of numbers representing the embedding.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GOOGLE_API_KEY is not defined in the environment.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text }],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to generate embedding: ${response.statusText} ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();
  if (!data.embedding || !data.embedding.values) {
    throw new Error('Invalid response from embedding API: missing embedding values.');
  }

  return data.embedding.values;
}

/**
 * Splits text into chunks of approximately the specified size with overlap.
 */
export function chunkText(text: string, chunkSize = 2000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  if (text.length <= chunkSize) {
    return [text];
  }

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
    
    // Safety check to avoid infinite loop
    if (chunkSize <= overlap) break;
  }

  return chunks;
}
