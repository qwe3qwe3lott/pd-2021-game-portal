<template>
  <footer>
    <UsernameManager />
  </footer>
</template>

<script>
import UsernameManager from '@/components/UsernameManager'
export default {
  name: 'Footer',
  components: { UsernameManager }
}
</script>

<style scoped>
footer{
  margin: 0;
  padding: 0.5em 0 0.5em 0;
  width: 100%;
  height: max-content;
  background: rgba(0, 0, 0, 0.5);
}
</style>
