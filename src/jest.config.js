// jest.config.js
export default {
    // Test environment
    testEnvironment: 'node',
   
    // Test file patterns
    testMatch: [
      '**/tests/**/*.test.js',
      '**/tests/**/*.spec.js'
    ],
   
    // Coverage settings
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/config/*.js',
      '!src/scripts/*.js'
    ],
   
    // Module file extensions
    moduleFileExtensions: ['js', 'json'],
   
    // Transform settings
    transform: {},
    
    // ESM Support
    extensionsToTreatAsEsm: ['.js'],
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1'
    },
   
    // Setup files
    setupFilesAfterEnv: ['./tests/setup.js'],
   
    // Test timeout
    testTimeout: 30000,
   
    // Verbose output
    verbose: true,
   
    // Clear mocks between tests
    clearMocks: true,
   
    // Fail tests on any console.error calls
    silent: false,
   
    // Test paths to ignore
    testPathIgnorePatterns: [
      '/node_modules/',
      '/dist/'
    ],
   
    // Coverage thresholds
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
   
    // Global variables available in tests
    globals: {
      'NODE_ENV': 'test'
    },
   
    // Automatically clear mock calls and instances between tests
    resetMocks: true,
   
    // Indicates whether each individual test should be reported during the run
    reporters: [
      'default',
      [
        'jest-junit',
        {
          outputDirectory: 'reports/junit',
          outputName: 'jest-junit.xml',
          classNameTemplate: '{classname}',
          titleTemplate: '{title}',
          ancestorSeparator: ' › ',
          usePathForSuiteName: true
        }
      ]
    ]
   };