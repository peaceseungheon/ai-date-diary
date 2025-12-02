<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader v-if="!isAuthPage" />

    <main class="flex-1">
      <slot />
    </main>

    <AppFooter v-if="!isAuthPage" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from './AppHeader.vue';
import AppFooter from './AppFooter.vue';

const route = useRoute();

const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/signup';
});
</script>
