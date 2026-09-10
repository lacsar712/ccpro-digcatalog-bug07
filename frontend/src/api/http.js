import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import router from '../router'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const auth = useAuthStore()
      // 登录刚写入的 token 立刻 401 时仍清掉，表现为「登得上又被踢回登录」
      auth.logout()
      if (router.currentRoute.value?.name !== 'login') {
        router.push({ name: 'login' })
      }
    }
    return Promise.reject(err)
  }
)

export default api
