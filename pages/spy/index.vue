<template>
  <div>
    <nuxt-link :to="'/'">
      Назад
    </nuxt-link>
    <br>
    <button @click="createRoom">
      Создать комнату
    </button>
  </div>
</template>

<script>
export default {
  data () {
    return {
      ioApi: {},
      ioData: {}
    }
  },
  mounted () {
    this.socket = this.$nuxtSocket({
      name: 'spy',
      channel: '/spy',
      serverAPI: true
    })
    // console.log(this.socket)
  },
  methods: {
    async createRoom () {
      const roomId = await this.ioApi.createRoom()
      console.log(roomId)
      await this.$router.push({ path: `/spy/${roomId}` })
    }
  }
}
</script>

<style scoped>

</style>
