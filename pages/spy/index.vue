<template>
  <div>
    <nuxt-link :to="'/'">
      Назад
    </nuxt-link>
    <br>
    <button @click="createRoom">
      Создать комнату
    </button>
    {{ errorMessage }}
    <br>
    <OptionsCreationCard />
    <br>
    <LocationCreationCard
      v-for="(location, index) in getLocations"
      :id="location.id"
      :key="index"
      :title="location.title"
      :img="location.img"
      :roles="location.roles"
      :requires="location.requires"
    />
    <button @click="addLocation">
      Добавить локацию
    </button>
    <div class="export-list-location">
      <button @click="exportJSON">
        Экспорт списка локаций
      </button>
    </div>
    <div class="import-list-location">
      <input type="file" accept=".json" @change="importJSON">
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import FileSaver from 'file-saver'
import LocationCreationCard from '@/components/spy/LocationCreationCard'
import OptionsCreationCard from '@/components/spy/OptionsCreationCard'
export default {
  components: {
    LocationCreationCard,
    OptionsCreationCard
  },
  layout: 'gameLayout',
  data () {
    return {
      errorMessage: '',
      locationsRequiredAtLess: 3
    }
  },
  computed: {
    ...mapGetters('spy', [
      'getLocations', 'getRequiredLocations', 'getLocationsForExportToJSON'
    ]),
    ...mapState('spy', [
      'roomOptions'
    ])
  },
  methods: {
    ...mapMutations('spy', [
      'REPLACE_LOCATIONS', 'ADD_LOCATION'
    ]),
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
        owner: this.$store.getters.getUsername,
        locations: this.getLocations.filter(location => location.requires).map(location => ({
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
    },
    addLocation () {
      this.ADD_LOCATION(
        {
          name: '',
          url: '',
          roles: Array(10).fill('')
        }
      )
    }
  }
}
</script>
