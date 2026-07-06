import {
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth'
import { healthMetricType, healthSampleSource } from './enums'
import { sessions } from './training'

// Generic health metric samples mirroring HKQuantitySample — body weight is
// just another metric type. Populated from v1.1 (HealthKit sync) but the
// table ships now so nothing needs rethinking.
export const healthSamples = pgTable(
  'health_samples',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    metricType: healthMetricType('metric_type').notNull(),
    value: numeric('value', {
      precision: 12,
      scale: 3,
      mode: 'number',
    }).notNull(),
    unit: text('unit').notNull(),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    source: healthSampleSource('source').notNull(),
    sessionId: uuid('session_id').references(() => sessions.id, {
      onDelete: 'set null',
    }),
    // HealthKit sample UUID — dedup on re-sync
    externalId: text('external_id').unique(),
  },
  (t) => [
    index('health_samples_user_metric_time_idx').on(
      t.userId,
      t.metricType,
      t.startTime,
    ),
  ],
)
