<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900">Date Diary</h1>
        <p class="mt-2 text-gray-600">우리의 특별한 데이트를 기록해보세요</p>
      </div>

      <div class="rounded-lg bg-white p-8 shadow-md">
        <h2 class="mb-6 text-2xl font-bold text-gray-900">회원가입</h2>

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
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <div>
            <label for="nickname" class="block text-sm font-medium text-gray-700">닉네임</label>
            <input
              type="text"
              id="nickname"
              v-model="formData.nickname"
              @input="clearError('nickname')"
              :class="[
                'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2',
                errors.nickname
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              ]"
              placeholder="닉네임 (2~20자)"
              :disabled="isLoading"
            />
            <p v-if="errors.nickname" class="mt-1 text-sm text-red-600">{{ errors.nickname }}</p>
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
              placeholder="최소 8자 이상"
              :disabled="isLoading"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <div>
            <label for="passwordConfirm" class="block text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              type="password"
              id="passwordConfirm"
              v-model="formData.passwordConfirm"
              @input="clearError('passwordConfirm')"
              :class="[
                'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2',
                errors.passwordConfirm
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              ]"
              placeholder="비밀번호를 다시 입력하세요"
              :disabled="isLoading"
            />
            <p v-if="errors.passwordConfirm" class="mt-1 text-sm text-red-600">
              {{ errors.passwordConfirm }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ isLoading ? '처리 중...' : '회원가입' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            로그인
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
  passwordConfirm: '',
  nickname: '',
});

const errors = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
  nickname: '',
  general: '',
});

const clearError = (field: keyof typeof errors) => {
  errors[field] = '';
};

const validateForm = (): boolean => {
  // Reset errors
  Object.keys(errors).forEach((key) => {
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
  } else if (formData.password.length < 8) {
    errors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
    isValid = false;
  }

  // Password confirmation
  if (!formData.passwordConfirm) {
    errors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    isValid = false;
  } else if (formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    isValid = false;
  }

  // Nickname validation
  if (!formData.nickname) {
    errors.nickname = '닉네임을 입력해주세요.';
    isValid = false;
  } else if (formData.nickname.length < 2 || formData.nickname.length > 20) {
    errors.nickname = '닉네임은 2~20자 사이여야 합니다.';
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
    const response = await apiClient.post('/auth/signup', {
      email: formData.email,
      password: formData.password,
      nickname: formData.nickname,
    });

    if (response.data.success) {
      const { token, user } = response.data.data;
      authStore.login(token, user);
      router.push('/diaries');
    }
  } catch (error: any) {
    if (error.response?.data?.error) {
      const errorData = error.response.data.error;

      if (errorData.code === 'EMAIL_ALREADY_EXISTS') {
        errors.email = '이미 등록된 이메일입니다.';
      } else if (errorData.code === 'VALIDATION_ERROR' && errorData.details) {
        errorData.details.forEach((detail: any) => {
          if (detail.path && detail.path in errors) {
            errors[detail.path as keyof typeof errors] = detail.msg;
          }
        });
      } else {
        errors.general = errorData.message || '회원가입에 실패했습니다.';
      }
    } else {
      errors.general = '서버와 통신 중 오류가 발생했습니다.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
