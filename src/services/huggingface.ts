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

export class HfHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
  ) {
    super(`HuggingFace HTTP ${status}`);
    this.name = 'HfHttpError';
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

function endpoints(model: string): string[] {
  return [
    `https://router.huggingface.co/hf-inference/models/${model}`,
    `https://api-inference.huggingface.co/models/${model}`,
  ];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callEndpoint(
  url: string,
  token: string,
  blob: Blob,
): Promise<HfClassification[]> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': blob.type || 'image/jpeg',
        'x-wait-for-model': 'true',
      },
      body: blob,
    });

    if (response.status === 503 && attempt < MAX_RETRIES) {
      const wait = await response
        .json()
        .then((b: { estimated_time?: number }) =>
          typeof b.estimated_time === 'number'
            ? Math.min(b.estimated_time * 1000, 20000)
            : DEFAULT_WAIT_MS,
        )
        .catch(() => DEFAULT_WAIT_MS);
      await delay(wait);
      continue;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new HfHttpError(response.status, body.slice(0, 200));
    }

    const data = (await response.json()) as HfClassification[];
    if (!Array.isArray(data)) {
      throw new HfHttpError(200, 'Reponse inattendue');
    }
    return data;
  }
  throw new HfHttpError(503, 'Modele toujours en chargement');
}

export async function classifyPlate(imageUri: string): Promise<PlateGuess[]> {
  const token = getToken();
  const model = getModel();
  const imageResponse = await fetch(imageUri);
  const blob = await imageResponse.blob();

  let lastError: unknown;
  for (const url of endpoints(model)) {
    try {
      const data = await callEndpoint(url, token, blob);
      return data
        .map((item) => ({ label: item.label, score: item.score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      lastError = error;
      // 404 = model not served by this endpoint: try the next one.
      if (error instanceof HfHttpError && error.status === 404) {
        continue;
      }
      throw error;
    }
  }
  throw lastError ?? new HfHttpError(404, 'Modele introuvable');
}
