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
    <div v-for="(item, index) in users" :key="index">
      {{ item }}
    </div>
    <br>
    <nuxt-link :to="'/'">
      Выйти
    </nuxt-link>
  </div>
</template>

<script>
export default {
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
    username () {
      return this.$store.getters.getUsername
    }
  },
  watch: {
    async 'ioApi.ready' () {
      await this.ioApi.checkRoom({
        roomId: this.roomId
      })
      if (!this.username) {
        return
      }
      this.joinRoom()
    },
    'ioData.users' (users) {
      this.users = users
    },
    'ioData.kick' (flag) {
      console.log('kick', flag)
      if (flag) {
        this.$router.push({ path: '/spy' })
      }
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
