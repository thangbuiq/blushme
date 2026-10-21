export const MOODS = ['calm', 'happy', 'irritable', 'sad', 'anxious', 'energetic'] as const
export type Mood = (typeof MOODS)[number]
