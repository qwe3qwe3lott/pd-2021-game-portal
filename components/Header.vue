<template>
  <header>
    <b class="header-text">Game Portal</b>
  </header>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style scoped>
header{
  margin: 0;
  padding: 0.5em 0 0.5em 0;
  width: 100%;
  height: max-content;
  background: rgba(0, 0, 0, 0.5);
  text-align: center;
}
.header-text{
  font-size: 1.5em;
  color: white;
  font-family: 'Press Start 2P', cursive;
}
</style>
