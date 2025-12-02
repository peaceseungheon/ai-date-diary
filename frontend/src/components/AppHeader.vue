<template>
  <header class="bg-white shadow-sm">
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2">
            <svg
              class="h-8 w-8 text-blue-600"
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
            <span class="text-xl font-bold text-gray-900">Date Diary</span>
          </router-link>
        </div>

        <!-- Navigation -->
        <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
          <router-link
            to="/diaries"
            class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
            :class="{ 'bg-blue-50 text-blue-600': isActive('/diaries') }"
          >
            일기 목록
          </router-link>
          <router-link
            to="/diaries/new"
            class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
            :class="{ 'bg-blue-50 text-blue-600': isActive('/diaries/new') }"
          >
            일기 작성
          </router-link>

          <!-- User Menu -->
          <div class="relative ml-3">
            <button
              @click="toggleUserMenu"
              class="flex items-center space-x-2 rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{{ authStore.user?.nickname }}</span>
              <svg
                class="h-4 w-4"
                :class="{ 'rotate-180': isUserMenuOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="isUserMenuOpen"
                class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
              >
                <div class="border-b px-4 py-2 text-xs text-gray-500">
                  {{ authStore.user?.email }}
                </div>
                <button
                  @click="handleLogout"
                  class="block w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                >
                  로그아웃
                </button>
              </div>
            </transition>
          </div>
        </div>

        <!-- Guest Navigation -->
        <div v-else class="flex items-center space-x-2">
          <router-link
            to="/login"
            class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
          >
            로그인
          </router-link>
          <router-link
            to="/signup"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            회원가입
          </router-link>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isUserMenuOpen = ref(false);

const isActive = (path: string) => {
  if (path === '/diaries') {
    return (
      route.path === '/diaries' ||
      (route.path.startsWith('/diaries/') && route.path !== '/diaries/new')
    );
  }
  return route.path === path;
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const handleLogout = () => {
  authStore.logout();
  isUserMenuOpen.value = false;
  router.push('/login');
};

const closeUserMenuOnClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    isUserMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeUserMenuOnClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenuOnClickOutside);
});
</script>
