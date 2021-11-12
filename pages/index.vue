<template>
  <main>
    <b class="main__head-text">Список игр:</b>
    <br>
    <nuxt-link class="game" :to="'spy'">
      Играть в "Шпион"
    </nuxt-link>
  </main>
</template>

<script>
export default {

}
</script>
<style scoped>
main{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-family: 'Press Start 2P', cursive;}
.main__head-text{
  font-size: 16pt;
  color: white;
  margin: 1%;
}
.game{
  color: white;
  text-decoration: none;
  background-color: #e83814;
  padding: 1%;
  box-shadow: 0 5px 5px rgba(0,0,0,0.5);
  border-radius: 15px;
  transition: all 0.3s ease;
}
.game:hover{
  background-color: #a6270d;
}
</style>
