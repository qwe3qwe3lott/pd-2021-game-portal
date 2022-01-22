<template>
  <main>
    <ModalWindow v-if="showGameDescription" :title="'Описание игры'" @close="showGameDescription = false">
      <template #content>
        <p class="game-description">
          {{ gameDescription }}
        </p>
      </template>
    </ModalWindow>
    <b class="main__head-text">Список мультиплеерных игр:</b>
    <div class="game-holder">
      <nuxt-link class="game-button" :to="'/spy'">
        Играть в "Шпион"
      </nuxt-link>
      <button class="about-game" @click="toShowGameDescription('spy')" />
    </div>
    <p class="main__head-text">
      <b>Список одиночных игр:</b>
    </p>
    <div class="game-holder">
      <nuxt-link class="game-button" :to="'/aim'">
        Играть в "АимТрейнер"
      </nuxt-link>
      <button class="about-game" @click="toShowGameDescription('aim')" />
    </div>
  </main>
</template>

<script>
import { mapState } from 'vuex'
import ModalWindow from '~/components/ModalWindow'
export default {
  components: {
    ModalWindow
  },
  data () {
    return {
      showGameDescription: false,
      gameDescription: ''
    }
  },
  computed: {
    ...mapState(['gameDescriptions'])
  },
  methods: {
    toShowGameDescription (key) {
      this.gameDescription = this.gameDescriptions.find(game => game.key === key).description
      this.showGameDescription = true
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
  font-family: 'Press Start 2P', cursive;
}
.main__head-text{
  color: white;
  margin: 1%;
}
.game-button{
  color: white;
  text-decoration: none;
  border-radius: 1em;
  padding: 0.5em;
}
.game-holder{
  padding: 0.2em;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #e83814;
  box-shadow: 0 5px 5px rgba(0,0,0,0.5);
  border-radius: 1em;
  transition: all 0.3s ease;
}
.game-button:hover{
  background-color: #a6270d;
}
.about-game{
  width: 1.5em;
  height: 1.5em;
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
.game-description {
  background-color: var(--primary-color-darker);
  color: var(--primary-color-primary-text);
  padding: 0.3em;
  border-radius: 1em;
  width: fit-content;
  text-indent: 5em;
  line-height: 1.5em;
  text-align:unset;
}
</style>
