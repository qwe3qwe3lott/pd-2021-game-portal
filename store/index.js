export const state = () => ({
  username: null,
  anyGameIsRunningFlag: false
})

export const mutations = {
  SET_USERNAME: (state, username) => { state.username = username },
  SET_ANY_GAME_IS_RUNNING_FLAG: (state, flag) => { state.anyGameIsRunningFlag = flag }
}
