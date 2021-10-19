<template>
  <div class="card">
    <b>Расширенные настройки</b>
    <button @click="isOpened = !isOpened">
      Раскрыть
    </button>
    <div v-show="isOpened" class="options">
      <label v-for="(option, index) in roomOptions" :key="index">
        {{ option.description }}
        <input
          type="number"
          :value="option.value"
          :min="option.min"
          :max="option.max"
          :placeholder="option.placeholder"
          @input="UPDATE_ROOM_OPTION({ optionKey: option.key, value: Number($event.target.value) })"
        >
      </label>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
export default {
  name: 'OptionsCreationCard',
  data () {
    return {
      isOpened: false
    }
  },
  computed: {
    ...mapState('spy', [
      'roomOptions'
    ])
  },
  methods: {
    ...mapMutations('spy', [
      'UPDATE_ROOM_OPTION'
    ])
  }
}
</script>

<style scoped>
.card {
  border: black 1px solid;
  width: fit-content;
}
.options {
  display: flex;
  flex-direction: column;
}
</style>
