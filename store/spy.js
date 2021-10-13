export const state = () => ({
  locations: [
    {
      id: 0,
      title: 'Парк',
      img: 'url',
      roles: [
        'Бабка', 'Дед', '', '', '', '', '', '', '', ''
      ],
      requires: true
    },
    {
      id: 1,
      title: 'Дом',
      img: 'url',
      roles: [
        'Кот', 'Собака', '', '', '', '', '', '', '', ''
      ],
      requires: true
    },
    {
      id: 2,
      title: 'Африка',
      img: 'url',
      roles: [
        'Слон', 'Носорог', '', '', '', '', '', '', '', ''
      ],
      requires: true
    }
  ],
  counter: 3,
  roomOptions: [
    { key: 'spiesCount', value: 1, min: 1, max: 100, description: 'Количество шпионов' },
    { key: 'spyWinPoints', value: 4, min: 0, max: 100, description: 'Количество очков, начисляемых шпиону за победу' },
    { key: 'spyTimeoutPoints', value: 2, min: 0, max: 100, description: 'Количество очков, начисляемых шпиону за тайм-аут' },
    { key: 'playerWinPoints', value: 1, min: 0, max: 100, description: 'Количество очков, начисляемых не шпиону за победу' },
    { key: 'playerBonusPoints', value: 2, min: 0, max: 100, description: 'Количество очков, начисляемых не шпиону за победу после инициирования голосования' },
    { key: 'playerTimeoutPoints', value: 0, min: 0, max: 100, description: 'Количество очков, начисляемых не шпиону за тайм-аут' },
    { key: 'winScore', value: 10, min: 1, max: 100, description: 'Количество очков для победы' },
    { key: 'roundTime', value: 60, min: 5, max: 1000, description: 'Количество секунд раунда' },
    { key: 'votingTime', value: 10, min: 5, max: 60, description: 'Количество секунд голосования' },
    { key: 'briefTime', value: 5, min: 5, max: 60, description: 'Количество секунд перерыва' },
    { key: 'spyChanceTime', value: 10, min: 5, max: 60, description: 'Количество секунд для шпиона после раскрытия' }
  ]
})

export const getters = {
  getLocations: state => state.locations,
  getRequiredLocations: state => state.locations.filter(location => location.requires)
}
export const mutations = {
  UPDATE_ROOM_OPTION: (state, payload) => {
    const roomOption = state.roomOptions.find(option => option.key === payload.optionKey)
    if (!roomOption) { return }
    roomOption.value = payload.value
  },
  UPDATE_REQUIRE_LOCATION_FLAG: (state, payload) => {
    const location = state.locations.find(loc => loc.id === payload.locationId)
    if (!location) { return }
    location.requires = payload.flag
  },
  ADD_LOCATION (state, payload) {
    if (state.locations.length < 100) {
      state.locations.push(
        {
          id: state.counter++,
          title: payload.name,
          img: payload.url,
          roles: payload.roles,
          requires: true
        })
    }
  },
  UPDATE_ROLE (state, payload) {
    const location = state.locations.find(loc => loc.id === payload.locationId)
    if (!location) { return }
    location.roles[payload.index] = payload.role
  },
  UPDATE_TITLE (state, payload) {
    const location = state.locations.find(loc => loc.id === payload.locationId)
    if (!location) { return }
    location.title = payload.title
  },
  UPDATE_IMAGE (state, payload) {
    const location = state.locations.find(loc => loc.id === payload.locationId)
    if (!location) { return }
    location.img = payload.image
  },
  DELETE_LOCATION (state, payload) {
    state.locations = state.locations.filter(location => location.id !== payload.locationId)
  }
}
