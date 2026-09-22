import { describe, it, expect } from "vitest";
import {
  buildReverseRules,
  applyReverseReplace,
  type AnyRuleInput,
} from "./reverseReplace";
import type { ReplaceRule } from "./replace";

describe("buildReverseRules", () => {
  it("should reverse simple fixed rules correctly", () => {
    const rules: ReplaceRule[] = [
      {
        id: 1,
        match: { type: "fixed", value: "hello" },
        target: { type: "fixed", value: "hi" },
      },
      {
        id: 2,
        match: { type: "fixed", value: "world" },
        target: { type: "fixed", value: "earth" },
      },
    ];

    const { rules: reversed, conflicts } = buildReverseRules(rules);

    expect(conflicts).toHaveLength(0);
    expect(reversed).toHaveLength(2);
    expect(reversed[0]).toEqual({
      id: 1,
      match: { type: "fixed", value: "hi" },
      target: { type: "fixed", value: "hello" },
    });
    expect(reversed[1]).toEqual({
      id: 2,
      match: { type: "fixed", value: "earth" },
      target: { type: "fixed", value: "world" },
    });
  });

  it("should handle flat store rule objects", () => {
    const rules: AnyRuleInput[] = [
      {
        id: 10,
        matchType: "fixed",
        matchValue: "foo",
        targetValue: "bar",
        note: "sample note",
      },
    ];

    const { rules: reversed, conflicts } = buildReverseRules(rules);

    expect(conflicts).toHaveLength(0);
    expect(reversed).toHaveLength(1);
    expect(reversed[0]).toEqual({
      id: 10,
      match: { type: "fixed", value: "bar" },
      target: { type: "fixed", value: "foo" },
    });
  });

  it("should reverse regex rules as fixed match on targetValue", () => {
    const rules: ReplaceRule[] = [
      {
        id: 3,
        match: { type: "regex", value: "\\d{3}-\\d{2}-\\d{4}" },
        target: { type: "fixed", value: "***-**-****" },
      },
    ];

    const { rules: reversed, conflicts } = buildReverseRules(rules);

    expect(conflicts).toHaveLength(0);
    expect(reversed).toHaveLength(1);
    expect(reversed[0]).toEqual({
      id: 3,
      match: { type: "fixed", value: "***-**-****" },
      target: { type: "fixed", value: "\\d{3}-\\d{2}-\\d{4}" },
    });
  });

  it("should detect many-to-one conflicts and keep only the first rule", () => {
    const rules: AnyRuleInput[] = [
      {
        id: 1,
        matchType: "fixed",
        matchValue: "Alice",
        targetValue: "PERSON",
      },
      {
        id: 2,
        matchType: "fixed",
        matchValue: "Bob",
        targetValue: "PERSON",
      },
      {
        id: 3,
        matchType: "fixed",
        matchValue: "Charlie",
        targetValue: "PERSON",
      },
      {
        id: 4,
        matchType: "fixed",
        matchValue: "Paris",
        targetValue: "CITY",
      },
    ];

    const { rules: reversed, conflicts } = buildReverseRules(rules);

    // Only 2 reversed rules: 1 for PERSON (Alice) and 1 for CITY (Paris)
    expect(reversed).toHaveLength(2);
    expect(reversed[0]).toEqual({
      id: 1,
      match: { type: "fixed", value: "PERSON" },
      target: { type: "fixed", value: "Alice" },
    });
    expect(reversed[1]).toEqual({
      id: 4,
      match: { type: "fixed", value: "CITY" },
      target: { type: "fixed", value: "Paris" },
    });

    // Exactly 1 conflict group for "PERSON" with 2 conflicting rules
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.targetValue).toBe("PERSON");
    expect(conflicts[0]!.keptRuleId).toBe(1);
    expect(conflicts[0]!.keptMatchValue).toBe("Alice");
    expect(conflicts[0]!.conflictingRules).toEqual([
      { ruleId: 2, matchValue: "Bob" },
      { ruleId: 3, matchValue: "Charlie" },
    ]);
  });

  it("should skip rules with empty or whitespace targetValue", () => {
    const rules: AnyRuleInput[] = [
      {
        id: 1,
        matchType: "fixed",
        matchValue: "test",
        targetValue: "",
      },
      {
        id: 2,
        matchType: "fixed",
        matchValue: "test2",
        targetValue: "   ",
      },
      {
        id: 3,
        matchType: "fixed",
        matchValue: "valid",
        targetValue: "ok",
      },
    ];

    const { rules: reversed, conflicts } = buildReverseRules(rules);
    expect(reversed).toHaveLength(1);
    expect(reversed[0]!.id).toBe(3);
    expect(conflicts).toHaveLength(0);
  });
});

describe("applyReverseReplace", () => {
  it("should successfully reverse text according to configuration", () => {
    const rules: AnyRuleInput[] = [
      {
        id: 1,
        matchType: "fixed",
        matchValue: "/home/user13500/",
        targetValue: "/home/samaltman/",
      },
      {
        id: 2,
        matchType: "fixed",
        matchValue: "secret_12345",
        targetValue: "token_abcde",
      },
    ];

    const aiOutput =
      "Check file at /home/samaltman/project.json with token_abcde";
    const result = applyReverseReplace(aiOutput, rules);

    expect(result.conflicts).toHaveLength(0);
    expect(result.history).toHaveLength(2);
    // Result contains original values
    expect(result.result).toContain("/home/user13500/");
    expect(result.result).toContain("secret_12345");
  });

  it("should still replace using first rule and report conflict when many-to-one conflict exists", () => {
    const rules: AnyRuleInput[] = [
      {
        id: 1,
        matchType: "fixed",
        matchValue: "Apple",
        targetValue: "FRUIT",
      },
      {
        id: 2,
        matchType: "fixed",
        matchValue: "Banana",
        targetValue: "FRUIT",
      },
    ];

    const aiOutput = "I like FRUIT very much";
    const result = applyReverseReplace(aiOutput, rules);

    // Conflict reported
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]!.targetValue).toBe("FRUIT");
    expect(result.conflicts[0]!.keptMatchValue).toBe("Apple");

    // Replaced with first item (Apple)
    expect(result.result).toContain("Apple");
    expect(result.result).not.toContain("Banana");
    expect(result.history).toHaveLength(1);
    expect(result.history[0]!.originalMatch).toBe("FRUIT");
    expect(result.history[0]!.replacedWith).toBe("Apple");
  });

  it("should NOT report conflict when conflicting rules exist in config but are not present in input", () => {
    const rules: AnyRuleInput[] = [
      {
        id: 1,
        matchType: "fixed",
        matchValue: "Apple",
        targetValue: "FRUIT",
      },
      {
        id: 2,
        matchType: "fixed",
        matchValue: "Banana",
        targetValue: "FRUIT",
      },
      {
        id: 3,
        matchType: "fixed",
        matchValue: "Tokyo",
        targetValue: "CITY",
      },
    ];

    // Input only contains CITY, not FRUIT
    const aiOutput = "Welcome to CITY!";
    const result = applyReverseReplace(aiOutput, rules);

    expect(result.result).toContain("Tokyo");
    expect(result.history).toHaveLength(1);
    // FRUIT conflict should NOT be reported because it was not hit!
    expect(result.conflicts).toHaveLength(0);
  });

  it("should return input when no target match found", () => {
    const rules: AnyRuleInput[] = [
      {
        id: 1,
        matchType: "fixed",
        matchValue: "hello",
        targetValue: "world",
      },
    ];

    const input = "nothing matches here";
    const result = applyReverseReplace(input, rules);

    expect(result.result).toBe("nothing matches here");
    expect(result.history).toHaveLength(0);
    expect(result.conflicts).toHaveLength(0);
  });
});
