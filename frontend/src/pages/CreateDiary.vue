<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">새 일기 작성</h1>
        <p class="mt-2 text-gray-600">데이트의 추억을 기록해보세요</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="success" class="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
        일기가 성공적으로 생성되었습니다!
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="rounded-lg bg-white p-8 shadow-sm">
        <div class="space-y-6">
          <!-- Date Picker -->
          <div>
            <label for="date" class="mb-2 block text-sm font-medium text-gray-700">
              데이트 날짜 <span class="text-red-500">*</span>
            </label>
            <input
              id="date"
              v-model="formData.date"
              type="date"
              required
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              :max="today"
            />
          </div>

          <!-- Title -->
          <div>
            <label for="title" class="mb-2 block text-sm font-medium text-gray-700">
              제목 <span class="text-red-500">*</span>
            </label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              required
              maxlength="200"
              placeholder="예: 한강 데이트"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <p class="mt-1 text-xs text-gray-500">{{ formData.title.length }}/200</p>
          </div>

          <!-- Content -->
          <div>
            <label for="content" class="mb-2 block text-sm font-medium text-gray-700">
              내용 <span class="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              v-model="formData.content"
              rows="10"
              required
              maxlength="10000"
              placeholder="오늘의 데이트는 어땠나요? 함께한 시간의 추억을 자유롭게 적어보세요."
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            ></textarea>
            <p class="mt-1 text-xs text-gray-500">{{ formData.content.length }}/10000</p>
          </div>

          <!-- Photo Upload Area -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              사진 업로드 (선택사항, 1~10장)
            </label>

            <!-- File Input -->
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*"
              @change="handleFileSelect"
              class="hidden"
            />

            <!-- Upload Area or Preview -->
            <div v-if="selectedFiles.length === 0">
              <div
                @click="triggerFileInput"
                @drop.prevent="handleDrop"
                @dragover.prevent
                @dragenter.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                :class="[
                  'mt-2 flex cursor-pointer justify-center rounded-lg border border-dashed px-6 py-10 transition-colors',
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400',
                ]"
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
                  <div class="mt-4 text-sm text-gray-600">
                    <span class="font-medium text-blue-600">파일 선택</span>
                    <span class="pl-1">또는 드래그 앤 드롭</span>
                  </div>
                  <p class="mt-2 text-xs text-gray-500">PNG, JPG, HEIC 최대 10MB (최대 10장)</p>
                </div>
              </div>
            </div>

            <!-- Photo Preview Grid -->
            <div v-else class="mt-2 space-y-3">
              <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <div
                  v-for="(file, index) in selectedFiles"
                  :key="index"
                  class="group relative aspect-square overflow-hidden rounded-lg border border-gray-200"
                >
                  <img
                    :src="file.preview"
                    :alt="`Preview ${index + 1}`"
                    class="h-full w-full object-cover"
                  />

                  <!-- Upload Progress Overlay -->
                  <div
                    v-if="uploadProgress[index] !== undefined && uploadProgress[index] < 100"
                    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
                  >
                    <div class="text-center">
                      <div class="text-sm font-medium text-white">{{ uploadProgress[index] }}%</div>
                      <div class="mt-2 h-1 w-20 overflow-hidden rounded-full bg-gray-700">
                        <div
                          class="h-full bg-blue-500 transition-all duration-300"
                          :style="{ width: `${uploadProgress[index]}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <!-- Remove Button -->
                  <button
                    v-if="!uploading"
                    @click="removeFile(index)"
                    type="button"
                    class="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Add More Button -->
              <button
                v-if="selectedFiles.length < 10 && !uploading"
                @click="triggerFileInput"
                type="button"
                class="w-full rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
              >
                + 사진 추가 ({{ selectedFiles.length }}/10)
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="handleCancel"
              :disabled="loading || uploading"
              class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              :disabled="loading || uploading || !isFormValid"
              class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ loading ? '저장 중...' : uploading ? '업로드 중...' : '일기 저장' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { apiClient } from '../lib/axios';

const router = useRouter();
const fileInput = ref<HTMLInputElement | null>(null);

interface SelectedFile {
  file: File;
  preview: string;
}

const formData = ref({
  title: '',
  content: '',
  date: new Date().toISOString().split('T')[0],
});

const selectedFiles = ref<SelectedFile[]>([]);
const uploadProgress = ref<{ [key: number]: number }>({});
const isDragging = ref(false);
const loading = ref(false);
const uploading = ref(false);
const error = ref('');
const success = ref(false);
const uploadId = ref<string | null>(null);

const today = computed(() => new Date().toISOString().split('T')[0]);

const isFormValid = computed(() => {
  return (
    formData.value.title.trim().length > 0 &&
    formData.value.content.trim().length > 0 &&
    formData.value.date.length > 0
  );
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    addFiles(Array.from(target.files));
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files));
  }
};

const addFiles = (files: File[]) => {
  const remainingSlots = 10 - selectedFiles.value.length;
  const filesToAdd = files.slice(0, remainingSlots);

  filesToAdd.forEach(file => {
    if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
      const preview = URL.createObjectURL(file);
      selectedFiles.value.push({ file, preview });
    } else if (file.size > 10 * 1024 * 1024) {
      error.value = '파일 크기는 10MB를 초과할 수 없습니다.';
    }
  });
};

const removeFile = (index: number) => {
  URL.revokeObjectURL(selectedFiles.value[index].preview);
  selectedFiles.value.splice(index, 1);
  delete uploadProgress.value[index];
};

const uploadPhotos = async (): Promise<string | null> => {
  if (selectedFiles.value.length === 0) return null;

  uploading.value = true;
  error.value = '';

  try {
    // Create FormData with all files
    const formDataObj = new FormData();
    selectedFiles.value.forEach((selectedFile, index) => {
      formDataObj.append('photos', selectedFile.file);
      uploadProgress.value[index] = 0;
    });

    // Upload files directly to server
    const response = await apiClient.post('/diaries/upload-photos', formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Update all file progress (since it's a single request)
          selectedFiles.value.forEach((_, index) => {
            uploadProgress.value[index] = progress;
          });
        }
      },
    });

    uploadId.value = response.data.uploadSessionId;
    return response.data.uploadSessionId;
  } catch (err: any) {
    console.error('Photo upload failed:', err);
    error.value = '사진 업로드에 실패했습니다. 다시 시도해주세요.';
    return null;
  } finally {
    uploading.value = false;
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = '모든 필수 항목을 입력해주세요.';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = false;

  try {
    // Upload photos if selected
    let sessionId = uploadId.value;
    if (selectedFiles.value.length > 0 && !sessionId) {
      sessionId = await uploadPhotos();
      if (!sessionId) {
        return; // Upload failed, error already set
      }
    }

    // Create diary
    const response = await apiClient.post('/diaries', {
      title: formData.value.title.trim(),
      content: formData.value.content.trim(),
      date: formData.value.date,
      uploadId: sessionId,
    });

    if (response.data.success) {
      success.value = true;

      // Clean up previews
      selectedFiles.value.forEach(sf => URL.revokeObjectURL(sf.preview));

      // Redirect to diary detail page after 1 second
      setTimeout(() => {
        router.push(`/diaries/${response.data.data.diary.diaryId}`);
      }, 1000);
    }
  } catch (err: any) {
    console.error('Failed to create diary:', err);

    if (err.response?.data?.error) {
      error.value = err.response.data.error.message || '일기 생성에 실패했습니다.';
    } else {
      error.value = '일기 생성 중 오류가 발생했습니다. 다시 시도해주세요.';
    }
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  if (formData.value.title || formData.value.content || selectedFiles.value.length > 0) {
    if (confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
      selectedFiles.value.forEach(sf => URL.revokeObjectURL(sf.preview));
      router.back();
    }
  } else {
    router.back();
  }
};
</script>
