<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button
        @click="router.back()"
        class="mb-6 inline-flex items-center text-sm text-gray-600 transition-colors hover:text-gray-900"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        뒤로 가기
      </button>

      <!-- Content -->
      <div class="rounded-lg bg-white p-8 shadow-sm">
        <h1 class="mb-4 text-3xl font-bold text-gray-900">일기 상세</h1>
        <p class="text-gray-500">일기 상세 페이지 구현 예정</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>
