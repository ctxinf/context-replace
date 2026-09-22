import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { applyReplace, type ReplaceRule, restoreDefaultRules, DEFAULT_RULES } from './replace';

function expectedSpan(ruleId: number, content: string): string {
  const hue = (ruleId * 49) % 360;
  const bgColor = `hsl(${hue}, 85%, 95%)`;
  const borderColor = `hsl(${hue}, 70%, 70%)`;
  return `<span style="background-color: ${bgColor}; color: #000; border: 1px solid ${borderColor}; border-radius: 4px; padding: 2px 4px; margin: 0 1px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-weight: 500;">${content}</span>`;
}

describe('applyReplace', () => {
  it('should replace fixed string with highlighting', () => {
    const rules: ReplaceRule[] = [
      { id: 1, match: { type: 'fixed', value: 'hello' }, target: { type: 'fixed', value: 'hi' } }
    ];
    const input = 'hello world';
    const result = applyReplace(input, rules);
    expect(result.result).toBe(`${expectedSpan(1, 'hi')} world`);
  });

  it('should replace regex with highlighting', () => {
    const rules: ReplaceRule[] = [
      { id: 2, match: { type: 'regex', value: '\\b\\w+\\b' }, target: { type: 'fixed', value: 'word' } }
    ];
    const input = 'hello world';
    const result = applyReplace(input, rules);
    expect(result.result).toBe(`${expectedSpan(2, 'word')} ${expectedSpan(2, 'word')}`);
  });

  it('should handle multiple rules', () => {
    const rules: ReplaceRule[] = [
      { id: 1, match: { type: 'fixed', value: 'a' }, target: { type: 'fixed', value: 'A' } },
      { id: 2, match: { type: 'fixed', value: 'b' }, target: { type: 'fixed', value: 'B' } }
    ];
    const input = 'abc';
    const result = applyReplace(input, rules);
    expect(result.result).toBe(`${expectedSpan(1, 'A')}${expectedSpan(2, 'B')}c`);
  });

  it('should escape HTML in target', () => {
    const rules: ReplaceRule[] = [
      { id: 1, match: { type: 'fixed', value: 'test' }, target: { type: 'fixed', value: '<script>' } }
    ];
    const input = 'test';
    const result = applyReplace(input, rules);
    expect(result.result).toBe(expectedSpan(1, '&lt;script&gt;'));
  });

  it('should handle no matches', () => {
    const rules: ReplaceRule[] = [
      { id: 1, match: { type: 'fixed', value: 'xyz' }, target: { type: 'fixed', value: 'abc' } }
    ];
    const input = 'hello';
    const result = applyReplace(input, rules);
    expect(result.result).toBe('hello');
  });

  it('should replace multiple occurrences', () => {
    const rules: ReplaceRule[] = [
      { id: 1, match: { type: 'fixed', value: 'a' }, target: { type: 'fixed', value: 'A' } }
    ];
    const input = 'a b a';
    const result = applyReplace(input, rules);
    expect(result.result).toBe(`${expectedSpan(1, 'A')} b ${expectedSpan(1, 'A')}`);
  });
});

describe('applyReplace - complex scenarios', () => {
  it('should handle code replacement with multiple variable names', () => {
    const rules: ReplaceRule[] = [
      { id: 1, match: { type: 'fixed', value: 'var' }, target: { type: 'fixed', value: 'let' } },
      { id: 2, match: { type: 'fixed', value: 'let' }, target: { type: 'fixed', value: 'const' } },
      { id: 3, match: { type: 'fixed', value: 'react' }, target: { type: 'fixed', value: 'vue' } },
      { id: 4, match: { type: 'regex', value: '\\bfunction\\b' }, target: { type: 'fixed', value: 'arrow' } }
    ];
    const input = `
var x = 5;
let y = 10;
function foo() {
  var z = x + y;
  return react.component;
}
var react = require('react');
    `;
    const result = applyReplace(input, rules);
    expect(result.result).toContain(expectedSpan(1, 'let')); // var -> let
    expect(result.result).toContain(expectedSpan(2, 'const')); // let -> const
    expect(result.result).toContain(expectedSpan(3, 'vue')); // react -> vue
    expect(result.result).toContain(expectedSpan(4, 'arrow')); // function -> arrow
  });

  it('should handle path name replacements in code', () => {
    const rules: ReplaceRule[] = [
      { id: 5, match: { type: 'regex', value: '/src/' }, target: { type: 'fixed', value: '/dist/' } },
      { id: 6, match: { type: 'regex', value: '\\.js' }, target: { type: 'fixed', value: '.ts' } }
    ];
    const input = 'import from /src/utils.js; const file = "/src/index.js";';
    const result = applyReplace(input, rules);
    expect(result.result).toContain(expectedSpan(5, '/dist/'));
    expect(result.result).toContain(expectedSpan(6, '.ts'));
  });

  it('should handle Chinese text with multiple repeated replacements', () => {
    const rules: ReplaceRule[] = [
      { id: 7, match: { type: 'fixed', value: '你好' }, target: { type: 'fixed', value: '您好' } },
      { id: 8, match: { type: 'fixed', value: '世界' }, target: { type: 'fixed', value: '地球' } },
      { id: 9, match: { type: 'regex', value: '的' }, target: { type: 'fixed', value: '之' } }
    ];
    const input = '你好，世界！这是我的世界的你好。世界很大，的的的。';
    const result = applyReplace(input, rules);
    expect(result.result).toContain(expectedSpan(7, '您好'));
    expect(result.result).toContain(expectedSpan(8, '地球'));
    expect(result.result).toContain(expectedSpan(9, '之'));
    // Count occurrences
    const countNihao = (result.result.match(/您好/g) || []).length;
    const countWorld = (result.result.match(/地球/g) || []).length;
    const countDe = (result.result.match(/之/g) || []).length;
    expect(countNihao).toBe(2); // 你好 appears twice
    expect(countWorld).toBe(3); // 世界 appears three times
    expect(countDe).toBe(5); // 的 appears five times
  });

  describe('restoreDefaultRules', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should restore default rules when no rules exist', () => {
      const rules = restoreDefaultRules();
      expect(rules).toHaveLength(DEFAULT_RULES.length);
      expect(rules).toEqual(DEFAULT_RULES);
    });

    it('should update existing default rules and keep custom rules', () => {
      const customRules: ReplaceRule[] = [
        { id: 11, match: { type: 'fixed', value: 'custom' }, target: { type: 'fixed', value: 'modified' } },
        { id: 12, match: { type: 'fixed', value: 'another' }, target: { type: 'fixed', value: 'rule' } }
      ];

      const existingRules: ReplaceRule[] = [
        { id: 1, match: { type: 'fixed', value: 'old' }, target: { type: 'fixed', value: 'value' } },
        { id: 11, match: { type: 'fixed', value: 'custom' }, target: { type: 'fixed', value: 'modified' } },
        { id: 2, match: { type: 'fixed', value: 'existing' }, target: { type: 'fixed', value: 'default' } }
      ];

      localStorage.setItem('replace-count', existingRules.length.toString());
      existingRules.forEach((rule, index) => {
        localStorage.setItem(`replace-rules-${index + 1}`, JSON.stringify(rule));
      });

      const rules = restoreDefaultRules();

      expect(rules).toHaveLength(DEFAULT_RULES.length + 1);

      DEFAULT_RULES.forEach(defaultRule => {
        const found = rules.find(r => r.id === defaultRule.id);
        expect(found).toEqual(defaultRule);
      });

      const customRule = rules.find(r => r.id === 11);
      expect(customRule).toEqual(customRules[0]);

      const missingCustom = rules.find(r => r.id === 12);
      expect(missingCustom).toBeUndefined();
    });
  });

  it('should handle long text with many replacements', () => {
    const rules: ReplaceRule[] = [
      { id: 12, match: { type: 'regex', value: '\\bthe\\b' }, target: { type: 'fixed', value: 'THE' } }
    ];
    const input = 'The quick brown fox jumps over the lazy dog. The dog is lazy, and the fox is quick. The the the.';
    const result = applyReplace(input, rules);
    const count = (result.result.match(/THE/g) || []).length;
    expect(count).toBe(4);
  });
});