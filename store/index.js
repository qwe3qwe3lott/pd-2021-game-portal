export const state = () => ({
  oldUsername: null,
  username: null,
  anyGameIsRunningFlag: false,
  gameDescriptions: [
    { key: 'spy', description: 'Игра \'Шпион\' построена на блефе, интуиции и внимательности — это игра, в которой важнее всего, что говорят и думают игроки. На каждый раунд даётся 8 минут (но вы сами можете решить, сколько вам нужно времени). Если шпиону удастся раньше разгадать локацию, он может остановить игру, раскрыться и получить дополнительные очки, если окажется прав. Если он ошибся в ответе или сам задал неуместный вопрос, его могут заподозрить в шпионаже, и если все вместе проголосуют за то, что шпион — он, его выгонят, даже если он окажется простым мирным жителем.' }
  ]
})

export const mutations = {
  SET_USERNAME: (state, payload) => {
    state.oldUsername = state.username
    state.username = payload.username
  },
  SET_ANY_GAME_IS_RUNNING_FLAG: (state, flag) => { state.anyGameIsRunningFlag = flag }
}
