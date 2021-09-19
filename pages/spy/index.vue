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
    <div v-for="(location, index) in getLocations" :key="index">
      <b>{{ location.title }}</b>
      <i>{{ location.img }}</i>
      <input :checked="location.requires" type="checkbox" @input="updateRequireLocationFlag($event,location)">
      <div v-for="(role, i) in location.roles" :key="i">
        {{ role }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  layout: 'gameLayout',
  computed: {
    ...mapGetters('spy', [
      'getLocations'
    ])
  },
  methods: {
    ...mapMutations('spy', [
      'UPDATE_REQUIRE_LOCATION_FLAG'
    ]),
    async createRoom () {
      const originOptions = {
        owner: this.$store.getters.getUsername,
        locations: this.getLocations.filter(location => location.requires).map(location => ({
          title: location.title,
          img: location.img,
          roles: location.roles
        }))
      }
      const res = await this.$back.posts.createRoom({
        originOptions,
        game: 'spy'
      })
      await this.$router.push({ path: `/spy/${res.data.roomId}` })
    },
    updateRequireLocationFlag (e, location) {
      this.UPDATE_REQUIRE_LOCATION_FLAG({
        locationTitle: location.title,
        flag: e.target.checked
      })
    }
  }
}
</script>

<style scoped>

</style>
