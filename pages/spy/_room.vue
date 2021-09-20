<template>
  <div>
    <h1>Комната {{ $route.params.room }}</h1>
    <div class="temp-container">
      <button @click="become(true)">
        Зрители
      </button>
      <div v-for="(user, index) in watchers" :key="index">
        {{ user.username }}{{ (user.isOwner ? ' (owner)' : '') }}
      </div>
    </div>
    <br>
    <div class="temp-container">
      <button @click="become(false)">
        Игроки
      </button>
      <div v-for="(user, index) in players" :key="index">
        {{ user.username }}{{ (user.isOwner ? ' (owner)' : '') }}
      </div>
    </div>
    <br>
    <div class="temp-container">
      <b>Локации</b>
      <LocationCard v-for="(location, index) in locations" :key="index" :location="location" />
    </div>
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
    myUser () {
      return this.users.find(user => user.username === this.username)
    },
    watchers () {
      return this.users.filter(user => user.isWatcher)
    },
    players () {
      return this.users.filter(user => !user.isWatcher)
    },
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
    consolaGlobalInstance.log(this.socket)
  },
  methods: {
    joinRoom () {
      this.ioApi.joinRoom({
        roomId: this.roomId,
        username: this.username
      })
    },
    become (becomeWatcher) {
      if (this.myUser.isWatcher === becomeWatcher) { return }
      this.ioApi.become({
        roomId: this.roomId,
        username: this.username,
        becomeWatcher
      })
    }
  }
}
</script>

<style scoped>
.temp-container {
  padding: 5px;
  outline: #1400ff 1px solid;
}
</style>
