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
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
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
      'getLocations', 'getRequiredLocations'
    ]),
    ...mapState('spy', [
      'roomOptions'
    ])
  },
  methods: {
    ...mapMutations('spy', [
      'ADD_LOCATION'
    ]),
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
      // TODO: настройки комнаты
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
