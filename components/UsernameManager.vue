<template>
  <div v-if="!anyGameIsRunningFlag" class="main-container">
    <div v-if="!editMode" class="input-block">
      <p class="header__input">
        Ваш ник: {{ username }}
      </p>
      <button class="input-form__button" @click="editMode = true" />
    </div>
    <form v-else class="input-block" @submit.prevent="submitUsername">
      <p class="header__input">
        Введите ваш ник:
      </p>
      <input v-model.trim="usernameField" class="input-form__input-field" type="text" minlength="1" maxlength="30">
      <input class="input-form__button" type="submit" value="Сохранить">
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

.input-block{
  width: max-content;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  justify-self: center;
  gap: 1em;
  margin: 0 auto;
  font-family: 'Press Start 2P', cursive;
}
.header__input{
  font-style: normal;
  font-weight: normal;
  font-size: 14pt;
  color: white;
  white-space:nowrap;
}
.input-form__input-field{
  width: 50%;
  height: 10%;
  background: #FFFFFF;
  border-radius: 15px;
  font-size: 14pt;
  font-family: 'Press Start 2P', cursive;
}
.input-form__button{
  width: 2em;
  height: 2em;
  padding: 0.1em;
  border: none;
  border-radius: 0.5em;
  background: url("../assets/svg/Edit_icon_(the_Noun_Project_30184).svg");
  background-color: #E54917;
  background-size: cover;
  color: white;
  cursor: pointer;
}
</style>
