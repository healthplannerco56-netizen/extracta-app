export const DEFAULT_EXTRACTION_FIELDS = [
  {
    name: 'sample_size',
    label: 'Sample Size',
    type: 'number' as const,
    required: true,
    prompt: 'What is the total sample size (N) of the study?',
  },
  {
    name: 'mean_age',
    label: 'Mean Age',
    type: 'number' as const,
    required: false,
    prompt: 'What is the mean age of participants?',
  },
  {
    name: 'effect_size',
    label: 'Effect Size (d / g)',
    type: 'number' as const,
    required: true,
    prompt:
      'What is the reported effect size (Cohen\'s d or Hedges\' g)? Include the value and type.',
  },
  {
    name: 'effect_direction',
    label: 'Effect Direction',
    type: 'select' as const,
    options: ['Positive', 'Negative', 'Null'],
    required: true,
    prompt:
      'Is the main effect positive (experimental > control), negative (control > experimental), or null (no significant difference)?',
  },
  {
    name: 'p_value',
    label: 'p-value',
    type: 'text' as const,
    required: true,
    prompt:
      'What is the reported p-value for the main analysis? Report exact value if given (e.g., p = .003), or range (e.g., p < .05).',
  },
  {
    name: 'design',
    label: 'Study Design',
    type: 'select' as const,
    options: ['RCT', 'Quasi-experimental', 'Correlational', 'Qualitative', 'Mixed-methods', 'Other'],
    required: true,
    prompt: 'What is the study design?',
  },
  {
    name: 'population',
    label: 'Population',
    type: 'text' as const,
    required: false,
    prompt:
      'Describe the participant population briefly (e.g., "undergraduate students", "clinical adults with anxiety").',
  },
  {
    name: 'measures',
    label: 'Key Measures',
    type: 'text' as const,
    required: false,
    prompt:
      'List the key outcome measures or instruments used in the study.',
  },
]

export const FREE_MONTHLY_LIMIT = 10
export const FREE_PDFS_PER_RUN = 3
export const PRO_PDFS_PER_RUN = 20
