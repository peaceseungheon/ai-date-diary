<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">데이트 일기</h1>
        <p class="mt-2 text-gray-600">소중한 추억을 되돌아보세요</p>
      </div>

      <!-- Empty State -->
      <div class="rounded-lg bg-white py-12 text-center shadow-sm">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h3 class="mt-2 text-sm font-semibold text-gray-900">아직 작성된 일기가 없습니다</h3>
        <p class="mt-1 text-sm text-gray-500">첫 번째 데이트 일기를 작성해보세요!</p>
        <div class="mt-6">
          <router-link
            to="/diaries/new"
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <svg
              class="-ml-0.5 mr-1.5 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            일기 작성하기
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// DiaryList component
</script>
