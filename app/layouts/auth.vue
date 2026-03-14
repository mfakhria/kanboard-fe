<template>
  <div class="relative w-full min-h-screen overflow-hidden flex flex-col">
    <!-- Sky background -->
    <div
      class="absolute inset-0"
      style="background: linear-gradient(180deg, #c7dff7 0%, #deedf9 35%, #eef6fc 60%, #f0f8ff 80%, #e8f4fb 100%)"
    />

    <!-- Clouds -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Large cloud bottom-left -->
      <div
        class="absolute"
        style="bottom: 0px; left: -60px; width: 520px; height: 200px; background: radial-gradient(ellipse 60% 60% at 40% 80%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.5) 60%, transparent 100%); filter: blur(6px)"
      />
      <!-- Cloud cluster bottom-left second -->
      <div
        class="absolute"
        style="bottom: 30px; left: 180px; width: 360px; height: 160px; background: radial-gradient(ellipse 55% 55% at 50% 80%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.4) 65%, transparent 100%); filter: blur(5px)"
      />
      <!-- Large cloud bottom-right -->
      <div
        class="absolute"
        style="bottom: -20px; right: -40px; width: 560px; height: 220px; background: radial-gradient(ellipse 60% 65% at 60% 80%, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.45) 60%, transparent 100%); filter: blur(7px)"
      />
      <!-- Mid cloud right -->
      <div
        class="absolute"
        style="bottom: 120px; right: 60px; width: 300px; height: 110px; background: radial-gradient(ellipse 55% 55% at 50% 70%, rgba(255,255,255,0.80) 0%, rgba(255,255,255,0.3) 70%, transparent 100%); filter: blur(5px)"
      />
      <!-- Subtle arc lines -->
      <svg
        class="absolute"
        style="top: 50%; left: 50%; transform: translate(-50%,-50%); opacity: 0.12; width: 900px; height: 600px"
        viewBox="0 0 900 600"
        fill="none"
      >
        <ellipse cx="450" cy="300" rx="380" ry="240" stroke="white" stroke-width="1" />
        <ellipse cx="450" cy="300" rx="260" ry="165" stroke="white" stroke-width="1" />
        <ellipse cx="450" cy="300" rx="160" ry="100" stroke="white" stroke-width="1" />
      </svg>
    </div>

    <!-- Top-left branding -->
    <div class="relative z-10 flex items-center gap-2.5 px-8 pt-7">
      <div
        class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
        style="background: linear-gradient(135deg, #478FC8, #3570A5)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1.2" fill="white" fill-opacity="0.95" />
          <rect x="8" y="1" width="5" height="5" rx="1.2" fill="white" fill-opacity="0.95" />
          <rect x="1" y="8" width="5" height="5" rx="1.2" fill="white" fill-opacity="0.95" />
          <rect x="8" y="8" width="5" height="5" rx="1.2" fill="white" fill-opacity="0.95" />
        </svg>
      </div>
      <NuxtLink to="/" class="text-gray-800 no-underline" style="font-size: 16px; font-weight: 800; letter-spacing: -0.4px">
        kanzon
      </NuxtLink>
    </div>

    <!-- Centered content -->
    <div class="relative z-10 flex flex-1 items-center justify-center px-4">
      <div class="flex flex-col items-center w-full" style="max-width: 400px">
        <slot />
      </div>
    </div>

    <!-- Bottom vignette -->
    <div
      class="absolute bottom-0 left-0 right-0 pointer-events-none"
      style="height: 120px; background: linear-gradient(0deg, rgba(200,228,248,0.4) 0%, transparent 100%)"
    />
  </div>
</template>
