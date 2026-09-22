<script setup lang="ts">
import { useI18n } from "../composables/useI18n";

export type OperationMode = "replace" | "restore";

const props = defineProps<{
  /** 当前选中的模式：替换 (replace) 或 恢复 (restore) */
  modelValue: OperationMode;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: OperationMode): void;
}>();

const { t } = useI18n();

const setMode = (mode: OperationMode) => {
  if (props.modelValue !== mode) {
    emit("update:modelValue", mode);
  }
};
</script>

<template>
  <div
    class="inline-flex items-center p-0.5 rounded-lg bg-background border border-border shadow-xs transition-colors duration-300"
    :class="[
      modelValue === 'replace'
        ? 'border-blue-200 dark:border-blue-900/60'
        : 'border-violet-200 dark:border-violet-900/60',
    ]"
    role="tablist"
    aria-label="Mode Selection"
  >
    <!-- 替换 Tab (蓝色主题) -->
    <button
      type="button"
      role="tab"
      :aria-selected="modelValue === 'replace'"
      @click="setMode('replace')"
      class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 select-none cursor-pointer"
      :class="[
        modelValue === 'replace'
          ? 'bg-blue-600 text-white shadow-xs'
          : 'text-foreground-secondary hover:text-blue-600 hover:bg-blue-50/60 dark:hover:bg-blue-950/40',
      ]"
      :title="t.replace"
    >
      <!-- 替换图标：正向箭头交换 -->
      <svg
        class="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
      <span>{{ t.replace }}</span>
    </button>

    <!-- 恢复 Tab (紫色主题) -->
    <button
      type="button"
      role="tab"
      :aria-selected="modelValue === 'restore'"
      @click="setMode('restore')"
      class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 select-none cursor-pointer"
      :class="[
        modelValue === 'restore'
          ? 'bg-violet-600 text-white shadow-xs'
          : 'text-foreground-secondary hover:text-violet-600 hover:bg-violet-50/60 dark:hover:bg-violet-950/40',
      ]"
      :title="t.restore"
    >
      <!-- 恢复图标：反向撤销/回退 -->
      <svg
        class="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span>{{ t.restore }}</span>
    </button>
  </div>
</template>
