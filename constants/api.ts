export const API_CONFIG = {
  BASE_URL: 'https://sih-backend-881i.onrender.com',
  TIMEOUT_MS: 15000,
  ENDPOINTS: {
    ENCODE: '/encode/',
    CASE_SAVE: '/case_save/',
  },
  GEMINI: {
    MODEL: 'gemini-2.0-flash-exp',
    TRANSCRIPTION_TIMEOUT_MS: 30000,
  },
} as const;
