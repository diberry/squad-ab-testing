import { ExperimentConfig } from '../types/ExperimentConfig.js';
import { ConfigValidator } from '../validators/ConfigValidator.js';

const KNOWN_MODELS = [
  'claude-sonnet-4-20250514',
  'claude-haiku-4-20250414',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'o1-preview',
  'o1-mini',
  'gemini-pro',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
];

export function getKnownModels(): string[] {
  return [...KNOWN_MODELS];
}

export class ConfigParser {
  private validator: ConfigValidator;

  constructor(knownModels?: string[]) {
    this.validator = new ConfigValidator(knownModels ?? KNOWN_MODELS);
  }

  parse(json: string): ExperimentConfig {
    let raw: unknown;
    try {
      raw = JSON.parse(json);
    } catch {
      throw new Error('Invalid JSON');
    }

    const config = raw as ExperimentConfig;
    this.validator.validate(config);
    return config;
  }
}
