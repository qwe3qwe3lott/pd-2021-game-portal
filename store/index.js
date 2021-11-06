export const state = () => ({
  username: null
})

export const getters = {
  getUsername: (state) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('username') || state.username
    }
    return state.username
  }
}
export const mutations = {
  SET_USERNAME: (state, username) => {
    state.username = username
    localStorage.setItem('username', username)
  }
}
