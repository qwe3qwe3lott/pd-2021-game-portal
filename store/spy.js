export const state = () => ({
  locations: [
    {
      title: 'Парк',
      img: 'url',
      roles: [
        'Бабка',
        'Дед'
      ],
      requires: true
    },
    {
      title: 'Дом',
      img: 'url',
      roles: [
        'Кот',
        'Собака'
      ],
      requires: true
    },
    {
      title: 'Африка',
      img: 'url',
      roles: [
        'Слон',
        'Носорог'
      ],
      requires: true
    }
  ]
})

export const getters = {
  getLocations: state => state.locations
}
export const mutations = {
  UPDATE_REQUIRE_LOCATION_FLAG: (state, { locationTitle, flag }) => {
    for (const location of state.locations) {
      if (location.title === locationTitle) {
        location.requires = flag
      }
    }
  }
}
