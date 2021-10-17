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
      <button @click="exportJSON">Экспорт списка локаций</button>
    </div>
    <div class="import-list-location">
      <input id="file" type="file" accept=".json"/>
      <button @click="importJSON">Импорт списка локаций</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import FileSaver from 'file-saver'
import LocationCreationCard from '@/components/spy/LocationCreationCard'

export default {
  components: {
    LocationCreationCard
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
      'getLocations', 'getRequiredLocations'
    ])
  },
  methods: {
    ...mapMutations('spy', [
      'UPLOAD_LOCATION',
      'ADD_LOCATION'
    ]),
    exportJSON () {
      const data = JSON.stringify(this.getLocations)
      const blob = new Blob([data], { type: '' })
      FileSaver.saveAs(blob, 'ListLocation.json')
    },
    async importJSON () {
      const file = document.getElementById('file').files[0]
      const dataFromFile = await new Response(file).text()
      this.UPLOAD_LOCATION(JSON.parse(dataFromFile))
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
          this.message = `Укажите хотя бы одну роль на выбранной локацие - ${location.title}`
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
        options: {
          spiesCount: 1
        }
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
