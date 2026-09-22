<template>
  <div
    class="min-h-screen font-sans flex flex-col transition-colors duration-500"
    :class="[
      displayedMode === 'restore'
        ? 'bg-violet-950/[0.03] dark:bg-violet-950/[0.18]'
        : 'bg-blue-950/[0.02] dark:bg-blue-950/[0.12]',
      'bg-background text-foreground',
    ]"
  >
    <!-- 1. Restore/Expand Strip (Visible only when header is collapsed) -->
    <div v-if="!isHeaderExpanded" @click="isHeaderExpanded = true"
      class="w-full h-6 flex items-center justify-center bg-background-secondary border-b border-border cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors group z-50 flex-none"
      title="Show Header">
      <svg class="w-4 h-4 text-foreground-secondary group-hover:text-blue-500 transition-colors" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- 2. Top App Bar (Visible when expanded) -->
    <header v-show="isHeaderExpanded"
      class="z-50 bg-background-secondary border-b border-border px-4 py-3 shadow-sm flex-none transition-colors duration-500">
      <div class="w-full flex items-center justify-between gap-4">
        <!-- Brand & Info & Tab (Left) -->
        <div class="flex items-center gap-4 flex-wrap sm:flex-nowrap">
          <div class="flex flex-col">
            <div class="flex items-center gap-3">
              <h1 class="text-xl font-bold tracking-tight text-foreground leading-none">
                Context Replace
              </h1>
              <!-- 切换按钮置于 Context Replace 标题右侧 -->
              <ModeTabs v-model="currentMode" />
            </div>
            <span class="text-xs font-medium text-foreground-secondary mt-1">
              An offline tool to replace sensitive text in your context
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <HoverInfo class="p-1.5 rounded border bg-orange-100 border-orange-200 opacity-80" :tooltip="t.offlineTooltip"
              placement="bottom">
              <img src="/offline.png" :alt="t.offlineFunction" class="size-4" />
            </HoverInfo>
            <a href="https://github.com/ctxinf/context-replace" target="_blank"
              class="size-7 p-1 bg-button-bg hover:bg-button-bg text-foreground-secondary hover:text-foreground rounded-md flex items-center justify-center text-sm font-bold transition-colors"
              title="View on GitHub">
              <svg class="size-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>

            <!-- Language Switch -->
            <LanguageSwitcher
              class="size-7 p-1 bg-button-bg hover:bg-button-bg text-foreground-secondary hover:text-foreground rounded-md" />

            <!-- Dark Mode Toggle -->
            <DarkModeToggle />

            <router-link to="/help"
              class="size-7 bg-button-bg hover:bg-button-bg text-foreground-secondary hover:text-foreground rounded-md flex items-center justify-center text-sm font-bold transition-colors"
              title="Help">
              ?
            </router-link>

            <!-- 3. New Collapse Button -->
            <button @click="isHeaderExpanded = false"
              class="size-7 bg-button-bg hover:bg-button-bg text-foreground-secondary hover:text-foreground rounded-md flex items-center justify-center transition-colors"
              title="Collapse Header (Focus Mode)">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Rule Config Component (Right) -->
        <div class="flex items-center flex-none">
          <RuleConfig />
        </div>
      </div>
    </header>

    <!-- Main Workspace with Unified Column Swap Animation -->
    <TransitionGroup
      tag="main"
      name="col-swap"
      class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 min-h-0 relative"
    >
      <div
        v-for="col in activeColumns"
        :key="col"
        class="flex flex-col h-full min-h-0 overflow-hidden"
      >
        <!-- ================= INPUT COLUMN ================= -->
        <template v-if="isLeftColumn(col)">
          <!-- Input Toolbar (External, moves together with column) -->
          <div class="flex items-center justify-between px-1 mb-2">
            <h2 class="text-sm font-bold text-foreground-secondary flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full transition-colors duration-300"
                :class="displayedMode === 'restore' ? 'bg-violet-500' : 'bg-blue-500'"
              ></span>
              {{ displayedMode === 'restore' ? t.aiResult : t.inputTitle }}
            </h2>
            <div class="flex gap-2">
              <button v-if="inputText" @click="clearInput"
                class="px-3 py-1 text-xs font-medium text-foreground-secondary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors">
                {{ t.clear }}
              </button>
              <button @click="doReplace" :disabled="!inputText.trim()"
                class="flex items-center gap-1.5 px-4 py-1.5 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                :class="[
                  displayedMode === 'restore'
                    ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/25'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                ]"
                :title="displayedMode === 'restore' ? t.shortcutRestore : t.shortcutReplace">
                <svg v-if="displayedMode === 'replace'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ displayedMode === 'restore' ? t.restore : t.replace }}
              </button>
            </div>
          </div>

          <!-- Input Area (Card) -->
          <div
            class="flex-1 bg-background rounded-xl shadow-sm border border-border overflow-hidden relative group transition-colors duration-300"
            :class="[
              displayedMode === 'restore'
                ? 'hover:border-violet-300 focus-within:border-violet-400'
                : 'hover:border-blue-300 focus-within:border-blue-400'
            ]"
          >
            <textarea v-model="inputText" ref="inputTextarea"
              class="w-full h-full p-4 bg-transparent border-none resize-none focus:ring-0 text-sm font-mono leading-relaxed text-foreground placeholder-foreground-secondary"
              :placeholder="t.pasteCodePlaceholder" @paste="handlePaste"></textarea>
          </div>
        </template>

        <!-- ================= OUTPUT COLUMN ================= -->
        <template v-else>
          <!-- Output Toolbar (External, moves together with column) -->
          <div class="flex items-center justify-between px-1 mb-2">
            <div class="flex items-center gap-4">
              <h2 class="text-sm font-bold text-foreground-secondary flex items-center gap-2">
                <span
                  class="w-2 h-2 rounded-full transition-colors duration-300"
                  :class="displayedMode === 'restore' ? 'bg-violet-500' : 'bg-green-500'"
                ></span>
                {{ displayedMode === 'restore' ? t.restoredText : t.replacedInput }}
              </h2>
              <!-- Stats Badge -->
              <div v-if="replaceCount > 0"
                class="text-xs font-medium px-2 py-0.5 rounded-md border transition-colors duration-300"
                :class="[
                  displayedMode === 'restore'
                    ? 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900'
                    : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900'
                ]"
              >
                {{ t.replacements(replaceCount.toString()) }}
              </div>

              <!-- Copy controls -->
              <div class="flex items-center gap-3 ml-2 border-l pl-4 border-border">
                <!-- Auto Copy Checkbox -->
                <label class="flex items-center gap-1.5 cursor-pointer select-none">
                  <input v-model="autoCopy" type="checkbox"
                    class="w-3.5 h-3.5 rounded border-border transition-colors duration-200"
                    :class="displayedMode === 'restore' ? 'text-violet-600 focus:ring-violet-500' : 'text-blue-600 focus:ring-blue-500'" />
                  <span class="text-xs text-foreground-secondary hover:text-foreground">{{ t.autoCopy }}</span>
                </label>

                <!-- Main Copy Button -->
                <button @click="copyToClipboard" :disabled="!outputText"
                  class="flex items-center gap-1.5 px-3 py-1 bg-background-secondary text-foreground-secondary text-xs font-bold rounded shadow-sm hover:bg-background-dark hover:text-foreground active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-background-secondary disabled:text-foreground-secondary"
                  title="copy">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {{ t.copy }}
                </button>
              </div>
            </div>
          </div>

          <!-- Output Area (Card) -->
          <div
            class="flex-1 bg-background rounded-xl shadow-sm border border-border overflow-hidden relative transition-colors duration-300"
            :class="[
              displayedMode === 'restore'
                ? 'hover:border-violet-300'
                : 'hover:border-green-300'
            ]"
          >
            <!-- Floating navigation buttons -->
            <div v-if="replaceCount > 0" class="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
              <button @click="searchPrevious"
                class="w-10 h-10 flex items-center justify-center bg-search-button-bg text-foreground-secondary rounded-full shadow-lg border border-search-button-border hover:scale-110 active:scale-95 transition-all duration-200 group"
                :class="displayedMode === 'restore' ? 'hover:bg-violet-600 hover:text-white hover:border-violet-500' : 'hover:bg-blue-600 hover:text-white hover:border-blue-500'"
                :title="t.previousItem">
                <svg class="w-6 h-6 transform group-hover:-translate-y-0.5 transition-transform" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button @click="searchNext"
                class="w-10 h-10 flex items-center justify-center bg-search-button-bg text-foreground-secondary rounded-full shadow-lg border border-search-button-border hover:scale-110 active:scale-95 transition-all duration-200 group"
                :class="displayedMode === 'restore' ? 'hover:bg-violet-600 hover:text-white hover:border-violet-500' : 'hover:bg-blue-600 hover:text-white hover:border-blue-500'"
                :title="t.nextItem">
                <svg class="w-6 h-6 transform group-hover:translate-y-0.5 transition-transform" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div ref="outputContainer"
              class="w-full h-full p-4 overflow-auto font-mono text-sm whitespace-pre-wrap leading-relaxed selection:bg-green-100 selection:text-green-900 pb-20"
              :class="{
                'text-foreground-secondary italic flex items-center justify-center':
                  !outputText,
              }">
              <template v-if="outputText">
                <div v-html="outputText"></div>
              </template>
              <template v-else>
                <span>{{ t.waitingForInput }}</span>
              </template>
            </div>
          </div>
        </template>
      </div>
    </TransitionGroup>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useRulesStore } from "../stores/rules";
import { initDatabase, runMigrations } from "../database/index";
import RuleConfig from "../components/RuleConfig.vue";
import ModeTabs, { type OperationMode } from "../components/ModeTabs.vue";
import HoverInfo from "../components/HoverInfo.vue";
import { applyReplace, type ReplaceResult } from "../utils/replace";
import { buildReverseRules } from "../utils/reverseReplace";
import { toast } from "vue-sonner";
import { handleKeyboardShortcuts } from "../utils/shortcuts";
import { sleep } from "radash";
import { useI18n } from "../composables/useI18n";
import LanguageSwitcher from "../components/LanguageSwitcher.vue";
import DarkModeToggle from "../components/DarkModeToggle.vue";
import AppFooter from "../components/AppFooter.vue";

// --- State & Constants ---
const rulesStore = useRulesStore();
const { t } = useI18n();

// UI References
const inputText = ref("");
const outputText = ref("");
const outputContainer = ref<HTMLDivElement>();
const inputTextarea = ref<HTMLTextAreaElement>();
// 使用 useLocalStorage 持久化操作模式 (替换/恢复)
const currentMode = useLocalStorage<OperationMode>("context-replace-mode", "replace");
// displayedMode 用于 Header 标题、按钮与主题色显示，实现“先切换动画 -> 后header变更”
const displayedMode = ref<OperationMode>(currentMode.value);
// 使用 useLocalStorage 持久化自动复制状态到本地存储
const autoCopy = useLocalStorage("context-replace-auto-copy", false);
// 使用 useLocalStorage 持久化头部展开/折叠状态到本地存储
const isHeaderExpanded = useLocalStorage("context-replace-header-expanded", true);

// 栏目顺序：由 TransitionGroup 实现整栏（包含顶部 header 和卡片）平滑左右交换动画
const activeColumns = ref<string[]>(
  currentMode.value === "replace" ? ["col-a", "col-b"] : ["col-b", "col-a"]
);

// 判断当前列是否作为左侧输入栏展示
const isLeftColumn = (col: string) => {
  return (
    (displayedMode.value === "replace" && col === "col-a") ||
    (displayedMode.value === "restore" && col === "col-b")
  );
};

const SWAP_DURATION_MS = 450;
let swapTimer: ReturnType<typeof setTimeout> | null = null;

// Logic State
const replaceCount = ref(0);
const currentSearchIndex = ref(-1);
const currentTaskHistory = ref<any[]>([]);
const originalInput = ref("");
const showRestore = ref(false);
const plainOutputText = ref("");

// ... Rest of your script helper functions (convertRulesForApply, updateMatchHighlighting, doReplace, etc.) ...
// I am including the rest of the script block to ensure it's complete, 
// though the only logic change was adding `isHeaderExpanded`.

const convertRulesForApply = (rules: any[]) => {
  return rules.map((rule) => ({
    id: rule.id,
    match: {
      type: rule.matchType,
      value: rule.matchValue,
    },
    target: {
      type: "fixed" as const,
      value: rule.targetValue,
    },
  }));
};

const updateMatchHighlighting = (targetIndex: number) => {
  if (!outputContainer.value) return;

  const highlights = outputContainer.value.querySelectorAll(
    'span[style*="background-color"]',
  );

  if (highlights.length === 0) return;

  highlights.forEach((el, index) => {
    const htmlEl = el as HTMLElement;

    if (index === targetIndex) {
      htmlEl.style.transition = "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)";
      htmlEl.style.outline = "3px solid #ef4444";
      htmlEl.style.outlineOffset = "2px";
      htmlEl.style.borderRadius = "2px";
      htmlEl.style.transform = "scale(1.15)";
      htmlEl.style.zIndex = "20";
      htmlEl.style.position = "relative";
      htmlEl.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.4)";

      htmlEl.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      htmlEl.style.outline = "";
      htmlEl.style.outlineOffset = "";
      htmlEl.style.borderRadius = "";
      htmlEl.style.transform = "";
      htmlEl.style.zIndex = "";
      htmlEl.style.position = "";
      htmlEl.style.boxShadow = "";
    }
  });
};

const doReplace = async () => {
  if (!inputText.value.trim()) return;

  if (currentMode.value === "restore") {
    // 反向替换：根据配置生成反向规则（目标值 -> 原始匹配值）
    const { rules: reverseRules, conflicts } = buildReverseRules(rulesStore.rules);
    const result: ReplaceResult = applyReplace(inputText.value, reverseRules);

    outputText.value = result.result;
    plainOutputText.value = result.result.replace(/<[^>]*>/g, "");
    replaceCount.value = result.history.length;
    currentSearchIndex.value = -1;

    currentTaskHistory.value = result.history;
    originalInput.value = inputText.value;
    showRestore.value = false;

    if (outputContainer.value) outputContainer.value.scrollTop = 0;

    // 关键：只有在替换过程中实际命中了多对一冲突项，才进行警告提示，避免未命中的配置冲突造成误报
    const hitConflicts = conflicts.filter((c) =>
      result.history.some((h) => h.originalMatch === c.targetValue),
    );

    if (hitConflicts.length > 0) {
      const conflictSummary = hitConflicts
        .map((c) => `"${c.targetValue}"`)
        .join(", ");
      const warnTitle = t.value.reverseConflictWarning(
        hitConflicts.length.toString(),
      );
      const warnDesc = t.value.reverseConflictDetails(conflictSummary);
      toast.warning(warnTitle, {
        description: warnDesc,
        duration: 5000,
      });
    }

    toast.success(t.value.restoreCompleted(replaceCount.value.toString()));

    if (autoCopy.value) {
      await copyToClipboard();
    }
  } else {
    // 正向替换：根据配置正向替换（匹配值 -> 目标值）
    const rules = convertRulesForApply(rulesStore.rules);
    const result: ReplaceResult = applyReplace(inputText.value, rules);

    outputText.value = result.result;
    plainOutputText.value = result.result.replace(/<[^>]*>/g, "");
    replaceCount.value = result.history.length;
    currentSearchIndex.value = -1;

    currentTaskHistory.value = result.history;
    originalInput.value = inputText.value;
    showRestore.value = result.history.length > 0;

    if (outputContainer.value) outputContainer.value.scrollTop = 0;
    toast.success(t.value.replaceCompleted(replaceCount.value.toString()));

    if (autoCopy.value) {
      await copyToClipboard();
    }
  }
};

const copyToClipboard = async () => {
  if (!outputText.value) return;

  try {
    const plainText = outputText.value
      .replace(/<[^>]*>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, "&");

    await navigator.clipboard.writeText(plainText);
    await sleep(500);
    toast.success("Copied to clipboard", { duration: 1500 });
  } catch (error) {
    console.error("Failed to copy:", error);
    toast.error("Failed to copy");
  }
};

const clearInput = () => {
  inputText.value = "";
  outputText.value = "";
  replaceCount.value = 0;
  currentSearchIndex.value = -1;
  showRestore.value = false;
  currentTaskHistory.value = [];
  originalInput.value = "";
  plainOutputText.value = "";
};

const handlePaste = (_?: ClipboardEvent) => {
  setTimeout(() => {
    doReplace();
  }, 150);
};

const searchNext = () => {
  if (!outputContainer.value || replaceCount.value === 0) return;

  const highlights = outputContainer.value.querySelectorAll(
    'span[style*="background-color"]',
  );
  if (highlights.length === 0) return;

  currentSearchIndex.value = (currentSearchIndex.value + 1) % highlights.length;
  updateMatchHighlighting(currentSearchIndex.value);
};

const searchPrevious = () => {
  if (!outputContainer.value || replaceCount.value === 0) return;

  const highlights = outputContainer.value.querySelectorAll(
    'span[style*="background-color"]',
  );
  if (highlights.length === 0) return;

  currentSearchIndex.value =
    currentSearchIndex.value <= 0
      ? highlights.length - 1
      : currentSearchIndex.value - 1;

  updateMatchHighlighting(currentSearchIndex.value);
};

const handleKeydown = (event: KeyboardEvent) => {
  handleKeyboardShortcuts(event, {
    replace: doReplace,
    copy: copyToClipboard,
  });

  if (event.ctrlKey) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      searchPrevious();
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      searchNext();
    }
  }
};

watch(inputText, (newVal) => {
  if (originalInput.value && newVal !== originalInput.value) {
    showRestore.value = false;
  }
});

// 监听操作模式切换：先整体交换栏目（带header一起），待动画完成后再变更 Header 状态（先切换 -> 后header变更）
watch(currentMode, (newMode) => {
  if (swapTimer) {
    clearTimeout(swapTimer);
    swapTimer = null;
  }

  // 1. 立即改变栏目顺序，触发 TransitionGroup FLIP 整体平滑位移动画（带 Header 一起整体切换）
  activeColumns.value = newMode === "replace" ? ["col-a", "col-b"] : ["col-b", "col-a"];

  // 2. 动画到达对方位置后 (450ms)，更新 displayedMode 变更 Header 标题/按钮状态，并在恢复模式下选中输入框内容
  swapTimer = setTimeout(() => {
    displayedMode.value = newMode;

    if (newMode === "restore") {
      nextTick(() => {
        if (inputTextarea.value) {
          inputTextarea.value.focus();
          inputTextarea.value.select();
        }
      });
    }
  }, SWAP_DURATION_MS);
});

onMounted(async () => {
  try {
    await initDatabase();
    await runMigrations();
    await rulesStore.loadRules();

    if (rulesStore.rules.length === 0) {
      await rulesStore.initializeDefaultRules();
    }

    window.addEventListener("keydown", handleKeydown);
  } catch (error) {
    console.error("Initialization failed:", error);
    toast.error("Initialization failed");
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (swapTimer) {
    clearTimeout(swapTimer);
  }
});
</script>

<style scoped>
textarea::-webkit-scrollbar,
div::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

textarea::-webkit-scrollbar-track,
div::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb,
div::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 99px;
}

textarea::-webkit-scrollbar-thumb:hover,
div::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

:deep(span[style*="background-color"]) {
  border-radius: 2px;
  cursor: pointer;
  display: inline-block;
}

/* 左右整栏交换平滑过渡动画（Vue TransitionGroup FLIP 动画，包含 Header 与卡片整体移动） */
.col-swap-move {
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}
</style>