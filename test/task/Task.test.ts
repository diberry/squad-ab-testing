import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import { TaskBuilder } from '../../src/task/TaskBuilder.js';

describe('Task', () => {
  it('should create task from config', () => {
    const builder = new TaskBuilder('/base');
    const task = builder.build('Generate code', ['file1.ts'], 'test-pass-rate');
    expect(task.prompt).toBe('Generate code');
    expect(task.evaluator).toBe('test-pass-rate');
    expect(task.inputFiles).toHaveLength(1);
  });

  it('should resolve relative file paths', () => {
    const builder = new TaskBuilder('/project/root');
    const task = builder.build('test', ['src/main.ts', 'lib/util.ts'], 'test-pass-rate');
    for (const f of task.inputFiles) {
      expect(path.isAbsolute(f)).toBe(true);
    }
    expect(task.inputFiles[0]).toContain('src');
    expect(task.inputFiles[1]).toContain('lib');
  });

  it('should require evaluator type to be recognized', () => {
    const builder = new TaskBuilder('/base');
    expect(() => builder.build('test', [], 'unknown-evaluator')).toThrow('Unknown evaluator');
  });
});
