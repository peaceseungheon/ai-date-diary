<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Header with Create Button -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">데이트 일기</h1>
          <p class="mt-2 text-gray-600">소중한 추억을 되돌아보세요</p>
        </div>
        <router-link
          to="/diaries/new"
          class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          새 일기 작성
        </router-link>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div class="h-40 animate-pulse rounded-lg bg-gray-200"></div>
        <div class="h-40 animate-pulse rounded-lg bg-gray-200"></div>
        <div class="h-40 animate-pulse rounded-lg bg-gray-200"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="diaries.length === 0" class="rounded-lg bg-white py-12 text-center shadow-sm">
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

      <!-- Diary List -->
      <div v-else class="space-y-4">
        <div
          v-for="diary in diaries"
          :key="diary.diaryId"
          class="rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
        >
          <router-link :to="`/diaries/${diary.diaryId}`" class="block p-6 hover:bg-gray-50">
            <!-- Date Badge -->
            <div class="mb-2 flex items-center gap-2">
              <span
                class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
              >
                {{ formatDate(diary.date) }}
              </span>
              <span
                v-if="diary.photos.length > 0"
                class="inline-flex items-center gap-1 text-xs text-gray-500"
              >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4.5-4.5 3 3 4-4 2.5 2.5V5H4v10z"
                  />
                </svg>
                {{ diary.photos.length }}
              </span>
            </div>

            <!-- Title -->
            <h3 class="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">{{ diary.title }}</h3>

            <!-- Preview -->
            <p class="mb-4 line-clamp-3 text-gray-600">{{ diary.content }}</p>

            <!-- Photo Thumbnails -->
            <div v-if="diary.photos.length > 0" class="mb-4 flex gap-2">
              <img
                v-for="(photo, idx) in diary.photos.slice(0, 3)"
                :key="photo.photoId"
                :src="getPhotoUrl(photo.thumbnailPath)"
                :alt="`Photo ${idx + 1}`"
                class="h-16 w-16 rounded object-cover"
              />
              <div
                v-if="diary.photos.length > 3"
                class="flex h-16 w-16 items-center justify-center rounded bg-gray-100 text-sm font-semibold text-gray-600"
              >
                +{{ diary.photos.length - 3 }}
              </div>
            </div>

            <!-- Meta -->
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>{{ formatDateTime(diary.createdAt) }}</span>
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </router-link>

          <!-- Delete Button -->
          <div class="border-t border-gray-100 px-6 py-3">
            <button
              @click="handleDelete(diary.diaryId)"
              class="text-xs text-red-600 transition-colors hover:text-red-700"
            >
              삭제
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          이전
        </button>

        <div class="flex gap-1">
          <button
            v-for="page in paginationRange"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getDiaries, deleteDiary, type Diary } from '../lib/diary';
import { generatePublicUrl } from '../lib/s3';

const diaries = ref<Diary[]>([]);
const loading = ref(false);
const error = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const paginationRange = computed(() => {
  const range = [];
  const maxPages = 5;
  const startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
  const endPage = Math.min(totalPages.value, startPage + maxPages - 1);

  for (let i = startPage; i <= endPage; i++) {
    range.push(i);
  }

  return range;
});

const fetchDiaries = async (page: number = 1) => {
  loading.value = true;
  error.value = '';

  try {
    const response = await getDiaries(page, itemsPerPage);
    diaries.value = response.diaries;
    totalItems.value = response.pagination.total;
    currentPage.value = page;
  } catch (err: any) {
    console.error('Failed to fetch diaries:', err);
    error.value = '일기 목록을 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (diaryId: string) => {
  if (!confirm('이 일기를 삭제하시겠습니까?')) {
    return;
  }

  try {
    await deleteDiary(diaryId);
    diaries.value = diaries.value.filter(d => d.diaryId !== diaryId);
    totalItems.value--;

    // If current page is now empty, go to previous page
    if (diaries.value.length === 0 && currentPage.value > 1) {
      fetchDiaries(currentPage.value - 1);
    }
  } catch (err: any) {
    console.error('Failed to delete diary:', err);
    error.value = '일기 삭제에 실패했습니다.';
  }
};

const goToPage = (page: number) => {
  fetchDiaries(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1);
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1);
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getPhotoUrl = (filePath: string): string => {
  return generatePublicUrl(filePath);
};

onMounted(() => {
  fetchDiaries();
});
</script>
