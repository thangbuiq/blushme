export const CORE_SYMPTOMS = ['cramps', 'headache', 'bloating', 'fatigue', 'backache', 'tenderness'] as const
export const MORE_SYMPTOMS = ['acne', 'nausea', 'cravings', 'insomnia', 'constipation', 'diarrhea'] as const
export type Symptom = (typeof CORE_SYMPTOMS)[number] | (typeof MORE_SYMPTOMS)[number]
