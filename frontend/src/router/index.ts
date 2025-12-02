import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/pages/Signup.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/diaries',
    name: 'DiaryList',
    component: () => import('@/pages/DiaryList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/diaries/new',
    name: 'CreateDiary',
    component: () => import('@/pages/CreateDiary.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/diaries/:diaryId',
    name: 'DiaryDetail',
    component: () => import('@/pages/DiaryDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    redirect: '/diaries',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (
    !requiresAuth &&
    authStore.isAuthenticated &&
    (to.path === '/login' || to.path === '/signup')
  ) {
    next('/diaries');
  } else {
    next();
  }
});

export default router;
