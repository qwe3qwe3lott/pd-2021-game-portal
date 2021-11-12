<template>
  <div class="wrapper">
    <Nuxt v-if="username" class="main" />
    <Footer />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Footer from '@/components/Footer'
export default {
  name: 'GameLayout',
  components: { Footer },
  computed: {
    ...mapState(['username'])
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
</style>
