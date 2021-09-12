<template>
  <footer>
    <b>Footer не нажимайте на</b>
    <button @click="getMessage" />
    {{ messageRxd }}
    <div>
      {{ text }}
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  data () {
    return {
      messageRxd: '1',
      text: '2'
    }
  },
  mounted () {
    // this.socket = this.$nuxtSocket({ name: 'spy', channel: '/index' })
    // console.log(this.socket)
  },
  methods: {
    getMessage () {
      return new Promise((resolve) => {
        this.socket.emit('f', { id: 'abc123' }, (resp) => {
          this.messageRxd = resp
          resolve()
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
