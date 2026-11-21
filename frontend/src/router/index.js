import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue')
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('../views/TransactionsView.vue')
  },
  {
    path: '/add-transaction',
    name: 'AddTransaction',
    component: () => import('../views/AddTransactionView.vue')
  },
  {
    path: '/savings',
    name: 'Savings',
    component: () => import('../views/SavingsView.vue')
  },
  {
    path: '/add-saving',
    name: 'AddSaving',
    component: () => import('../views/AddSavingView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
