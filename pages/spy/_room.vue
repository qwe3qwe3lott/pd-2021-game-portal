<template>
  <div>
    <h1>Комната {{ $route.params.room }}</h1>
    <div v-for="(user, index) in users" :key="index">
      {{ user.username }}
    </div>
    <br>
    <LocationCard v-for="(location, index) in locations" :key="index" :location="location" />
    <br>
    <nuxt-link :to="'/'">
      Выйти
    </nuxt-link>
  </div>
</template>

<script>
import consolaGlobalInstance from 'consola'
import LocationCard from '@/components/spy/LocationCard'

export default {
  components: {
    LocationCard
  },
  layout: 'gameLayout',
  async validate (ctx) {
    const res = await ctx.$back.getters.checkRoom(ctx.route.params.room)
    return res.data.exists
  },
  data () {
    return {
      users: [],
      locations: [],
      roomId: this.$route.params.room,
      ioApi: {},
      ioData: {}
    }
  },
  computed: {
    username: {
      get () { return this.$store.getters.getUsername },
      set (username) { this.$store.commit('SET_USERNAME', username) }
    }
  },
  watch: {
    'ioApi.ready' () {
      if (!this.username) {
        return
      }
      this.joinRoom()
    },
    'ioData.users' (users) {
      consolaGlobalInstance.log('users', users)
      this.users = users
    },
    'ioData.rename' (username) {
      consolaGlobalInstance.log('username', username)
      if (username !== '') {
        this.username = username
      }
    },
    'ioData.locations' (locations) {
      consolaGlobalInstance.log('locations', locations)
      this.locations = locations
    }
  },
  mounted () {
    this.socket = this.$nuxtSocket({
      name: 'spy',
      channel: '/spy',
      serverAPI: true
    })
  },
  methods: {
    joinRoom () {
      this.ioApi.joinRoom({
        roomId: this.roomId,
        username: this.username
      })
    }
  }
}
</script>

<style scoped>

</style>
