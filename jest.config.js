module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  collectCoverageFrom: [
    'store/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    '!store/**/*.test.{ts,tsx}',
    '!services/**/*.test.{ts,tsx}',
    '!store/index.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(expo-constants|expo-modules-core|@supabase)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
