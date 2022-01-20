<template>
  <div class="form-auth">
    <div
      class="form-auth__items-form"
    >
      <input
        v-model="login"
        required
        placeholder="Логин"
      />
      <input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Пароль"
        required
        @click:append="showPassword = !showPassword"
      />
      <button
        class="mr-4"
        @click="validate"
      >
        Войти
      </button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Login',
  layout: 'empty',
  data: () => ({
    valid: true,
    login: '',
    loginRules: [
      v => !!v || 'Обязательный параметр'
    ],
    password: '',
    passwordRules: [
      v => !!v || 'Обязательный параметр',
      v => (v && v.length <= 8) || 'Не менее 8 символов'
    ],
    showPassword: false
  }),

  methods: {
    validate () {
      if (this.password.length && this.login.length) {
        this.$back.getters.checkUser(
          this.login,
          this.password
        ).then(({ data }) => {
          if (data?.length > 0) {
            localStorage.setItem('auth', data)
            this.$router.push('/admin')
          } else if (data?.exists) {
            alert('Неверный пароль')
          }
        }).catch(() => {
          alert('Сервис не доступен')
        })
      }
    }
  }
}
</script>

<style scoped>

.form-auth__items-form{
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  border-radius: 10px;
  background-color: #e2e2e2;
  padding: 20px;
}

.form-auth {
  display: flex;
  max-width: 300px;
  height: 100vh;
  margin: 0 auto;
  align-items: center;
}

.form-auth__items-form input{
  font-size: 30px;
  padding: 5px;
  border-radius: 5px;
}
</style>
