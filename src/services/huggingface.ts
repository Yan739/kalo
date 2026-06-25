export interface PlateGuess {
  label: string;
  score: number;
}

export class MissingHfTokenError extends Error {
  constructor() {
    super('Token HuggingFace absent. Definir EXPO_PUBLIC_HF_TOKEN.');
    this.name = 'MissingHfTokenError';
  }
}

interface HfClassification {
  label: string;
  score: number;
}

const DEFAULT_MODEL = 'nateraw/food';
const MAX_RETRIES = 3;
const DEFAULT_WAIT_MS = 4000;

function getToken(): string {
  const token = process.env.EXPO_PUBLIC_HF_TOKEN;
  if (!token) {
    throw new MissingHfTokenError();
  }
  return token;
}

function getModel(): string {
  return process.env.EXPO_PUBLIC_HF_MODEL ?? DEFAULT_MODEL;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function classifyPlate(imageUri: string): Promise<PlateGuess[]> {
  const token = getToken();
  const model = getModel();

  const imageResponse = await fetch(imageUri);
  const blob = await imageResponse.blob();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': blob.type || 'image/jpeg',
          'x-wait-for-model': 'true',
        },
        body: blob,
      },
    );

    // 503 = modele en cours de chargement (cold start). On attend et on reessaie.
    if (response.status === 503 && attempt < MAX_RETRIES) {
      const estimated = await response
        .json()
        .then((body: { estimated_time?: number }) =>
          typeof body.estimated_time === 'number'
            ? Math.min(body.estimated_time * 1000, 20000)
            : DEFAULT_WAIT_MS,
        )
        .catch(() => DEFAULT_WAIT_MS);
      await delay(estimated);
      continue;
    }

    if (!response.ok) {
      throw new Error(`HuggingFace HTTP ${response.status}`);
    }

    const data = (await response.json()) as HfClassification[];
    if (!Array.isArray(data)) {
      throw new Error('Reponse HuggingFace inattendue');
    }

    return data
      .map((item) => ({ label: item.label, score: item.score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  throw new Error('HuggingFace indisponible (modele toujours en chargement).');
}
