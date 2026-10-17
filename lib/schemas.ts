import { z } from 'zod';
import { DAY_LABELS } from './events';

export const dayKeySchema = z.enum([
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
]);

const dayLabelValues = Object.values(DAY_LABELS);

export const recommendRequestSchema = z.object({
  interests: z
    .array(
      z
        .string()
        .min(1)
        .max(40)
        .transform((s) => s.trim().toLowerCase())
    )
    .min(1, 'Escolhe pelo menos um interesse.')
    .max(12, 'Podes escolher até 12 interesses.'),
  availability: z.object({
    days: z
      .array(dayKeySchema)
      .min(1, 'Seleciona pelo menos um dia livre.'),
    freeTimes: z.string().max(240).optional(),
  }),
  price: z.enum(['free', 'any']),
  refine: z.string().max(300).optional(),
});

export type RecommendRequest = z.infer<typeof recommendRequestSchema>;

export const pickSchema = z.object({
  event_id: z.string().min(1),
  reason: z.string().min(20).max(360),
  fit: z.number().min(0).max(1),
});

export const notRecommendedSchema = z.object({
  event_id: z.string().min(1),
  reason: z.string().min(20).max(360),
});

export const recommendationResponseSchema = z.object({
  picks: z.array(pickSchema).max(5),
  not_recommended: z.array(notRecommendedSchema),
  explanation: z.string().max(500).optional(),
});

export type RecommendationResponse = z.infer<typeof recommendationResponseSchema>;

export const apiRecommendResponseSchema = z.object({
  ok: z.literal(true),
  mode: z.enum(['llm', 'demo']),
  model: z.string().optional(),
  warning: z.string().optional(),
  picks: z.array(pickSchema),
  not_recommended: z.array(notRecommendedSchema),
  explanation: z.string().optional(),
});

export type ApiRecommendResponse = z.infer<typeof apiRecommendResponseSchema>;
