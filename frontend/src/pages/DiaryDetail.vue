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

      <!-- Loading State -->
      <div v-if="isLoading" class="rounded-lg bg-white p-8 shadow-sm">
        <div class="flex items-center justify-center">
          <div
            class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
          ></div>
          <span class="ml-3 text-gray-600">일기를 불러오는 중...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-lg bg-red-50 p-6 text-red-700">
        <div class="flex items-start">
          <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium">일기를 불러올 수 없습니다</h3>
            <p class="mt-1 text-sm">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Diary Content -->
      <div v-else-if="diary" class="space-y-6">
        <!-- Main Card -->
        <div class="rounded-lg bg-white p-8 shadow-sm">
          <!-- Header -->
          <div class="mb-6 flex items-start justify-between">
            <div>
              <h1 class="mb-2 text-3xl font-bold text-gray-900">{{ diary.title }}</h1>
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <div class="flex items-center">
                  <svg class="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {{ formatDate(diary.date) }}
                </div>
                <div class="flex items-center">
                  <svg class="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ formatDateTime(diary.createdAt) }} 작성
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button
                @click="handleEdit"
                class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                수정
              </button>
              <button
                @click="handleDelete"
                class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>

          <!-- Photos Grid -->
          <div v-if="diary.photos && diary.photos.length > 0" class="mb-6">
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div
                v-for="photo in diary.photos"
                :key="photo.photoId"
                class="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100"
                @click="openPhotoModal(photo)"
              >
                <img
                  :src="getPhotoUrl(photo.filePath)"
                  :alt="`Photo ${photo.order + 1}`"
                  class="h-full w-full object-cover transition-transform group-hover:scale-110"
                  loading="lazy"
                />
                <div
                  class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all group-hover:bg-opacity-30"
                >
                  <svg
                    class="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="prose max-w-none">
            <div class="whitespace-pre-wrap text-gray-700">{{ diary.content }}</div>
          </div>
        </div>

        <!-- Metadata Card -->
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <h3 class="mb-4 text-sm font-medium text-gray-900">일기 정보</h3>
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-500">사진 수</dt>
              <dd class="font-medium text-gray-900">{{ diary.photos?.length || 0 }}장</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">최종 수정</dt>
              <dd class="font-medium text-gray-900">{{ formatDateTime(diary.updatedAt) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">일기 ID</dt>
              <dd class="font-mono text-xs text-gray-600">{{ diary.diaryId }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- Photo Modal -->
    <Teleport to="body">
      <div
        v-if="selectedPhoto"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
        @click="closePhotoModal"
      >
        <button
          class="absolute right-4 top-4 text-white hover:text-gray-300"
          @click="closePhotoModal"
        >
          <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <img
          :src="getPhotoUrl(selectedPhoto.filePath)"
          :alt="`Photo ${selectedPhoto.order + 1}`"
          class="max-h-full max-w-full object-contain"
          @click.stop
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apiClient } from '../lib/axios';

const router = useRouter();
const route = useRoute();

interface Photo {
  photoId: string;
  filePath: string;
  thumbnailPath: string;
  fileSize: number;
  mimeType: string;
  order: number;
}

interface Diary {
  diaryId: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  photos?: Photo[];
}

const diary = ref<Diary | null>(null);
const isLoading = ref(true);
const error = ref('');
const selectedPhoto = ref<Photo | null>(null);

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getPhotoUrl = (filePath: string): string => {
  const region = import.meta.env.VITE_AWS_REGION || 'ap-northeast-2';
  const bucket = import.meta.env.VITE_AWS_S3_BUCKET || 'ai-date-diary';
  return `https://${bucket}.s3.${region}.amazonaws.com/${filePath}`;
};

const fetchDiary = async () => {
  try {
    isLoading.value = true;
    error.value = '';

    const diaryId = route.params.diaryId as string;
    const response = await apiClient.get(`/diaries/${diaryId}`);

    if (response.data.success) {
      diary.value = response.data.data.diary;
    } else {
      error.value = response.data.error?.message || '일기를 불러올 수 없습니다.';
    }
  } catch (err: any) {
    console.error('Failed to fetch diary:', err);
    if (err.response?.status === 404) {
      error.value = '일기를 찾을 수 없습니다.';
    } else {
      error.value = err.response?.data?.error?.message || '일기를 불러오는 중 오류가 발생했습니다.';
    }
  } finally {
    isLoading.value = false;
  }
};

const openPhotoModal = (photo: Photo) => {
  selectedPhoto.value = photo;
};

const closePhotoModal = () => {
  selectedPhoto.value = null;
};

const handleEdit = () => {
  router.push(`/diaries/${diary.value?.diaryId}/edit`);
};

const handleDelete = async () => {
  if (!diary.value) return;

  if (!confirm('정말로 이 일기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    return;
  }

  try {
    const response = await apiClient.delete(`/diaries/${diary.value.diaryId}`);

    if (response.data.success) {
      alert('일기가 삭제되었습니다.');
      router.push('/diaries');
    } else {
      alert(response.data.error?.message || '일기 삭제에 실패했습니다.');
    }
  } catch (err: any) {
    console.error('Failed to delete diary:', err);
    alert(err.response?.data?.error?.message || '일기 삭제 중 오류가 발생했습니다.');
  }
};

onMounted(() => {
  fetchDiary();
});
</script>
