import { describe, it, expect } from 'vitest';
import { ConfigParser } from '../../src/config/ConfigParser.js';

const VALID_CONFIG = JSON.stringify({
  name: 'test-experiment',
  task: { prompt: 'Generate a function', inputFiles: [], evaluator: 'test-pass-rate' },
  models: ['gpt-4o', 'gpt-4o-mini'],
  repetitions: 3,
});

describe('Config', () => {
  it('should parse valid experiment config', () => {
    const parser = new ConfigParser();
    const config = parser.parse(VALID_CONFIG);
    expect(config.name).toBe('test-experiment');
    expect(config.models).toEqual(['gpt-4o', 'gpt-4o-mini']);
    expect(config.repetitions).toBe(3);
    expect(config.task.prompt).toBe('Generate a function');
  });

  it('should reject config missing required fields', () => {
    const parser = new ConfigParser();
    // Missing task
    expect(() => parser.parse(JSON.stringify({ models: ['gpt-4o'], repetitions: 1 }))).toThrow('task');
    // Missing models
    expect(() => parser.parse(JSON.stringify({
      task: { prompt: 'test', inputFiles: [], evaluator: 'test-pass-rate' },
      repetitions: 1,
    }))).toThrow('models');
    // Missing repetitions
    expect(() => parser.parse(JSON.stringify({
      task: { prompt: 'test', inputFiles: [], evaluator: 'test-pass-rate' },
      models: ['gpt-4o'],
    }))).toThrow('repetitions');
  });

  it('should validate model names against SDK catalog', () => {
    const parser = new ConfigParser();
    const badConfig = JSON.stringify({
      name: 'bad',
      task: { prompt: 'test', inputFiles: [], evaluator: 'test-pass-rate' },
      models: ['nonexistent-model-xyz'],
      repetitions: 1,
    });
    expect(() => parser.parse(badConfig)).toThrow('Unknown model');
  });

  it('should validate repetitions is positive integer', () => {
    const parser = new ConfigParser();
    const makeConfig = (reps: number) => JSON.stringify({
      name: 'test',
      task: { prompt: 'test', inputFiles: [], evaluator: 'test-pass-rate' },
      models: ['gpt-4o'],
      repetitions: reps,
    });
    expect(() => parser.parse(makeConfig(0))).toThrow('positive integer');
    expect(() => parser.parse(makeConfig(-1))).toThrow('positive integer');
    expect(() => parser.parse(makeConfig(1.5))).toThrow('positive integer');
  });
});
