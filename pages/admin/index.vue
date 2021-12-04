<template>
  <div class="">
    Я админ панель
  </div>
</template>

<script>

import consolaGlobalInstance from 'consola'

export default {
  layout: 'empty',
  beforeMount () {
    this.checkAuth()
  },
  methods: {
    checkAuth () {
      consolaGlobalInstance.log('sdg', localStorage.getItem('auth'))
      if (!(localStorage.getItem('auth')?.length > 0)) {
        this.$router.push('/admin/login')
      }
      // localStorage.setItem("role", "")
    }
  }
}
</script>

<style scoped>

</style>
