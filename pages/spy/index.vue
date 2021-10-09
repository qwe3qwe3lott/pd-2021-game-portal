<template>
  <div>
    <nuxt-link :to="'/'">
      Назад
    </nuxt-link>
    <br>
    <button @click="createRoom">
      Создать комнату
    </button>
    {{ message }}
    <br>
    <LocationCreationCard
      v-for="(location, index) in getLocations"
      :id="location.id"
      :key="index"
      :title="location.title"
      :img="location.img"
      :roles="location.roles"
      :requires="location.requires"
      @isRequiredChanged="updateRequireLocationFlag($event)"
      @roleChanged="updateRole($event)"
      @titleChanged="updateTitle($event)"
      @imgChanged="updateImage($event)"
    />
    <button @click="check">
      ПРОВЕРКА
    </button>
    <button @click="addLocation">
      Добавить локацию
    </button>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import consolaGlobalInstance from 'consola'
import LocationCreationCard from '@/components/spy/LocationCreationCard'
export default {
  components: {
    LocationCreationCard
  },
  layout: 'gameLayout',
  computed: {
    ...mapGetters('spy', [
      'getLocations'
    ])
  },

  data () {
    return {
      message: '',
      flag: true
    }
  },

  methods: {
    ...mapMutations('spy', [
      'UPDATE_REQUIRE_LOCATION_FLAG', 'ADD_LOCATION', 'UPDATE_ROLE', 'UPDATE_TITLE', 'UPDATE_IMAGE'
    ]),
    async createRoom () {
      this.message = ''
      for (let i = 0; i < this.getLocations.length - 1; i++) {
        if (this.getLocations[i].title.trim() === '') {
          this.message = `Есть локация без названия - ${i}`
          return
        }

        for (let j = i + 1; j < this.getLocations.length; j++) {
          if (this.getLocations[i].title === this.getLocations[j].title) {
            this.message = `Локации с одинаковым названием запрещены - ${this.getLocations[i].title}`
            return
          }
        }

        if (this.getLocations[i].roles.filter(role => role.trim() !== '').length === 0) {
          this.message = `Есть локация с незаполнеными полями - ${this.getLocations[i].title}`
          return
        }
      }
      if (this.getLocations[this.getLocations.length - 1].title.trim() === '') {
        this.message = `Есть локация без названия  - ${this.getLocations.length - 1}`
        return
      }
      const counter = this.getLocations[this.getLocations.length - 1].roles.filter(role => role.trim() !== '').length

      if (counter === 0) {
        this.message = `Есть локация с незаполнеными полями - ${this.getLocations.length - 1}`
        return
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

      return
      // eslint-disable-next-line no-unreachable
      const res = await this.$back.posts.createRoom({
        originOptions,
        game: 'spy'
      })
      await this.$router.push({ path: `/spy/${res.data.roomId}` })
    },
    updateRequireLocationFlag ({ title, requires }) {
      this.UPDATE_REQUIRE_LOCATION_FLAG({
        locationTitle: title,
        flag: requires
      })
    },
    updateRole (event) {
      this.UPDATE_ROLE(event)
    },
    updateTitle (event) {
      this.UPDATE_TITLE(event)
    },
    updateImage (event) {
      this.UPDATE_IMAGE(event)
    },
    addLocation () {
      // ВСЮ ЭТУ ДИЧЬ ДЕЛАТЬ ПЕРЕД СОЗДАНИЕМ КОМНАТЫ
      // Тут формировать новый массив из непустных значений старого
      // Проверки на то что записей больше 0
      // Создателю правил написания кода что пробел тут и там руки бы оторвать
      // Проверка на то чтобы названий одинаковых не было
      this.ADD_LOCATION(
        {
          name: '',
          url: '',
          roles: ['', '', '', '', '', '', '', '', '', '']
        }
      )
    },
    check () {
      consolaGlobalInstance.log(this.getLocations)
    }
  }
}
</script>

<style scoped>

</style>
