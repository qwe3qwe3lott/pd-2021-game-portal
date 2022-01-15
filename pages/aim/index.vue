<template>
  <div class="game-body">
    <div class="game-wrapper">
      <div class="options">
        <nuxt-link v-show="!timerId" class="button" :to="'/'">
          Назад
        </nuxt-link>
        <modal-window v-if="showOptionsCard" :title="'Настройки'" @close="showOptionsCard = false">
          <template #content>
            <div class="option">
              <div class="option__title">
                Сложность: {{ difficulty }}
              </div>
              <input v-model="difficulty" type="range" min="1" max="4">
            </div>
            <div class="option">
              <div class="option__title">
                Количество жизней:
              </div>
              <input v-model="lives" class="options__input" placeholder="Введите данные">
            </div>
          </template>
        </modal-window>
        <button v-show="!timerId" type="button" class="options-button" @click="showOptionsCard = true" />
        <button v-if="!timerId" class="button" type="button" @click="startGame">
          Начать
        </button>
        <button v-if="timerId" class="button" type="button" @click="stopGame">
          Закончить игру
        </button>
      </div>
    </div>
    <div id="game-body" class="game-body">
      <div v-show="timerId" class="fail-check" @click="failClick()" />
      <Target
        :is="target"
        v-for="(target, index) in targets"
        :id="index"
        :key="index"
        :difficulty="Number(difficulty)"
        @increaseScore="increaseScore"
        @destroy="removeTarget"
        @increaseDestroyedValue="increaseDestroyedValue"
      />
      <div class="info score">
        <p v-if="gameEnded">
          Окончательный счёт: {{ score }} из {{ destroyedValue }}
        </p>
        <p v-else>
          Ваш счёт: {{ score }}
        </p>
      </div>
      <div v-if="!gameEnded" class="info lives">
        Количество жизней: {{ lives }}
      </div>
    </div>
  </div>
</template>
<script>
import Target from '@/components/aim/Target'
import ModalWindow from '@/components/ModalWindow'
export default {
  components: { Target, ModalWindow },
  data () {
    return {
      showOptionsCard: false,
      difficulty: 1,
      targets: [],
      score: 0,
      destroyedValue: 0,
      lives: 3,
      timerId: null,
      gameEnded: false
    }
  },
  beforeDestroy () {
    this.stopGame()
  },
  methods: {
    startGame () {
      this.gameEnded = false
      this.score = 0
      this.destroyedValue = 0
      this.timerId = setInterval(() => {
        this.addTarget()
      }, 2500 / this.difficulty)
    },
    stopGame () {
      this.gameEnded = true
      this.lives = 3
      this.targets = []
      clearInterval(this.timerId)
      this.timerId = null
    },
    failClick () {
      if (this.lives > 1) {
        this.lives--
      } else {
        this.stopGame()
      }
    },
    addTarget () {
      this.targets.push(Target)
    },
    removeTarget (id) {
      this.targets[id] = null
    },
    increaseScore (value) {
      this.score += value * this.difficulty
    },
    increaseDestroyedValue (value) {
      this.destroyedValue += (value * this.difficulty)
    }
  }
}
</script>

<style scoped>
.options{
  display: flex;
  align-items: center;
  justify-content: center;
}
.options-button {
  height: 1.5em;
  width: 1.5em;
  mask: url("../../assets/svg/gear.svg");
  background-color: var(--primary-color-primary-text);
  mask-repeat: no-repeat;
  mask-size: cover;
}
.info{
  text-align: center;
  font-size: 4em;
  z-index: -1;
  color: white;
  opacity: 0.4;
}
.score{
  position: fixed;
  text-align: center;
  left: 0;
  right: 0;
}
.lives{
  position: fixed;
  text-align: center;
  left: 0;
  right: 0;
  bottom: 10%;
}
.fail-check{
  width: 100%;
  position: fixed;
  height: 100%;
  z-index: 0;
}
.button{
  padding: 0.5em;
  background-color: var(--primary-color);
  color: var(--primary-color-primary-text);
  border-radius: 1em;
  margin: 0.3em;
  text-decoration: none;
}
.options__input{
  border-radius: 1em;
  width: 8vw;
  min-width: 6em;
  padding: 0.5em;
}
</style>
