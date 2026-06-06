import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/orders',
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue'),
    meta: { title: '订单管理' },
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { title: '订单详情' },
  },
  {
    path: '/materials',
    name: 'Materials',
    component: () => import('@/views/Materials.vue'),
    meta: { title: '用料核算' },
  },
  {
    path: '/tenons',
    name: 'Tenons',
    component: () => import('@/views/Tenons.vue'),
    meta: { title: '榫卯图库' },
  },
  {
    path: '/crafts',
    name: 'Crafts',
    component: () => import('@/views/Crafts.vue'),
    meta: { title: '工艺档案' },
  },
  {
    path: '/crafts/:id',
    name: 'CraftDetail',
    component: () => import('@/views/CraftDetail.vue'),
    meta: { title: '工艺详情' },
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/Statistics.vue'),
    meta: { title: '统计分析' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  document.title = `${to.meta.title || '木匠工坊'} - 传统木匠工坊管理系统`;
});

export default router;
