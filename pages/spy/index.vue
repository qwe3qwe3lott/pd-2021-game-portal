<template>
  <div class="game-body">
    <div class="game-wrapper">
      <nuxt-link class="button back-button" :to="'/'">
        Назад
      </nuxt-link>
      <OptionsCard />
      <form class="start-handler" @submit.prevent="createRoom">
        <input class="start-button" type="submit" value="Создать комнату">
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
      <LocationCreationCard
        v-for="(location, index) in filteredLocations"
        :id="location.id"
        :key="index"
        :title="location.title"
        :img="location.img"
        :roles="location.roles"
        :requires="location.requires"
      />
      <button class="button" @click="ADD_LOCATION">
        Добавить локацию
      </button>
      <div class="export-list-location">
        <button class="button" @click="exportJSON">
          Экспорт списка локаций
        </button>
      </div>
      <div class="import-list-location">
        <input class="button" type="file" accept=".json" @change="importJSON">
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
      filterText: ''
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
    ...mapMutations('spy', ['REPLACE_LOCATIONS', 'ADD_LOCATION']),
    exportJSON () {
      const data = JSON.stringify(this.getLocationsForExportToJSON)
      const blob = new Blob([data], { type: '' })
      FileSaver.saveAs(blob, 'LocationsList.json')
    },
    async importJSON (event) {
      // TODO: Более хорошая проверка файла и его содержимого
      if (!event.target.files[0]) { return }
      const file = event.target.files[0]
      const dataFromFile = await new Response(file).text()
      let locations = JSON.parse(dataFromFile)
      locations = locations.filter(location => location.title && location.roles)
      this.REPLACE_LOCATIONS(locations)
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
  background: url("assets/svg/background_1.webp") no-repeat center top fixed #FFFFFF;
  background-size: cover;
  display: flex;
  font-family: 'Press Start 2P', cursive;}
.game-wrapper{
  background-color: rgb(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 auto;
}
.filter-input{
  border-radius: 15px;
  width: 35%;
  color: rgba(228, 71, 21);
  font-size: 22pt;
  margin-bottom: 0.5%;
  box-shadow: 0 5px 5px rgba(0,0,0,0.5);
  padding: 0.5%;
}
.locationCounter{
  font-size: 14pt;
  padding: 1%;
  color: white;
}
.start-button{
  margin-top: 2%;
  width: max-content;
  padding: 2%;
  border: none;
  border-radius: 15px;
  background-color: #E54917;
  color: white;
  cursor: pointer;
  font-size: 12pt;
  display: flex;
  align-items: center;
  font-family: 'Press Start 2P', cursive;
  box-shadow: 0 5px 5px rgba(0,0,0,0.5);
}
.start-handler{
  text-align: center;
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;

}
.back-button{
  align-self: flex-start;
}
.button{
  text-decoration: none;
  color: white;
  width: max-content;
  padding: 1%;
  border: none;
  border-radius: 15px;
  background-color: #E54917;
  cursor: pointer;
  font-size: 12pt;
  font-family: 'Press Start 2P', cursive;
  margin: 1%;
}
.error{
  text-shadow: 3px 0 3px red;
}
</style>
