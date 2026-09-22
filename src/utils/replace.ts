export interface ReplaceRule {
  id: number;
  match: {
    type: 'regex' | 'fixed';
    value: string;
  };
  target: {
    type: 'fixed';
    value: string;
  };
}

export interface ReplaceResult {
  result: string;
  history: ReplaceHistoryEntry[];
}

export interface ReplaceHistoryEntry {
  originalMatch: string;
  originalMatchType: 'fixed' | 'regex';
  replacedWith: string;
  replacedWithType: 'fixed';
  ruleId: number;
}

export function applyReplace(input: string, rules: ReplaceRule[]): ReplaceResult {
  console.log(`Starting replace process with input: "${input}"`);
  console.log(`Number of rules: ${rules.length}`);
  // Escape HTML in input to display as code
  let result = escapeHtml(input);
  const placeholders: { id: string; target: string; ruleId: number; originalMatch: string; originalMatchType: 'fixed' | 'regex' }[] = [];
  const history: ReplaceHistoryEntry[] = [];

  rules.forEach((rule, index) => {
    const { match, target } = rule;
    console.log(`Processing rule ${rule.id}: match "${match.value}" (${match.type}) -> target "${target.value}"`);
    let regex: RegExp;
    if (match.type === 'regex') {
      regex = new RegExp(match.value, 'g');
    } else {
      // For fixed matches, also escape to match in escaped input
      regex = new RegExp(escapeRegExp(escapeHtml(match.value)), 'g');
    }
    console.log(`Generated regex: ${regex}`);
    // 使用占位符先替换
    const placeholder = `__REPLACE_${index}__`;
    let matchCount = 0;
    result = result.replace(regex, (matchStr) => {
      matchCount++;
      const uniqueId = `${placeholder}_${placeholders.length}`;
      console.log(`Match ${matchCount} for rule ${rule.id}: "${matchStr}" -> placeholder "${uniqueId}"`);
      placeholders.push({
        id: uniqueId,
        target: escapeHtml(target.value),
        ruleId: rule.id,
        originalMatch: unescapeHtml(matchStr),
        originalMatchType: match.type
      });
      return uniqueId;
    });
    console.log(`Rule ${rule.id} processed, matches found: ${matchCount}`);
  });

  // 收集历史记录
  console.log(`Collecting history from ${placeholders.length} placeholders`);
  placeholders.forEach(({ originalMatch, originalMatchType, target, ruleId }) => {
    console.log(`History entry: "${originalMatch}" (${originalMatchType}) -> "${unescapeHtml(target)}" (rule ${ruleId})`);
    history.push({
      originalMatch,
      originalMatchType,
      replacedWith: unescapeHtml(target),
      replacedWithType: 'fixed',
      ruleId
    });
  });

   // 现在替换占位符为高亮HTML
   console.log(`Replacing ${placeholders.length} placeholders with highlighted HTML`);
   placeholders.forEach(({ id, target, ruleId }) => {
     const hue = (ruleId * 49) % 360;
     const bgColor = `hsl(${hue}, 85%, 95%)`;
     const borderColor = `hsl(${hue}, 70%, 70%)`;
      const highlighted = `<span style="background-color: ${bgColor}; color: #000; border: 1px solid ${borderColor}; border-radius: 4px; padding: 2px 4px; margin: 0 1px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-weight: 500;">${target}</span>`;
     console.log(`Replacing placeholder "${id}" with highlighted HTML for rule ${ruleId}: "${target}"`);
     result = result.replace(new RegExp(escapeRegExp(id), 'g'), highlighted);
   });

  console.log(`Replace process completed. Final result length: ${result.length}, history entries: ${history.length}`);
  return { result, history };
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function unescapeHtml(safe: string): string {
  return safe
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

// Default rules for testing
export const DEFAULT_RULES: ReplaceRule[] = [
  { id: 1, match: { type: 'fixed', value: 'hello' }, target: { type: 'fixed', value: 'hi' } },
  { id: 2, match: { type: 'regex', value: '\\bworld\\b' }, target: { type: 'fixed', value: 'earth' } },
  { id: 3, match: { type: 'fixed', value: 'test' }, target: { type: 'fixed', value: 'example' } },
  { id: 4, match: { type: 'regex', value: '\\bvar\\b' }, target: { type: 'fixed', value: 'let' } },
  { id: 5, match: { type: 'regex', value: '\\blet\\b' }, target: { type: 'fixed', value: 'const' } },
  { id: 6, match: { type: 'regex', value: '/src/' }, target: { type: 'fixed', value: '/dist/' } },
  { id: 7, match: { type: 'regex', value: '\\.js$' }, target: { type: 'fixed', value: '.ts' } },
  { id: 8, match: { type: 'fixed', value: '你好' }, target: { type: 'fixed', value: '您好' } },
  { id: 9, match: { type: 'fixed', value: '世界' }, target: { type: 'fixed', value: '地球' } },
  { id: 10, match: { type: 'regex', value: '的' }, target: { type: 'fixed', value: '之' } }
];

// localStorage utilities
const STORAGE_PREFIX = 'replace-';

export function loadRules(): ReplaceRule[] {
  const count = parseInt(localStorage.getItem(`${STORAGE_PREFIX}count`) || '0');
  const rules: ReplaceRule[] = [];
  for (let i = 1; i <= count; i++) {
    const ruleJson = localStorage.getItem(`${STORAGE_PREFIX}rules-${i}`);
    if (ruleJson) {
      try {
        rules.push(JSON.parse(ruleJson));
      } catch (e) {
        console.warn(`Failed to parse rule ${i}:`, e);
      }
    }
  }
  return rules;
}

export function saveRules(rules: ReplaceRule[]): void {
  // Clear old rules
  const oldCount = parseInt(localStorage.getItem(`${STORAGE_PREFIX}count`) || '0');
  for (let i = 1; i <= oldCount; i++) {
    localStorage.removeItem(`${STORAGE_PREFIX}rules-${i}`);
  }

  // Save new rules
  localStorage.setItem(`${STORAGE_PREFIX}count`, rules.length.toString());
  rules.forEach((rule, index) => {
    localStorage.setItem(`${STORAGE_PREFIX}rules-${index + 1}`, JSON.stringify(rule));
  });
}

export function getNextRuleId(): number {
  const rules = loadRules();
  return rules.length > 0 ? Math.max(...rules.map(r => r.id)) + 1 : 1;
}

export function restoreDefaultRules(): ReplaceRule[] {
  const currentRules = loadRules();
  const updatedRules = [...currentRules];

  DEFAULT_RULES.forEach(defaultRule => {
    const existingIndex = updatedRules.findIndex(r => r.id === defaultRule.id);
    if (existingIndex >= 0) {
      // Update existing default rule
      updatedRules[existingIndex] = { ...defaultRule };
    } else {
      // Add missing default rule
      updatedRules.push({ ...defaultRule });
    }
  });

  saveRules(updatedRules);
  return updatedRules;
}

