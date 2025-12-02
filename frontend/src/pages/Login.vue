<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900">Date Diary</h1>
        <p class="mt-2 text-gray-600">우리의 특별한 데이트를 기록해보세요</p>
      </div>

      <div class="rounded-lg bg-white p-8 shadow-md">
        <h2 class="mb-6 text-2xl font-bold text-gray-900">로그인</h2>

        <div v-if="errors.general" class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {{ errors.general }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              @input="clearError('email')"
              :class="[
                'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2',
                errors.email
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              ]"
              placeholder="example@email.com"
              :disabled="isLoading"
              autocomplete="email"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">비밀번호</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              @input="clearError('password')"
              :class="[
                'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2',
                errors.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              ]"
              placeholder="비밀번호"
              :disabled="isLoading"
              autocomplete="current-password"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {{ isLoading ? '처리 중...' : '로그인' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
          계정이 없으신가요?
          <router-link to="/signup" class="font-medium text-blue-600 hover:text-blue-500">
            회원가입
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { apiClient } from '@/lib/axios';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const formData = reactive({
  email: '',
  password: '',
});

const errors = reactive({
  email: '',
  password: '',
  general: '',
});

const clearError = (field: keyof typeof errors) => {
  errors[field] = '';
};

const validateForm = (): boolean => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });

  let isValid = true;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    errors.email = '이메일을 입력해주세요.';
    isValid = false;
  } else if (!emailRegex.test(formData.email)) {
    errors.email = '유효한 이메일 형식이 아닙니다.';
    isValid = false;
  }

  // Password validation
  if (!formData.password) {
    errors.password = '비밀번호를 입력해주세요.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  errors.general = '';

  try {
    const response = await apiClient.post('/auth/login', {
      email: formData.email,
      password: formData.password,
    });

    if (response.data.success) {
      const { token, user } = response.data.data;
      authStore.login(token, user);
      router.push('/diaries');
    }
  } catch (error: any) {
    if (error.response?.data?.error) {
      const errorData = error.response.data.error;

      if (errorData.code === 'INVALID_CREDENTIALS') {
        errors.general = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (errorData.code === 'VALIDATION_ERROR' && errorData.details) {
        errorData.details.forEach((detail: any) => {
          if (detail.path && detail.path in errors) {
            errors[detail.path as keyof typeof errors] = detail.msg;
          }
        });
      } else {
        errors.general = errorData.message || '로그인에 실패했습니다.';
      }
    } else {
      errors.general = '서버와 통신 중 오류가 발생했습니다.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
