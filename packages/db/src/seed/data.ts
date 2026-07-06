import type { Equipment, MuscleGroup } from '@gart/core'

// Curated catalog: our movement taxonomy (muscles from the locked enum),
// exercises = Movement × Equipment. datasetId points into free-exercise-db
// (public domain, github.com/yuhonas/free-exercise-db) for instructions.

export type MovementSeed = Readonly<{
  slug: string
  name: string
  primary: readonly MuscleGroup[]
  secondary?: readonly MuscleGroup[]
}>

export type ExerciseSeed = Readonly<{
  name: string
  movement: string
  equipment: Equipment
  variation?: string
  datasetId?: string
}>

export const MOVEMENTS: readonly MovementSeed[] = [
  // legs
  {
    slug: 'squat',
    name: 'Squat',
    primary: ['quads'],
    secondary: ['glutes', 'adductors', 'lower_back', 'abs'],
  },
  {
    slug: 'leg-press',
    name: 'Leg Press',
    primary: ['quads'],
    secondary: ['glutes', 'adductors'],
  },
  {
    slug: 'lunge',
    name: 'Lunge',
    primary: ['quads'],
    secondary: ['glutes', 'hamstrings'],
  },
  { slug: 'leg-extension', name: 'Leg Extension', primary: ['quads'] },
  {
    slug: 'leg-curl',
    name: 'Leg Curl',
    primary: ['hamstrings'],
    secondary: ['calves'],
  },
  {
    slug: 'deadlift',
    name: 'Deadlift',
    primary: ['glutes', 'hamstrings'],
    secondary: ['lower_back', 'traps', 'forearms', 'quads'],
  },
  {
    slug: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    primary: ['hamstrings', 'glutes'],
    secondary: ['lower_back', 'forearms'],
  },
  {
    slug: 'hip-thrust',
    name: 'Hip Thrust',
    primary: ['glutes'],
    secondary: ['hamstrings', 'quads'],
  },
  {
    slug: 'hip-abduction',
    name: 'Hip Abduction',
    primary: ['abductors'],
    secondary: ['glutes'],
  },
  { slug: 'hip-adduction', name: 'Hip Adduction', primary: ['adductors'] },
  { slug: 'calf-raise', name: 'Calf Raise', primary: ['calves'] },
  // push
  {
    slug: 'chest-press',
    name: 'Chest Press',
    primary: ['chest'],
    secondary: ['front_delts', 'triceps'],
  },
  {
    slug: 'incline-press',
    name: 'Incline Press',
    primary: ['chest'],
    secondary: ['front_delts', 'triceps'],
  },
  {
    slug: 'chest-fly',
    name: 'Chest Fly',
    primary: ['chest'],
    secondary: ['front_delts'],
  },
  {
    slug: 'dip',
    name: 'Dip',
    primary: ['chest', 'triceps'],
    secondary: ['front_delts'],
  },
  {
    slug: 'overhead-press',
    name: 'Overhead Press',
    primary: ['front_delts'],
    secondary: ['side_delts', 'triceps'],
  },
  {
    slug: 'lateral-raise',
    name: 'Lateral Raise',
    primary: ['side_delts'],
    secondary: ['traps'],
  },
  // pull
  {
    slug: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    primary: ['rear_delts'],
    secondary: ['upper_back'],
  },
  {
    slug: 'face-pull',
    name: 'Face Pull',
    primary: ['rear_delts'],
    secondary: ['upper_back', 'traps'],
  },
  {
    slug: 'vertical-pull',
    name: 'Vertical Pull',
    primary: ['lats'],
    secondary: ['biceps', 'upper_back', 'forearms'],
  },
  {
    slug: 'horizontal-row',
    name: 'Horizontal Row',
    primary: ['upper_back', 'lats'],
    secondary: ['biceps', 'rear_delts', 'forearms'],
  },
  { slug: 'shrug', name: 'Shrug', primary: ['traps'], secondary: ['forearms'] },
  {
    slug: 'back-extension',
    name: 'Back Extension',
    primary: ['lower_back'],
    secondary: ['glutes', 'hamstrings'],
  },
  // arms
  {
    slug: 'biceps-curl',
    name: 'Biceps Curl',
    primary: ['biceps'],
    secondary: ['forearms'],
  },
  {
    slug: 'triceps-extension',
    name: 'Triceps Extension',
    primary: ['triceps'],
  },
  // core
  { slug: 'crunch', name: 'Crunch', primary: ['abs'], secondary: ['obliques'] },
  {
    slug: 'leg-raise',
    name: 'Leg Raise',
    primary: ['abs'],
    secondary: ['hip_flexors'],
  },
  {
    slug: 'plank',
    name: 'Plank',
    primary: ['abs'],
    secondary: ['obliques', 'lower_back'],
  },
  {
    slug: 'russian-twist',
    name: 'Russian Twist',
    primary: ['obliques'],
    secondary: ['abs'],
  },
]

export const EXERCISES: readonly ExerciseSeed[] = [
  // squat
  {
    name: 'Back Squat',
    movement: 'squat',
    equipment: 'barbell',
    datasetId: 'Barbell_Squat',
  },
  {
    name: 'Front Squat',
    movement: 'squat',
    equipment: 'barbell',
    variation: 'front',
    datasetId: 'Front_Barbell_Squat',
  },
  {
    name: 'Goblet Squat',
    movement: 'squat',
    equipment: 'dumbbell',
    datasetId: 'Goblet_Squat',
  },
  {
    name: 'Bodyweight Squat',
    movement: 'squat',
    equipment: 'bodyweight',
    datasetId: 'Bodyweight_Squat',
  },
  // legs machines / hinges
  {
    name: 'Leg Press',
    movement: 'leg-press',
    equipment: 'machine',
    datasetId: 'Leg_Press',
  },
  {
    name: 'Barbell Lunge',
    movement: 'lunge',
    equipment: 'barbell',
    datasetId: 'Barbell_Lunge',
  },
  {
    name: 'Dumbbell Lunge',
    movement: 'lunge',
    equipment: 'dumbbell',
    datasetId: 'Dumbbell_Lunges',
  },
  {
    name: 'Leg Extension',
    movement: 'leg-extension',
    equipment: 'machine',
    datasetId: 'Leg_Extensions',
  },
  {
    name: 'Lying Leg Curl',
    movement: 'leg-curl',
    equipment: 'machine',
    datasetId: 'Lying_Leg_Curls',
  },
  {
    name: 'Seated Leg Curl',
    movement: 'leg-curl',
    equipment: 'machine',
    datasetId: 'Seated_Leg_Curl',
  },
  {
    name: 'Deadlift',
    movement: 'deadlift',
    equipment: 'barbell',
    datasetId: 'Barbell_Deadlift',
  },
  {
    name: 'Romanian Deadlift',
    movement: 'romanian-deadlift',
    equipment: 'barbell',
    datasetId: 'Romanian_Deadlift',
  },
  {
    name: 'Barbell Glute Bridge',
    movement: 'hip-thrust',
    equipment: 'barbell',
    datasetId: 'Barbell_Glute_Bridge',
  },
  {
    name: 'Glute Bridge',
    movement: 'hip-thrust',
    equipment: 'bodyweight',
    datasetId: 'Butt_Lift_Bridge',
  },
  {
    name: 'Hip Abduction Machine',
    movement: 'hip-abduction',
    equipment: 'machine',
    datasetId: 'Thigh_Abductor',
  },
  {
    name: 'Hip Adduction Machine',
    movement: 'hip-adduction',
    equipment: 'machine',
    datasetId: 'Thigh_Adductor',
  },
  {
    name: 'Standing Calf Raise',
    movement: 'calf-raise',
    equipment: 'machine',
    datasetId: 'Standing_Calf_Raises',
  },
  {
    name: 'Seated Calf Raise',
    movement: 'calf-raise',
    equipment: 'machine',
    datasetId: 'Seated_Calf_Raise',
  },
  // chest
  {
    name: 'Barbell Bench Press',
    movement: 'chest-press',
    equipment: 'barbell',
    datasetId: 'Barbell_Bench_Press_-_Medium_Grip',
  },
  {
    name: 'Dumbbell Bench Press',
    movement: 'chest-press',
    equipment: 'dumbbell',
    datasetId: 'Dumbbell_Bench_Press',
  },
  {
    name: 'Machine Chest Press',
    movement: 'chest-press',
    equipment: 'machine',
    datasetId: 'Machine_Bench_Press',
  },
  {
    name: 'Push-Up',
    movement: 'chest-press',
    equipment: 'bodyweight',
    datasetId: 'Pushups',
  },
  {
    name: 'Incline Barbell Bench Press',
    movement: 'incline-press',
    equipment: 'barbell',
    datasetId: 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  },
  {
    name: 'Incline Dumbbell Press',
    movement: 'incline-press',
    equipment: 'dumbbell',
    datasetId: 'Incline_Dumbbell_Press',
  },
  {
    name: 'Dumbbell Fly',
    movement: 'chest-fly',
    equipment: 'dumbbell',
    datasetId: 'Dumbbell_Flyes',
  },
  {
    name: 'Cable Crossover',
    movement: 'chest-fly',
    equipment: 'cable',
    datasetId: 'Cable_Crossover',
  },
  {
    name: 'Pec Deck',
    movement: 'chest-fly',
    equipment: 'machine',
    datasetId: 'Butterfly',
  },
  {
    name: 'Chest Dip',
    movement: 'dip',
    equipment: 'bodyweight',
    datasetId: 'Dips_-_Chest_Version',
  },
  // shoulders
  {
    name: 'Overhead Press',
    movement: 'overhead-press',
    equipment: 'barbell',
    datasetId: 'Standing_Military_Press',
  },
  {
    name: 'Dumbbell Shoulder Press',
    movement: 'overhead-press',
    equipment: 'dumbbell',
    datasetId: 'Dumbbell_Shoulder_Press',
  },
  {
    name: 'Machine Shoulder Press',
    movement: 'overhead-press',
    equipment: 'machine',
    datasetId: 'Machine_Shoulder_Military_Press',
  },
  {
    name: 'Dumbbell Lateral Raise',
    movement: 'lateral-raise',
    equipment: 'dumbbell',
    datasetId: 'Side_Lateral_Raise',
  },
  {
    name: 'Seated Rear Delt Raise',
    movement: 'rear-delt-fly',
    equipment: 'dumbbell',
    datasetId: 'Seated_Bent-Over_Rear_Delt_Raise',
  },
  {
    name: 'Face Pull',
    movement: 'face-pull',
    equipment: 'cable',
    datasetId: 'Face_Pull',
  },
  // back
  {
    name: 'Pull-Up',
    movement: 'vertical-pull',
    equipment: 'bodyweight',
    datasetId: 'Pullups',
  },
  {
    name: 'Chin-Up',
    movement: 'vertical-pull',
    equipment: 'bodyweight',
    variation: 'supinated',
    datasetId: 'Chin-Up',
  },
  {
    name: 'Lat Pulldown',
    movement: 'vertical-pull',
    equipment: 'cable',
    datasetId: 'Wide-Grip_Lat_Pulldown',
  },
  {
    name: 'Barbell Row',
    movement: 'horizontal-row',
    equipment: 'barbell',
    datasetId: 'Bent_Over_Barbell_Row',
  },
  {
    name: 'One-Arm Dumbbell Row',
    movement: 'horizontal-row',
    equipment: 'dumbbell',
    datasetId: 'One-Arm_Dumbbell_Row',
  },
  {
    name: 'Seated Cable Row',
    movement: 'horizontal-row',
    equipment: 'cable',
    datasetId: 'Seated_Cable_Rows',
  },
  {
    name: 'Barbell Shrug',
    movement: 'shrug',
    equipment: 'barbell',
    datasetId: 'Barbell_Shrug',
  },
  {
    name: 'Dumbbell Shrug',
    movement: 'shrug',
    equipment: 'dumbbell',
    datasetId: 'Dumbbell_Shrug',
  },
  {
    name: 'Back Extension',
    movement: 'back-extension',
    equipment: 'bodyweight',
    datasetId: 'Hyperextensions_Back_Extensions',
  },
  // arms
  {
    name: 'Barbell Curl',
    movement: 'biceps-curl',
    equipment: 'barbell',
    datasetId: 'Barbell_Curl',
  },
  {
    name: 'Dumbbell Curl',
    movement: 'biceps-curl',
    equipment: 'dumbbell',
    datasetId: 'Dumbbell_Bicep_Curl',
  },
  {
    name: 'Hammer Curl',
    movement: 'biceps-curl',
    equipment: 'dumbbell',
    variation: 'hammer',
    datasetId: 'Hammer_Curls',
  },
  {
    name: 'Triceps Pushdown',
    movement: 'triceps-extension',
    equipment: 'cable',
    datasetId: 'Triceps_Pushdown',
  },
  {
    name: 'Skull Crusher',
    movement: 'triceps-extension',
    equipment: 'barbell',
    datasetId: 'Lying_Triceps_Press',
  },
  {
    name: 'Overhead Dumbbell Extension',
    movement: 'triceps-extension',
    equipment: 'dumbbell',
    datasetId: 'Standing_Dumbbell_Triceps_Extension',
  },
  // core
  {
    name: 'Crunch',
    movement: 'crunch',
    equipment: 'bodyweight',
    datasetId: 'Crunches',
  },
  {
    name: 'Cable Crunch',
    movement: 'crunch',
    equipment: 'cable',
    datasetId: 'Cable_Crunch',
  },
  {
    name: 'Hanging Leg Raise',
    movement: 'leg-raise',
    equipment: 'bodyweight',
    datasetId: 'Hanging_Leg_Raise',
  },
  {
    name: 'Plank',
    movement: 'plank',
    equipment: 'bodyweight',
    datasetId: 'Plank',
  },
  {
    name: 'Russian Twist',
    movement: 'russian-twist',
    equipment: 'bodyweight',
    datasetId: 'Russian_Twist',
  },
]
