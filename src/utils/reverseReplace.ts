import type { ReplaceRule, ReplaceResult } from "./replace";
import { applyReplace } from "./replace";

/**
 * 表示反向替换规则构建时的单项冲突信息（配置中多对一情况）
 */
export interface ReverseConflictInfo {
  /** 发生冲突的目标值（原规则的 targetValue，反向替换时的匹配键） */
  targetValue: string;
  /** 保留的首项规则 ID */
  keptRuleId: number;
  /** 保留的首项规则原始匹配值（反向替换后的目标值） */
  keptMatchValue: string;
  /** 被忽略/跳过的后续冲突规则列表 */
  conflictingRules: {
    ruleId: number;
    matchValue: string;
  }[];
}

/**
 * 构建反向替换规则的返回结果
 */
export interface ReverseRulesResult {
  /** 可用于执行反向替换的规则列表（遇到冲突时已保留首项） */
  rules: ReplaceRule[];
  /** 检测到的所有多对一冲突列表 */
  conflicts: ReverseConflictInfo[];
}

/**
 * 支持的规则输入类型（兼容 store 中的扁平规则对象和 ReplaceRule 嵌套对象）
 */
export type AnyRuleInput =
  | {
      id: number;
      matchType: "fixed" | "regex";
      matchValue: string;
      targetValue: string;
      note?: string;
    }
  | ReplaceRule;

/**
 * 根据配置规则生成反向替换规则
 *
 * 核心逻辑：
 * 1. 遍历正向规则列表；
 * 2. 提取正向规则的 target 与 match：
 *    - 反向规则的匹配值 (match) = 原规则的目标值 (targetValue)
 *    - 反向规则的匹配类型 (matchType) = 'fixed'（因为原目标值均为固定字符串）
 *    - 反向规则的目标值 (target) = 原规则的匹配值 (matchValue)
 * 3. 冲突处理（多对一冲突）：
 *    - 若多个正向规则的目标值相同，反向时会产生歧义；
 *    - 严格遵循：保留首次出现的项作为替换结果，忽略后续冲突项；
 *    - 收集冲突详情，便于触发 warn toast 提示用户。
 *
 * @param rules 正向规则列表
 * @returns ReverseRulesResult 反向规则列表及冲突详情
 */
export function buildReverseRules(rules: AnyRuleInput[]): ReverseRulesResult {
  const reversedRules: ReplaceRule[] = [];
  const conflicts: ReverseConflictInfo[] = [];
  // 记录每个 targetValue 对应的首个规则及其反向规则
  const seenTargets = new Map<string, ReplaceRule>();

  for (const rule of rules) {
    // 统一提取 targetValue 和 matchValue
    const targetValue =
      "targetValue" in rule ? rule.targetValue : rule.target.value;
    const matchValue =
      "matchValue" in rule ? rule.matchValue : rule.match.value;

    // 若 targetValue 为空字符串，无法在反向时作为有效匹配项，跳过
    if (!targetValue || !targetValue.trim()) {
      continue;
    }

    if (seenTargets.has(targetValue)) {
      // 发生多对一冲突：之前已经存在以该 targetValue 为目标的规则
      const keptRule = seenTargets.get(targetValue)!;
      let conflict = conflicts.find((c) => c.targetValue === targetValue);

      if (!conflict) {
        conflict = {
          targetValue,
          keptRuleId: keptRule.id,
          keptMatchValue: keptRule.target.value,
          conflictingRules: [],
        };
        conflicts.push(conflict);
      }

      conflict.conflictingRules.push({
        ruleId: rule.id,
        matchValue,
      });
      // 冲突项不加入 reversedRules，保留首个项
    } else {
      // 首次出现：创建反向替换规则
      const reverseRule: ReplaceRule = {
        id: rule.id,
        match: {
          type: "fixed", // 反向匹配一定是针对目标字符串的字面匹配
          value: targetValue,
        },
        target: {
          type: "fixed",
          value: matchValue,
        },
      };

      seenTargets.set(targetValue, reverseRule);
      reversedRules.push(reverseRule);
    }
  }

  return { rules: reversedRules, conflicts };
}

/**
 * 反向替换执行结果
 */
export interface ReverseReplaceResult extends ReplaceResult {
  /** 多对一冲突信息列表 */
  conflicts: ReverseConflictInfo[];
}

/**
 * 执行反向替换
 *
 * 接收输入文本和配置规则列表，生成反向规则并调用 applyReplace 执行替换。
 * 只有在替换过程中实际命中了多对一冲突项时，才在返回值中返回冲突信息，避免未命中的配置冲突造成误报。
 *
 * @param input 待恢复/反向替换的文本
 * @param rules 配置的正向规则列表
 * @returns ReverseReplaceResult 替换结果与实际命中的冲突信息
 */
export function applyReverseReplace(
  input: string,
  rules: AnyRuleInput[],
): ReverseReplaceResult {
  const { rules: reverseRules, conflicts } = buildReverseRules(rules);
  const replaceResult = applyReplace(input, reverseRules);

  // 关键：仅过滤出在替换历史中实际被匹配并替换的冲突项
  const hitConflicts = conflicts.filter((conflict) =>
    replaceResult.history.some((h) => h.originalMatch === conflict.targetValue),
  );

  return {
    ...replaceResult,
    conflicts: hitConflicts,
  };
}
