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

export async function classifyPlate(imageUri: string): Promise<PlateGuess[]> {
  const token = getToken();
  const model = getModel();

  const imageResponse = await fetch(imageUri);
  const blob = await imageResponse.blob();

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': blob.type || 'image/jpeg',
      },
      body: blob,
    },
  );

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
