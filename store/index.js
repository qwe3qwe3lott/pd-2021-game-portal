export const state = () => ({
  oldUsername: null,
  username: null,
  anyGameIsRunningFlag: false
})

export const mutations = {
  SET_USERNAME: (state, payload) => {
    state.oldUsername = state.username
    state.username = payload.username
  },
  SET_ANY_GAME_IS_RUNNING_FLAG: (state, flag) => { state.anyGameIsRunningFlag = flag }
}
