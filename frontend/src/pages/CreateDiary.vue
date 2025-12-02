<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">새 일기 작성</h1>
        <p class="mt-2 text-gray-600">데이트 사진을 업로드하고 AI가 일기를 작성해드려요</p>
      </div>

      <!-- Form -->
      <div class="rounded-lg bg-white p-8 shadow-sm">
        <div class="space-y-6">
          <!-- Date Picker -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700"> 데이트 날짜 </label>
            <input
              type="date"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <!-- Photo Upload Area -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              사진 업로드 (2~10장)
            </label>
            <div
              class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10 transition-colors hover:border-gray-400"
            >
              <div class="text-center">
                <svg
                  class="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <div class="mt-4 flex text-sm text-gray-600">
                  <label
                    class="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500"
                  >
                    <span>파일 선택</span>
                    <input type="file" class="sr-only" multiple accept="image/*" />
                  </label>
                  <p class="pl-1">또는 드래그 앤 드롭</p>
                </div>
                <p class="mt-2 text-xs text-gray-500">PNG, JPG, HEIC 최대 10MB</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="router.back()"
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="button"
              class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              AI 일기 생성
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>
