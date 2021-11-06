<template>
  <div class="wrapper">
    <div class="main">
      <div v-if="!username">
        <h1>Введите ваш ник</h1>
        <form @submit.prevent="submitUsername">
          <input v-model.trim="usernameField" type="text" minlength="1" maxlength="30">
          <input type="submit">
        </form>
      </div>
      <Nuxt v-else/>
    </div>
    <footer>
      {{ usernameField }}
      <div v-if="$store.getters.getUsername" class="">
        <button v-if="!isRefactorName" @click="isRefactorName = !isRefactorName">
          Редактировать
        </button>
        <input v-if="isRefactorName" v-model.trim="usernameField" type="text">
        <button v-if="isRefactorName" @click="submitUsername">
          Сохранить
        </button>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'GameLayout',
  data () {
    return {
      isRefactorName: false,
      usernameField: this.$store.getters.getUsername
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
  mounted () {
    // this.username = new Date().getMilliseconds().toString()
  },
  methods: {
    submitUsername () {
      this.$store.commit('SET_USERNAME', this.usernameField)
      this.isRefactorName = false
    }
  }
}
</script>

<style scoped>

.wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1 1 auto;
}

footer {
  max-height: 40px;
  color: white;
  background-color: #423f6a;
  padding: 10px;
  font-size: 20px;
  display: flex;
  justify-content: center;
}

</style>
