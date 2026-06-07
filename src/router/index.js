import { createRouter, createWebHistory } from 'vue-router'

import Sender from '../components/Sender.vue'
import Receiver from '../components/Receiver.vue'
import webCam from '../components/webCam.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/sender',
      component: Sender,
    },
    {
      path: '/receiver',
      component: Receiver,
    },
    {
      path: '/webCam',
      component: webCam,
    },
    {
      path: '/',
      redirect: '/sender',
    },
  ],
})

export default router