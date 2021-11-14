export const state = () => ({
  // TODO: вынести данные на бек
  locations: [
    { id: 0, title: 'Больница', img: 'https://portal-games-pd.ru/spy/originLocations/hospital.webp', roles: ['Медсестра', 'Терапевт', 'Бабушка', 'Призывник', 'Хирург', 'Офтальмолог', 'Уборщик', 'Пациент', 'Студент', 'Охранник'], requires: true },
    { id: 1, title: 'Школа', img: 'https://portal-games-pd.ru/spy/originLocations/school.webp', roles: ['Учительница', 'Школьник', 'Директор', 'Уборщик', 'Охранник', 'Трудовик', 'Учитель физкультуры', 'Двоечник', 'Отличник', 'Староста'], requires: true },
    { id: 2, title: 'Парк', img: 'https://portal-games-pd.ru/spy/originLocations/park.webp', roles: ['Прохожий', 'Продавец хот-догов', 'Патрульный', 'Собака', 'Безработный', 'Читатель', 'Спортсмен', 'Активист', 'Садовник', 'Дворник'], requires: true },
    { id: 3, title: 'Тюрьма', img: 'https://portal-games-pd.ru/spy/originLocations/prison.webp', roles: ['Дедушка', 'Заключённый', 'Охранник', 'Уборщик', 'Повар', 'Директор', 'Надзиратель', 'Палач', 'Адвокат', 'Трейдер'], requires: true },
    { id: 4, title: 'Церковь', img: 'https://portal-games-pd.ru/spy/originLocations/church.webp', roles: ['Батюшка', 'Верующий', 'Поп', 'Ребёнок', 'Уборщик', 'Атеист', 'Иудей', 'Христианин', 'Католик', 'Буддист'], requires: true },
    { id: 5, title: 'Вокзал', img: 'https://portal-games-pd.ru/spy/originLocations/railwayStation.webp', roles: ['Уборщик', 'Охранник', 'Билетёр', 'Контроллёр', 'Машинист', 'Проводник', 'Пассажир', 'Кассир', 'Таможенник', 'Буфетчица'], requires: true },
    { id: 6, title: 'Продуктовый', img: 'https://portal-games-pd.ru/spy/originLocations/grocery.webp', roles: ['Уборщик', 'Охранник', 'Кассир', 'Администратор', 'Грузчик', 'Покупатель', 'Расфасовщик', 'Пенсионер', 'Безработный', 'Мерчендайзер'], requires: true },
    { id: 7, title: 'Торговый центер', img: 'https://portal-games-pd.ru/spy/originLocations/shoppingСenter.webp', roles: ['Покупатель', 'Бизнесмен', 'Охранник', 'Безработный', 'Школьник', 'Студент', 'Многодетная мать', 'Кассир', 'Мороженщик', 'Консультант'], requires: true },
    { id: 8, title: 'Зоопарк', img: 'https://portal-games-pd.ru/spy/originLocations/zoo.webp', roles: ['Уборщик', 'Охранник', 'Обезьяна', 'Слон', 'Ребенок', 'Кассир', 'Жираф', 'Пингвин', 'Посетитель', 'Директор'], requires: true },
    { id: 9, title: 'Каток', img: 'https://portal-games-pd.ru/spy/originLocations/iceRink.webp', roles: ['Кассир', 'Конькобежец', 'Посетитель', 'Фигурист', 'Тренер', 'Уборщик', 'Кёрлингист', 'Хоккеист', 'Болельщик', 'Ребенок'], requires: true },
    { id: 10, title: 'Метро', img: 'https://portal-games-pd.ru/spy/originLocations/subway.webp', roles: ['Дедушка', 'Бабушка', 'Ребенок', 'Машинист', 'Бездомный', 'Кассир', 'Читатель газеты', 'Патрульный', 'Проверяющий багаж', 'Пассажир'], requires: true },
    { id: 11, title: 'Поле боя', img: 'https://portal-games-pd.ru/spy/originLocations/battlefield.webp', roles: ['Рядовой', 'Солдат', 'Офицер', 'Наводчик', 'Артеллерист', 'Снайпер', 'Разведчик', 'Пилот', 'Гражданский', 'Противник'], requires: true },
    { id: 12, title: 'Музей', img: 'https://portal-games-pd.ru/spy/originLocations/museum.webp', roles: ['Экскурсовод', 'Сноб', 'Охранник', 'Уборщик', 'Директор', 'Кассир', 'Посетитель', 'Льготник', 'Учительница', 'Школьник'], requires: true },
    { id: 13, title: 'Театр', img: 'https://portal-games-pd.ru/spy/originLocations/theatre.webp', roles: ['Кассир', 'Охранник', 'Уборщик', 'Конферансье', 'Зритель', 'Артист', 'Гардеробщик', 'Реквизитор', 'Гримёр', 'Суфлёр'], requires: true },
    { id: 14, title: 'Кладбище', img: 'https://portal-games-pd.ru/spy/originLocations/graveyard.webp', roles: ['Охранник', 'Погребальщик', 'Плакальщик', 'Поминальщик', 'Гость', 'Гробовщик', 'Полицейский', 'Ритуальный агент', 'Бальзамировщик', 'Крематор'], requires: true },
    { id: 15, title: 'Офис', img: 'https://portal-games-pd.ru/spy/originLocations/office.webp', roles: ['Работник', 'Начальник отдела', 'Директор', 'Курьер', 'Секретарь', 'Электрик', 'Сторож', 'Уборщик', 'Архивариус', 'Аудитор'], requires: true },
    { id: 16, title: 'Ферма', img: 'https://portal-games-pd.ru/spy/originLocations/farm.webp', roles: ['Фермер', 'Владелец', 'Волк', 'Курица', 'Петух', 'Коза', 'Сосед', 'Корова', 'Утка', 'Лошадь'], requires: true },
    { id: 17, title: 'Кинотеатр', img: 'https://portal-games-pd.ru/spy/originLocations/cinema.webp', roles: ['Кассир', 'Билетёр', 'Зритель', 'Дебашир', 'Охранник', 'Уборщик', 'Администратор', 'Режисёр', 'Нарушитель', 'Подросток'], requires: true },
    { id: 18, title: 'Городской мост', img: 'https://portal-games-pd.ru/spy/originLocations/cityBridge.webp', roles: ['Прохожий', 'Трюкач', 'Продавец шариков', 'Бездомный', 'Полицейский', 'Клоун', 'Фокусник', 'Музыкант', 'Солист', 'Зазывала'], requires: true },
    { id: 19, title: 'Шахта', img: 'https://portal-games-pd.ru/spy/originLocations/mine.webp', roles: ['Шахтёр', 'Проходчик', 'Слесарь', 'Машинист', 'Рудокоп', 'Взрывник', 'Монтажник', 'Доставщик', 'Экскурсовод', 'Ребенок'], requires: true }
  ],
  counter: 20,
  roomOptions: [
    { key: 'spiesCount', value: 1, min: 1, max: 100, description: 'Количество шпионов' },
    { key: 'spyWinPoints', value: 4, min: 0, max: 100, description: 'Количество очков, начисляемых шпиону за победу' },
    { key: 'spyTimeoutPoints', value: 1, min: 0, max: 100, description: 'Количество очков, начисляемых шпиону за тайм-аут' },
    { key: 'playerWinPoints', value: 1, min: 0, max: 100, description: 'Количество очков, начисляемых не шпиону за победу' },
    { key: 'playerBonusPoints', value: 1, min: 0, max: 100, description: 'Количество очков, начисляемых не шпиону за победу после инициирования голосования' },
    { key: 'playerTimeoutPoints', value: 0, min: 0, max: 100, description: 'Количество очков, начисляемых не шпиону за тайм-аут' },
    { key: 'winScore', value: 10, min: 1, max: 100, description: 'Количество очков для победы' },
    { key: 'roundTime', value: 600, min: 5, max: 1000, description: 'Количество секунд раунда' },
    { key: 'votingTime', value: 20, min: 5, max: 60, description: 'Количество секунд голосования' },
    { key: 'briefTime', value: 7, min: 5, max: 60, description: 'Количество секунд перерыва' },
    { key: 'spyChanceTime', value: 10, min: 5, max: 60, description: 'Количество секунд для шпиона после раскрытия' }
  ]
})

export const getters = {
  getLocationsForExportToJSON: state => state.locations.map(location => ({ title: location.title, img: location.img, roles: location.roles })),
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
  ADD_LOCATION: (state) => {
    if (state.locations.length < 100) {
      state.locations.push({ id: state.counter++, title: '', img: '', roles: Array(5).fill(''), requires: true })
    }
  },
  REPLACE_LOCATIONS: (state, locations) => {
    locations.forEach((location, index) => {
      if (location.roles.length !== 10) {
        location.roles = ['', '', '', '', '', '', '', '', '', '']
      }
      location.id = index
      location.requires = true
    })
    state.locations = locations
    state.counter = locations.length
  },
  UPDATE_ROLE: (state, payload) => {
    const location = state.locations.find(loc => loc.id === payload.locationId)
    if (!location) { return }
    location.roles[payload.index] = payload.role
  },
  UPDATE_TITLE: (state, payload) => {
    const location = state.locations.find(loc => loc.id === payload.locationId)
    if (!location) { return }
    location.title = payload.title
  },
  UPDATE_IMAGE: (state, payload) => {
    const location = state.locations.find(loc => loc.id === payload.locationId)
    if (!location) { return }
    location.img = payload.image
  },
  DELETE_LOCATION: (state, payload) => {
    state.locations = state.locations.filter(location => location.id !== payload.locationId)
  },
  ACTIVATE_LOCATIONS: (state) => {
    state.locations.forEach((location) => {
      location.requires = true
    })
  },
  DEACTIVATE_LOCATIONS: (state) => {
    state.locations.forEach((location) => {
      location.requires = false
    })
  }
}
