import { createRouter, createWebHistory ,createWebHashHistory} from 'vue-router'
// import Layout from '../Layout.vue'
// import aboutAccumbens from '@/pages/about-accumbens.vue'
// import HomeView from '@/pages/home.vue'
// import contents from '@/pages/contents.vue'
// import settings from '@/pages/settings.vue'
// import page404 from '@/pages/404.vue'

// import { routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/about-accumbens',
      name: 'about-accumbens',
      // component: aboutAccumbens
      component: () => import('@/pages/about-accumbens.vue')
    },
    {
      path: '/',
      name: 'home',
      // component: HomeView
      component: () => import('@/pages/home.vue')
    },
    {
      path: '/contents',
      name: 'contents',
      // component: contents
      component: () => import('@/pages/contents.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      // component: settings
      component: () => import('@/pages/settings.vue')
    },
    {
      path: '/404',
      name: '404',
      // component: page404
      component: () => import('@/pages/404.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'layout',
      // component: Layout,
      component: () => import('@/Layout.vue')
    }
  ]
})



export default router
