<template>
  <div>
    <div v-for="(item, index) in rooms" :key="index">
      {{ item }}
    </div>
    <button @click="createRoom" />
  </div>
</template>

<script>
export default {
  data () {
    return {
      ioApi: {},
      ioData: {},
      rooms: ['1']
    }
  },
  watch: {
    async 'ioApi.ready' () {
      console.log(123)
      this.rooms = await this.ioApi.getRooms()
      console.log(321)
    },
    'ioData.rooms' (rooms) {
      console.log(rooms)
      this.rooms = rooms
    }
  },
  mounted () {
    this.socket = this.$nuxtSocket({
      name: 'spy',
      channel: '/rooms',
      serverAPI: true
    })
    console.log(this.socket)
  },
  methods: {
    async createRoom () {
      await this.ioApi.createRoom()
    }
  }
}
</script>

<style scoped>

</style>
