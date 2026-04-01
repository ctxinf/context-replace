<template>
  <details
    class="bg-background rounded-lg p-0 mb-0 group border border-border"
    :open="isOpen"
    @toggle="
      (event) => {
        isOpen = (event?.target as any).open;
      }
    "
  >
    <!-- Header: Title & Actions -->
    <summary
      class="list-none flex items-center justify-between cursor-pointer select-none p-1"
    >
      <!-- Left: Arrow + Title -->
      <div
        class="flex items-center gap-2 text-lg font-semibold text-foreground"
      >
        <!-- Custom Triangle Arrow to ensure flex layout works perfectly -->
        <svg
          class="size-6 text-foreground-secondary transition-transform duration-200 transform group-open:rotate-90"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
        {{ t.ruleConfig }}
      </div>

      <!-- Right: Clipboard Actions (Prevent detail toggle with @click.stop) -->
      <div class="flex gap-2" @click.stop v-if="isOpen">
        <button
          @click="importConfig"
          class="flex items-center gap-1 px-2 py-1 text-xs bg-background-secondary border border-border rounded text-foreground-secondary hover:text-blue-600 hover:border-blue-400 hover:bg-background transition"
          :title="t.readClipboardImport"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          {{ t.import }}
        </button>
        <button
          @click="exportConfig"
          class="flex items-center gap-1 px-2 py-1 text-xs bg-background-secondary border border-border rounded text-foreground-secondary hover:text-blue-600 hover:border-blue-400 hover:bg-background transition"
          :title="t.exportConfigClipboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          {{ t.export }}
        </button>
      </div>
    </summary>

    <div class="space-y-2 p-2">
      <!-- 1. Add New Rule (Strict Single Row) -->
      <div class="border border-green-200 rounded p-1 dark:bg-gray-300/30">
        <form @submit.prevent="handleAddRule" class="flex items-center gap-1">
          <!-- Type Select -->
          <select
            v-model="newRule.matchType"
            class="w-16 p-1 text-xs border border-border rounded focus:ring-1 focus:ring-green-500 bg-background"
            :title="t.matchType"
          >
            <option value="fixed">{{ t.text }}</option>
            <option value="regex">{{ t.regex }}</option>
          </select>

          <!-- Match Value (Textarea for resizing) -->
          <div class="flex-1 relative">
            <textarea
              v-model="newRule.matchValue"
              rows="1"
              required
              class="w-full p-1 text-sm border border-border rounded focus:ring-1 focus:ring-green-500 min-h-7.5 resize-y align-middle leading-5"
              :placeholder="t.matchValue"
            ></textarea>
          </div>

          <!-- Arrow Icon -->
          <div class="text-foreground-secondary shrink-0">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              ></path>
            </svg>
          </div>

          <!-- Target Value -->
          <div class="flex-1 relative">
            <textarea
              v-model="newRule.targetValue"
              rows="1"
              class="w-full p-1 text-sm border border-border rounded focus:ring-1 focus:ring-green-500 min-h-7.5 resize-y align-middle leading-5"
              :placeholder="t.replaceWith"
            ></textarea>
          </div>

          <!-- Note -->
          <input
            v-model="newRule.note"
            type="text"
            class="flex-1 min-w-[7ch] p-1 text-xs border border-border rounded focus:ring-1 focus:ring-green-500"
            :placeholder="t.note"
          />

          <!-- Add Button -->
          <button
            type="submit"
            :disabled="isAdding"
            class="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 shrink-0"
            :title="t.addRule"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </form>
      </div>

      <!-- 2. Rules List (Strict Single Row) -->
      <div class="space-y-1">
        <div
          v-if="rulesStore.rules.length === 0"
          class="text-center text-foreground-secondary text-sm py-2"
        >
          {{ t.noRules }}
        </div>

        <div
          v-for="rule in rulesStore.rules as EditableReplaceRule[]"
          :key="rule.id"
          class="group/item bg-background border border-border rounded hover:border-blue-300 transition-colors"
        >
          <!-- View Mode (Single Row) -->
          <div
            v-if="!rule.isEditing"
            class="flex justify-start items-center gap-2 py-0.5 pl-2"
          >
            <!-- Type Badge -->
            <span
              :class="[
                'shrink-0 px-1 rounded text-[10px] font-mono border',
                rule.matchType === 'regex'
                  ? 'bg-badge-reg-bg text-badge-reg-fg border-badge-reg-bg'
                  : 'bg-badge-txt-bg text-badge-txt-fg border-badge-txt-bg',
              ]"
            >
              {{ rule.matchType === "regex" ? "Reg" : "Txt" }}
            </span>

            <!-- Match Content (Truncated) -->
            <div class="flex-1 min-w-0" :title="rule.matchValue">
              <div
                class="truncate text-sm font-mono bg-pink-200/36 dark:bg-pink-300/60 rounded px-1"
              >
                {{ rule.matchValue }}
              </div>
            </div>

            <!-- Arrow -->
            <span class="shrink-0 font-extrabold">→</span>

            <!-- Target Content (Truncated) -->
            <div class="flex-1 min-w-0" :title="rule.targetValue">
              <div
                class="truncate text-sm font-mono bg-green-300/33 dark:bg-green-600/30 rounded px-1"
              >
                {{ rule.targetValue || t.empty }}
              </div>
            </div>

            <!-- Note (Visible if short, truncated if long) -->
            <div
              class="w-32 text-foreground-secondary truncate text-left shrink-0"
              :title="rule.note"
            >
              {{ rule.note }}
            </div>

            <!-- Actions (Show on hover or always visible but subtle) -->
            <div
              class="flex gap-1 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
            >
              <button
                @click="startEdit(rule)"
                class="text-blue-500 hover:text-blue-700 p-0.5"
                :title="t.edit"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  ></path>
                </svg>
              </button>
              <button
                @click="handleDeleteRule(rule.id)"
                class="text-red-500 hover:text-red-700 p-0.5"
                :title="t.delete"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Edit Mode -->
          <form
            v-else
            @submit.prevent="handleUpdateRule(rule)"
            class="flex items-center gap-1 p-1 rounded dark:bg-gray-300/30"
          >
            <select
              v-model="rule.editMatchType"
              class="w-14 p-1 text-xs border border-blue-200 rounded bg-background"
            >
              <option value="fixed">Txt</option>
              <option value="regex">Reg</option>
            </select>
            <textarea
              v-model="rule.editMatchValue"
              rows="1"
              class="flex-1 min-w-0 p-1 text-sm border border-blue-200 rounded min-h-7 resize-y align-middle"
              :placeholder="t.match"
            />
            <span class="text-blue-300">➜</span>
            <textarea
              v-model="rule.editTargetValue"
              rows="1"
              class="flex-1 min-w-0 p-1 text-sm border border-blue-200 rounded min-h-7 resize-y align-middle"
              :placeholder="t.replace"
            />
            <input
              v-model="rule.editNote"
              class="flex-1 min-w-[7ch] p-1 text-xs border border-blue-200 rounded"
              :placeholder="t.note"
            />
            <button
              type="submit"
              class="text-green-600 hover:bg-green-100 rounded p-1"
              :title="t.save"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </button>
            <button
              type="button"
              @click="cancelEdit(rule)"
              class="text-gray-500 hover:bg-gray-200 rounded p-1"
              :title="t.cancel"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useRulesStore, type ReplaceRule } from "../stores/rules";
import { toast } from "vue-sonner";
import { useI18n } from "../composables/useI18n";
interface EditableReplaceRule extends ReplaceRule {
  isEditing?: boolean;
  editNote?: string;
  editMatchType?: "fixed" | "regex";
  editMatchValue?: string;
  editTargetValue?: string;
  isUpdating?: boolean;
}

// 使用 useLocalStorage 持久化规则配置面板的展开/折叠状态到本地存储
const isOpen = useLocalStorage("context-replace-rule-config-open", false);
const rulesStore = useRulesStore();
const isAdding = ref(false);
const { t } = useI18n();

const newRule = reactive({
  note: "",
  matchType: "fixed" as "fixed" | "regex",
  matchValue: "",
  targetValue: "",
});

onMounted(async () => {
  // Database initialization is handled in main.ts, only load rules here
  await rulesStore.loadRules();
  
  const stored = localStorage.getItem("ruleConfigFirstUse");
  if (stored === null) {
    await rulesStore.initializeDefaultRules();
    isOpen.value = true;
    localStorage.setItem("ruleConfigFirstUse", "used");
    // @ts-ignore
    toast(t.configRulesFirst);
  }
});

const handleAddRule = async () => {
  if (!newRule.matchValue.trim()) return;

  isAdding.value = true;
  try {
    await rulesStore.addRule({
      note: newRule.note || undefined,
      matchType: newRule.matchType,
      matchValue: newRule.matchValue,
      targetValue: newRule.targetValue,
    });
    // Reset inputs
    newRule.note = "";
    newRule.matchValue = "";
    newRule.targetValue = "";
  } catch (error) {
    console.error("Failed to add rule:", error);
  } finally {
    isAdding.value = false;
  }
};

const startEdit = (rule: EditableReplaceRule) => {
  rule.isEditing = true;
  rule.editNote = rule.note || "";
  rule.editMatchType = rule.matchType;
  rule.editMatchValue = rule.matchValue;
  rule.editTargetValue = rule.targetValue;
};

const cancelEdit = (rule: EditableReplaceRule) => {
  rule.isEditing = false;
};

const handleUpdateRule = async (rule: EditableReplaceRule) => {
  if (!rule.editMatchValue?.trim()) return;

  rule.isUpdating = true;
  try {
    await rulesStore.updateRule(rule.id, {
      note: rule.editNote || undefined,
      matchType: rule.editMatchType!,
      matchValue: rule.editMatchValue!,
      targetValue: rule.editTargetValue!,
    });
    rule.isEditing = false;
  } finally {
    rule.isUpdating = false;
  }
};

const handleDeleteRule = async (id: number) => {
  await rulesStore.deleteRule(id);
};

// --- Export / Import Logic ---

const exportConfig = async () => {
  const rules = rulesStore.rules;
  if (rules.length === 0) {
    alert("no rules to export.");
    return;
  }

  const config = {
    version: 1,
    rules: rules.map((rule) => ({
      note: rule.note,
      matchType: rule.matchType,
      matchValue: rule.matchValue,
      targetValue: rule.targetValue,
    })),
  };

  const configStr = JSON.stringify(config);
  const url = `context-replace://import/${configStr}`;

  try {
    await navigator.clipboard.writeText(url);
    alert("copied to clipboard suc!");
  } catch (error) {
    console.error("Failed to copy:", error);
    // alert(t.copyFailedManual);
    alert("❌ copy failed!\n" + error);
  }
};

const importConfig = async () => {
  let clipText = "";
  try {
    // Attempt automatic read
    clipText = await navigator.clipboard.readText();
  } catch (e) {
    // Ignore error, fallback to prompt
  }

  // Always show prompt if clipboard is empty or access denied,
  // or confirm the content if read successfully
  if (!clipText) {
    const input = prompt("please input the import config text.");
    if (input) clipText = input;
  } else {
    // Optional: Ask for confirmation if we read automatically to avoid confusion
    // but "One click import" is usually preferred.
    // Checking if it looks like our config
    if (!clipText.includes("context-replace")) {
      // If clipboard content doesn't look like config, prompt user
      const input = prompt("the input text is not a valid config", "");
      if (input) clipText = input;
      else return;
    }
  }

  if (!clipText) return;

  try {
    // 1. Clean format
    const prefix = "context-replace://import/";
    let jsonStr = clipText.trim();
    if (jsonStr.startsWith(prefix)) {
      jsonStr = jsonStr.slice(prefix.length);
    }

    const config = JSON.parse(jsonStr);

    if (!config || !Array.isArray(config.rules)) {
      throw new Error("Invalid format");
    }

    // 3. De-duplication Logic
    const newRules = config.rules;
    const currentRules = rulesStore.rules;

    let addedCount = 0;
    let skippedCount = 0;

    for (const r of newRules) {
      // Comparison: matchType + matchValue + targetValue (Ignore Note)
      const isDuplicate = currentRules.some(
        (existing) =>
          existing.matchType === (r.matchType || "fixed") &&
          existing.matchValue === r.matchValue &&
          existing.targetValue === (r.targetValue || ""),
      );

      if (isDuplicate) {
        skippedCount++;
        continue;
      }

      if (r.matchValue) {
        await rulesStore.addRule({
          note: r.note,
          matchType: r.matchType === "regex" ? "regex" : "fixed",
          matchValue: r.matchValue,
          targetValue: r.targetValue || "",
        });
        addedCount++;
      }
    }

    alert(
      // t.importCompleted(addedCount.toString(), skippedCount.toString()),
      `import from clipboard suc! added: ${addedCount}, skipped: ${skippedCount}`,
    );
  } catch (error) {
    console.error("Import failed:", error);
    alert("import failed " + error);
    // alert(t.importFailedFormat);
  }
};
</script>

<style scoped>
/*
  Fix for Safari/Chrome:
  Ensure summary handles the custom flex layout properly and hides the default marker
*/
summary::-webkit-details-marker {
  display: none;
}
</style>
