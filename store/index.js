export const state = () => ({
  username: null
})

export const getters = {
  getUsername: state => state.username
}
export const mutations = {
  SET_USERNAME: (state, username) => { state.username = username }
}
