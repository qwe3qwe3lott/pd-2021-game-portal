<template>
  <div class="wrapper">
    <Nuxt v-if="username" class="main" />
    <UsernameManager class="footer" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import UsernameManager from '@/components/UsernameManager'
export default {
  name: 'GameLayout',
  components: { UsernameManager },
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

.footer {
  max-height: 40px;
  color: white;
  background-color: #423f6a;
  padding: 10px;
  font-size: 20px;
  display: flex;
  justify-content: center;
}

</style>
