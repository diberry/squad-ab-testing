import { describe, it, expect } from 'vitest';
import { ConfigParser } from '../../src/config/ConfigParser.js';

describe('Config', () => {
  it('should parse valid experiment config', () => {
    // TODO: Test parsing valid config
  });

  it('should reject config missing required fields', () => {
    // TODO: Test missing field validation
  });

  it('should validate model names against SDK catalog', () => {
    // TODO: Test model validation
  });

  it('should validate repetitions is positive integer', () => {
    // TODO: Test repetitions validation
  });
});
