<template>
  <div>
    <form v-if="!username" @submit.prevent="submitUsername">
      <input v-model="usernameField" type="text">
      <input type="submit">
    </form>
    <h1>Комната {{ $route.params.room }}</h1>
    <div v-if="!username">
      Введите логин чтобы войти в комнату
    </div>
    <div v-for="(user, index) in users" :key="index">
      {{ user.username }}
    </div>
    <br>
    <nuxt-link :to="'/'">
      Выйти
    </nuxt-link>
  </div>
</template>

<script>
import consolaGlobalInstance from 'consola'

export default {
  async validate (ctx) {
    const res = await ctx.$back.getters.checkRoom(ctx.route.params.room)
    return res.data.exists
  },
  data () {
    return {
      users: [],
      usernameField: '',
      roomId: this.$route.params.room,
      ioApi: {},
      ioData: {}
    }
  },
  computed: {
    username: {
      get () {
        return this.$store.getters.getUsername
      },
      set (username) {
        this.$store.commit('SET_USERNAME', username)
      }
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
      if (username !== '') {
        this.username = username
      }
    }
  },
  mounted () {
    this.username = new Date().getMilliseconds().toString()
    this.socket = this.$nuxtSocket({
      name: 'spy',
      channel: '/spy',
      serverAPI: true
    })
  },
  methods: {
    async submitUsername () {
      this.users = await this.ioApi.getUsers({
        roomId: this.roomId
      })
      console.log('users', this.users)
      if (this.users.includes(this.usernameField)) {
        return false
      }
      this.$store.commit('SET_USERNAME', this.usernameField)
      this.joinRoom()
    },
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
