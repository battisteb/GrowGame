// Jest setup for GrowGame tests

// Silence console.log in tests but keep warnings and errors
global.console = {
  ...console,
  log: jest.fn(),
};
