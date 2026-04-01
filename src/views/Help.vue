<template>
  <!-- 1. 全屏容器：强制深色背景，防止出现白边 -->
  <div
    class="relative min-h-screen w-full overflow-hidden bg-[#0B0C10] text-slate-200 selection:bg-indigo-500/30"
  >
    <!-- 2. 背景装饰层 (绝对定位，z-index 为 0) -->
    <div class="absolute inset-0 z-0">
      <!-- 2.1 科技感网格背景 -->
      <div
        class="absolute inset-0 h-full w-full"
        style="
          background-size: 50px 50px;
          background-image:
            linear-gradient(
              to right,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px
            );
          mask-image: radial-gradient(
            ellipse 80% 80% at 50% 10%,
            black 40%,
            transparent 100%
          );
          -webkit-mask-image: radial-gradient(
            ellipse 80% 80% at 50% 10%,
            black 40%,
            transparent 100%
          );
        "
      ></div>

      <!-- 2.2 顶部氛围辉光 (Spotlight Effect) -->
      <div
        class="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"
      ></div>
      <div
        class="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none"
      ></div>
    </div>

    <!-- 3. 内容层 (z-index 提高，确保在背景之上) -->
    <div class="relative z-10 flex flex-col items-center">
      <!-- 返回按钮 -->
      <div class="w-full p-6">
        <router-link
          to="/"
          class="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors duration-200"
        >
          <span class="mr-1">←</span> Back
        </router-link>
      </div>

      <!-- 标题区域 -->
      <div class="text-center mb-10 max-w-2xl px-4">
        <div
          class="inline-block mb-3 px-3 py-1 text-xs font-medium tracking-wider text-indigo-300 uppercase bg-indigo-500/10 rounded-full border border-indigo-500/20 backdrop-blur-sm"
        >
          Privacy First
        </div>
        <h1
          class="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-b from-white to-gray-400 tracking-tight"
        >
          Context Replace
        </h1>
        <p class="text-base text-gray-400 font-light leading-relaxed">
          Setting rules to
          <span class="text-indigo-400">redact sensitive information</span> in
          your context before sending it to LLM.
        </p>
      </div>

      <!-- 视频容器 -->
      <!-- 添加了玻璃拟态边框效果 -->
      <div class="relative group mx-auto w-fit mb-10">
        <!-- 视频背后的发光效果 -->
        <div
          class="absolute -inset-1 bg-linear-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"
        ></div>

        <!-- 视频主体 -->
        <div
          class="relative rounded-xl bg-gray-900/50 p-1 ring-1 ring-white/10 backdrop-blur-sm"
        >
          <video
            :src="videoSrc"
            autoplay
            playsinline
            loop
            muted
            preload="auto"
            :poster="posterSrc"
            class="object-cover max-w-[90vw] rounded-lg max-h-[70vh] w-full"
            style="clip-path: inset(0.5px)"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const videoSrc = "/usage.webm";
const posterSrc = "/usage-video-first.png";
</script>
