import consolaGlobalInstance from 'consola'
import getters from './getters'
import posts from '@/plugins/api/posts'

export default function ({ $axios }, inject) {
  const instance = $axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? 'https://portal-games-pd.ru/api' : 'http://localhost:3000/api',
    headers: {
      accept: 'applications/json'
    }
  })

  instance.onRequest((config) => {
    consolaGlobalInstance.log('Making request to ' + config.url)
  })

  inject('back', {
    getters: getters(instance),
    posts: posts(instance)
  })
}
