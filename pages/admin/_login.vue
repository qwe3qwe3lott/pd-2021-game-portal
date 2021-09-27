<template>
  <div class="form-auth">
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      class="form-auth__items-form"
    >
      <v-text-field
        v-model="login"
        :rules="loginRules"
        label="Логин"
        required
      />

      <v-text-field
        v-model="password"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :rules="passwordRules"
        :type="showPassword ? 'text' : 'password'"
        label="Пароль"
        required
        @click:append="showPassword = !showPassword"
      />
      <v-btn
        class="mr-4"
        @click="validate"
      >
        Войти
      </v-btn>
    </v-form>
  </div>
</template>

<script>
import consolaGlobalInstance from 'consola'

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
        consolaGlobalInstance.log('mir')
        consolaGlobalInstance.log(this.password, this.login)
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
        })
      }
    }
  }
}
</script>

<style scoped>
.form-auth {
  max-width: 500px;
  margin: 0 auto;
}
</style>
