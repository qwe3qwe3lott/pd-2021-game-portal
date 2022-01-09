<template>
  <div class="card">
    <label v-for="(option, index) in roomOptions" :key="index" class="label">
      {{ option.description }}
      <input
        class="input"
        type="number"
        :value="option.value"
        :min="option.min"
        :max="option.max"
        @input="UPDATE_ROOM_OPTION({ optionKey: option.key, value: +$event.target.value })"
      >
    </label>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
export default {
  name: 'OptionsCreationCard',
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
  background-color: rgba(0,0,0,0.55);
  border-radius: 0.9em;
  padding: 0.5em;
}
</style>
