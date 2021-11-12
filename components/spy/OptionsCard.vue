<template>
  <div class="card">
    <b>Расширенные настройки</b>
    <button v-if="!isOpened" class="card-button" type="button" @click="isOpened = !isOpened">
      Раскрыть
    </button>
    <button v-else class="card-button" type="button" @click="isOpened = !isOpened">
      Скрыть
    </button>
    <div v-show="isOpened" class="options">
      <label v-for="(option, index) in roomOptions" :key="index">
        {{ option.description }}
        <input
          type="number"
          :value="option.value"
          :min="option.min"
          :max="option.max"
          @input="UPDATE_ROOM_OPTION({ optionKey: option.key, value: +$event.target.value })"
        >
      </label>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
export default {
  name: 'OptionsCreationCard',
  data: () => ({
    isOpened: false
  }),
  computed: {
    ...mapState('spy', ['roomOptions'])
  },
  methods: {
    ...mapMutations('spy', ['UPDATE_ROOM_OPTION'])
  }
}
</script>

<style scoped>
.card {
  border: black 1px solid;
  width: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  background-color: rgb(0,0,0,0.55);
  border-radius: 15px;
  padding: 1%;
}
.options {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  text-align: center;
}
.options input{
  border-radius: 5px;
}
.card-button{
  width: max-content;
  padding: 1.5%;
  border: none;
  border-radius: 15px;
  background-color: #E54917;
  color: white;
  cursor: pointer;
  font-size: 12pt;
  display: flex;
  align-items: center;
  font-family: 'Press Start 2P', cursive;
}
</style>
