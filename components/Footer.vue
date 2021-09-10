<template>
  <footer>
    <b>Footer tut</b>
    <button @click="getMessage" />
    {{ messageRxd }}
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  data () {
    return {
      messageRxd: '1'
    }
  },
  mounted () {
    this.socket = this.$nuxtSocket({ name: 'spy' })
    console.log(this.socket)
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
