const axios = require('axios')
const getters = require('./getters')
const posts = require('./posts')

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://portal-games-pd.ru/api' : 'http://localhost:3000/api',
  headers: {
    accept: 'applications/json'
  }
})

module.exports = {
  getters: getters(instance),
  posts: posts(instance)
}
