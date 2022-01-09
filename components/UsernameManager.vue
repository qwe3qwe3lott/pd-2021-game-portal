<template>
  <div v-if="!anyGameIsRunningFlag" class="main-container">
    <div v-if="!editMode" class="input-block">
      <p class="header__input">
        Ваш ник: {{ username }}
      </p>
      <button class="input-form__button" @click="editMode = true" />
    </div>
    <form v-else class="input-block" @submit.prevent="submitUsername">
      <input
        v-model.trim="usernameField"
        class="input-form__input-field"
        type="text"
        minlength="1"
        maxlength="30"
        placeholder="Введите ваш ник"
      >
      <input class="input-form__button" type="submit" value="">
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
        this.usernameField = username
        this.username = { username: this.usernameField, isServerRename: false }
      } else { this.editMode = true }
    } else { this.editMode = true }
  },
  methods: {
    submitUsername () {
      if (this.usernameField.length > 30) { this.usernameField = this.usernameField.substring(0, 30) }
      this.username = { username: this.usernameField, isServerRename: false }
      localStorage.setItem(this.localStorageKey, this.usernameField)
      this.editMode = false
    }
  }
}
</script>

<style scoped>
.main-container {
  max-width: 100%;
}
.input-block{
  width: fit-content;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  justify-self: center;
  gap: 1em;
  margin: 0 auto;
}
.header__input{
  color: white;
  overflow-wrap: break-word;
}
.input-form__input-field{
  width: 10em;
  height: 1.2em;
  background: #FFFFFF;
  border-radius: 0.8em;
  padding: 0.2em;
}
.input-form__button{
  width: 1.5em;
  height: 1.5em;
  padding: 0.2em;
  border: none;
  border-radius: 0.7em;
  background: url("../assets/svg/edit-icon.svg");
  background-color: #E54917;
  background-size: contain;
  color: white;
  cursor: pointer;
}
</style>
