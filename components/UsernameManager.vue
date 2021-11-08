<template>
  <div v-if="!anyGameIsRunningFlag">
    <div v-if="!editMode">
      <p>Ваш ник: {{ username }}</p>
      <button @click="editMode = true">
        Редактировать
      </button>
    </div>
    <form v-else @submit.prevent="submitUsername">
      <p>Введите ваш ник: </p>
      <input v-model.trim="usernameField" type="text" minlength="1" maxlength="30">
      <input type="submit" value="Сохранить">
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'UsernameManager',
  data () {
    return {
      editMode: false,
      usernameField: null,
      localStorageKey: 'username'
    }
  },
  computed: {
    username: {
      get () { return this.$store.state.username },
      set (value) { this.$store.commit('SET_USERNAME', value) }
    },
    ...mapState(['anyGameIsRunningFlag'])
  },
  beforeMount () {
    if (this.username) {
      this.usernameField = this.username
      return
    }
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem(this.localStorageKey)
      if (username) {
        this.username = this.usernameField = username
      } else { this.editMode = true }
    } else { this.editMode = true }
  },
  methods: {
    submitUsername () {
      this.username = this.usernameField
      localStorage.setItem(this.localStorageKey, this.usernameField)
      this.editMode = false
    }
  }
}
</script>

<style scoped>

</style>
