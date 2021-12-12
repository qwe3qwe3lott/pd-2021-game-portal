<template>
  <div class="game-body">
    <div class="game-wrapper">
      <nuxt-link class="button back-button" :to="'/'">
        Назад
      </nuxt-link>
      <form class="start-handler" @submit.prevent="createRoom">
        <modal-window v-if="showOptionsCard" :title="'Расширенные настройки'" @close="showOptionsCard = false">
          <template #content>
            <OptionsCard />
          </template>
        </modal-window>
        <button type="button" @click="showOptionsCard = true">
          Расширенные настройки
        </button>
        <input class="button" type="submit" value="Создать комнату">
        <p class="error">
          {{ errorMessage }}
        </p>
      </form>
      <p class="locationCounter">
        {{ requiredLocations.length }} из {{ locations.length }} локаций задействовано
      </p>
      <input
        v-model="filterText"
        class="filter-input"
        placeholder="Название локации для поиска"
        type="text"
      >
      <button class="button" @click="ACTIVATE_LOCATIONS">
        Выбрать все локации
      </button>
      <button class="button" @click="DEACTIVATE_LOCATIONS">
        Выключить все локации
      </button>
      <div class="cards">
        <LocationCreationCard
          v-for="(location, index) in filteredLocations"
          :id="location.id"
          :key="index"
          :title="location.title"
          :img="location.img"
          :roles="location.roles"
          :requires="location.requires"
        />
      </div>
      <button class="button" @click="ADD_LOCATION">
        Добавить локацию
      </button>
      <div class="file-block">
        <h2 class="file-title">
          Список локаций
        </h2>
        <label class="file-button">
          Импорт
          <input style="display: none" type="file" accept=".json" @change="importJSON">
        </label>
        <button class="file-button" @click="exportJSON">
          Экспорт
        </button>
        <p class="error">
          {{ importErrorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import FileSaver from 'file-saver'
import LocationCreationCard from '@/components/spy/LocationCreationCard'
import OptionsCard from '@/components/spy/OptionsCard'
export default {
  components: {
    LocationCreationCard,
    OptionsCard
  },
  layout: 'gameLayout',
  data () {
    return {
      errorMessage: '',
      locationsRequiredAtLess: 3,
      filterText: '',
      showOptionsCard: false,
      importErrorMessage: ''
    }
  },
  computed: {
    ...mapGetters('spy', ['getRequiredLocations', 'getLocationsForExportToJSON']),
    ...mapState('spy', ['roomOptions', 'locations']),
    filteredLocations () {
      const filterText = this.filterText
      return this.locations.filter(function (elem) {
        if (filterText === '') {
          return true
        } else {
          return elem.title.toLowerCase().includes(filterText.toLowerCase())
        }
      })
    },
    requiredLocations () {
      return this.locations.filter(elem => elem.requires)
    }
  },
  methods: {
    ...mapMutations('spy', ['REPLACE_LOCATIONS', 'ADD_LOCATION', 'ACTIVATE_LOCATIONS', 'DEACTIVATE_LOCATIONS']),
    exportJSON () {
      const data = JSON.stringify(this.getLocationsForExportToJSON)
      const blob = new Blob([data], { type: '' })
      FileSaver.saveAs(blob, 'LocationsList.json')
    },
    async importJSON (event) {
      this.importErrorMessage = ''
      if (!event.target.files[0]) {
        return
      }
      const file = event.target.files[0]
      const dataFromFile = await new Response(file).text()
      try {
        const locations = JSON.parse(dataFromFile).filter(location => typeof location.title === 'string' && typeof location.img === 'string')

        locations.forEach((location) => {
          location.roles.forEach((role, index) => {
            if (typeof role !== 'string') {
              location.roles[index] = ''
            }
          })
        })

        this.REPLACE_LOCATIONS(locations)
      } catch (e) {
        this.importErrorMessage = 'Ошибка при считывании данных JSON файла'
      }
    },
    async createRoom () {
      this.errorMessage = ''
      if (this.getRequiredLocations.length < this.locationsRequiredAtLess) {
        this.errorMessage = `Выбрано недостаточно локаций, необходимо выбрать как минимум ${this.locationsRequiredAtLess}`
        return
      }
      for (const location of this.getRequiredLocations) {
        if (location.title.trim() === '') {
          this.errorMessage = 'Задайте названия всем выбранным локациям'
          return
        }
        if (this.getRequiredLocations.filter(loc => loc.title === location.title).length > 1) {
          this.errorMessage = `Названия выбранных локаций не должны повторятся - ${location.title}`
          return
        }
        if (location.roles.filter(role => role.trim() !== '').length === 0) {
          this.errorMessage = `Укажите хотя бы одну роль на выбранной локацие - ${location.title}`
          return
        }
      }
      const originOptions = {
        owner: this.$store.state.username,
        locations: this.locations.filter(location => location.requires).map(location => ({
          title: location.title,
          img: location.img,
          roles: location.roles.filter(role => role.trim() !== '')
        })),
        options: {}
      }
      for (const option of this.roomOptions) {
        originOptions.options[option.key] = option.value
      }
      const res = await this.$back.posts.createRoom({
        originOptions,
        game: 'spy'
      })
      await this.$router.push({ path: `/spy/${res.data.roomId}` })
    }
  }
}
</script>

<style scoped>
.game-body{
  background: url("../../assets/svg/spy/background.webp") no-repeat center top fixed #FFFFFF;
  background-size: cover;
  display: flex;
}
.game-wrapper{
  background-color: rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 auto;
}
.filter-input{
  border-radius: 1em;
  width: 20em;
  padding: 0.5em;
}
.locationCounter {
  margin: 0.5em 0;
  color: white;
}
.start-handler {
  text-align: center;
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;

}
.back-button {
  align-self: flex-start;
}
.button {
  padding: 0.5em;
  background-color: var(--primary-color);
  color: var(--primary-color-primary-text);
  border-radius: 1em;
  margin: 0.3em;
}
.file-block {
  background-color: var(--primary-color);
  padding: 0.6em;
  border-radius: 1.5em;
  color: var(--primary-color-primary-text);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5em;
}
.cards {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  margin: 0 1em;
}
.file-title {
  text-align: center;
  grid-column: 1/3;
}
.file-button {
  font-size: 1em;
  cursor: pointer;
}
.error {
  text-shadow: 3px 0 3px red;
}
</style>
