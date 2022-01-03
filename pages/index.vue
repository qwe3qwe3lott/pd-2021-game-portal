<template>
  <main>
    <b class="main__head-text">Список игр:</b>
    <br>
    <div class="game-holder">
      <nuxt-link class="game" :to="'/spy'">
        Играть в "Шпион"
      </nuxt-link>
      <div class="about-game" @click="upHere = true" />
      <ModalWindow v-show="upHere" title="Игра &quot;Шпион&quot; построена на блефе, интуиции и внимательности — это игра, в которой важнее всего, что говорят и думают игроки. На каждый раунд даётся 8 минут (но вы сами можете решить, сколько вам нужно времени). Если шпиону удастся раньше разгадать локацию, он может остановить игру, раскрыться и получить дополнительные очки, если окажется прав. Если он ошибся в ответе или сам задал неуместный вопрос, его могут заподозрить в шпионаже, и если все вместе проголосуют за то, что шпион — он, его выгонят, даже если он окажется простым мирным жителем." @close="close" />
    </div>
  </main>
</template>

<script>
import ModalWindow from '~/components/ModalWindow'

export default {
  components: {
    ModalWindow
  },
  data () {
    return {
      upHere: false
    }
  },
  methods: {
    close () {
      this.upHere = false
    }
  }
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
  border-radius: 15px;
  padding: 0.5em;
}
.game-holder{
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #e83814;
  padding: 1%;
  box-shadow: 0 5px 5px rgba(0,0,0,0.5);
  border-radius: 15px;
  transition: all 0.3s ease;
}
.game:hover{
  background-color: #a6270d;
}
.about-game{
  width: 2em;
  height: 2em;
  padding: 0.1em;
  border: none;
  border-radius: 1em;
  background: url("../assets/svg/info.svg");
  background-size: cover;
  color: white;
  cursor: pointer;
}
.about-game:hover {
  background-color: #a6270d;
}
</style>
