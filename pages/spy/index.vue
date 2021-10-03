<template>
  <div>
    <nuxt-link :to="'/'">
      Назад
    </nuxt-link>
    <br>
    <button @click="createRoom">
      Создать комнату
    </button>
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

  methods: {
    ...mapMutations('spy', [
      'UPDATE_REQUIRE_LOCATION_FLAG', 'ADD_LOCATION'
    ]),
    async createRoom () {
      const originOptions = {
        owner: this.$store.getters.getUsername,
        locations: this.getLocations.filter(location => location.requires).map(location => ({
          title: location.title,
          img: location.img,
          roles: location.roles
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
    updateRequireLocationFlag ({ title, requires }) {
      this.UPDATE_REQUIRE_LOCATION_FLAG({
        locationTitle: title,
        flag: requires
      })
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
          roles: []
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
