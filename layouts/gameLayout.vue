<template>
  <div>
    <div v-if="!username">
      <h1>Введите ваш ник</h1>
      <form @submit.prevent="submitUsername">
        <input v-model.trim="usernameField" type="text" minlength="1">
        <input type="submit">
      </form>
    </div>
    <Nuxt v-else />
  </div>
</template>

<script>
export default {
  name: 'gameLayout',
  data () {
    return {
      usernameField: ''
    }
  },
  computed: {
    username: {
      get () { return this.$store.getters.getUsername },
      set (username) { this.$store.commit('SET_USERNAME', username) }
    }
  },
  mounted () {
    // this.username = new Date().getMilliseconds().toString()
  },
  methods: {
    submitUsername () {
      this.$store.commit('SET_USERNAME', this.usernameField)
    }
  }
}
</script>

<style scoped>

</style>
