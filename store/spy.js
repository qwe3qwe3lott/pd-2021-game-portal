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
  counter: 3
})

export const getters = {
  getLocations: state => state.locations,
  getRequiredLocations: state => state.locations.filter(location => location.requires)
}
export const mutations = {
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
  UPLOAD_LOCATION (state, payload) {
    state.locations = payload
    state.counter = payload.length
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
