<template>
  <div class="min-h-screen bg-background text-foreground font-sans flex flex-col">
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
      class="z-50 bg-background-secondary border-b border-border px-4 py-3 shadow-sm flex-none">
      <div class="w-full flex  items-start gap-4">
        <!-- Brand & Info -->
        <div class="flex items-center gap-4 pt-1">
          <div class="flex flex-col">
            <div class="relative">
              <h1 class="text-xl font-bold tracking-tight text-foreground leading-none">
                Context Replace
              </h1>
            </div>
            <span class="text-xs font-medium text-foreground-secondary mt-1">
              An offline tool to replace sensitive text in your context
            </span>
          </div>
        </div>


        <!-- Actions -->
        <div class="flex items-center gap-2  mt-3 ">
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


        <!-- Rule Config Component -->
        <div class="flex-1" />
        <RuleConfig />
      </div>



    </header>

    <!-- Main Workspace -->
    <main class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 min-h-0">
      <!-- ... Rest of your main content remains unchanged ... -->
      <!-- ================= INPUT COLUMN ================= -->
      <div class="flex flex-col h-full">
        <!-- Input Toolbar (External) -->
        <div class="flex items-center justify-between px-1 mb-2">
          <h2 class="text-sm font-bold text-foreground-secondary flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            {{ t.rawInput }}
          </h2>
          <div class="flex gap-2">
            <button v-if="inputText" @click="clearInput"
              class="px-3 py-1 text-xs font-medium text-foreground-secondary hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
              {{ t.clear }}
            </button>
            <button @click="doReplace" :disabled="!inputText.trim()"
              class="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              :title="t.shortcutReplace">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {{ t.replace }}
              <!-- TODO: Test i18n here -->
            </button>
          </div>
        </div>

        <!-- Input Area (Card) -->
        <div
          class="flex-1 bg-background rounded-xl shadow-sm border border-border overflow-hidden relative group hover:border-blue-300 transition-colors">
          <textarea v-model="inputText" ref="inputTextarea"
            class="w-full h-full p-4 bg-transparent border-none resize-none focus:ring-0 text-sm font-mono leading-relaxed text-foreground placeholder-foreground-secondary"
            :placeholder="t.pasteCodePlaceholder" @paste="handlePaste"></textarea>
        </div>
      </div>

      <!-- ================= OUTPUT COLUMN ================= -->
      <div class="flex flex-col relative">
        <!-- Output Toolbar (External) -->
        <div class="flex items-center justify-between px-1 mb-2">
          <div class="flex items-center gap-4">
            <h2 class="text-sm font-bold text-foreground-secondary flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              {{ t.processedResult }}
            </h2>
            <!-- Stats Badge -->
            <div v-if="replaceCount > 0"
              class="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
              {{ t.replacements(replaceCount.toString()) }}
            </div>

            <!-- [Modification 3: Move copy controls here] -->
            <div class="flex items-center gap-3 ml-2 border-l pl-4 border-border">
              <!-- Auto Copy Checkbox -->
              <label class="flex items-center gap-1.5 cursor-pointer select-none">
                <input v-model="autoCopy" type="checkbox"
                  class="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 border-border" />
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

          <!-- Original navigation bar location removed -->
        </div>

        <!-- Output Area (Card) -->
        <!-- Add relative for internal absolute positioning of floating buttons -->
        <div
          class="flex-1 bg-background rounded-xl shadow-sm border border-border overflow-hidden relative hover:border-green-300 transition-colors">
          <!-- [Modification 1: Floating navigation buttons] -->
          <div v-if="replaceCount > 0" class="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
            <button @click="searchPrevious"
              class="w-10 h-10 flex items-center justify-center bg-search-button-bg text-foreground-secondary rounded-full shadow-lg border border-search-button-border hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 group"
              :title="t.previousItem">
              <svg class="w-6 h-6 transform group-hover:-translate-y-0.5 transition-transform" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button @click="searchNext"
              class="w-10 h-10 flex items-center justify-center bg-search-button-bg text-foreground-secondary rounded-full shadow-lg border border-search-button-border hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 group"
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
      </div>
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useRulesStore } from "../stores/rules";
import { initDatabase, runMigrations } from "../database/index";
import RuleConfig from "../components/RuleConfig.vue";
import HoverInfo from "../components/HoverInfo.vue";
import { applyReplace, type ReplaceResult } from "../utils/replace";
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
// 使用 useLocalStorage 持久化自动复制状态到本地存储
const autoCopy = useLocalStorage("context-replace-auto-copy", false);
// 使用 useLocalStorage 持久化头部展开/折叠状态到本地存储
const isHeaderExpanded = useLocalStorage("context-replace-header-expanded", true);

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
  toast.success(`Replacement ${replaceCount.value} successfully`);

  if (autoCopy.value) {
    await copyToClipboard();
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
</style>