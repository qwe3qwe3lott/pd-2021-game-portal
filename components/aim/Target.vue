<template>
  <div
    class="target"
    :class="{ 'target_easy': value === 1, 'target_medium': value === 2, 'target_hard': value === 3 }"
    :style="`--position-left: ${positionLeft}; --position-top: ${positionTop}`"
    @click="getClicked()"
  >
    <div />
  </div>
</template>

<script>
export default {
  name: 'Target',
  props: {
    value: { type: Number, default: () => Math.floor(Math.random() * (3 - 1 + 1)) + 1 },
    id: { type: Number, default: () => 0 },
    difficulty: { type: Number, default: () => 1 }
  },
  data () {
    return {
      positionTop: String(this.getRandomIntInRange(10, 85)) + '%',
      positionLeft: String(this.getRandomIntInRange(10, 85)) + '%'
    }
  },
  beforeMount () {
    setTimeout(() => {
      this.selfDestroy()
    }, (6000 / this.value) / this.difficulty)
  },
  methods: {
    selfDestroy () {
      this.$emit('destroy', this.id)
      this.$emit('increaseDestroyedValue', this.value)
    },
    getClicked () {
      this.$emit('increaseScore', this.value)
      this.selfDestroy()
    },
    getRandomIntInRange (min, max) {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
  }
}
</script>

<style scoped>
.target{
  border-radius: 100%;
  position: absolute;
  top: var(--position-top);
  left: var(--position-left);
  border: black 1px solid;
}
.target_easy{
  background-color: green;
  height: 3em;
  width: 3em;
}
.target_medium{
  background-color: yellow;
  height: 2em;
  width: 2em;
}
.target_hard{
  background-color: red;
  height: 1.5em;
  width: 1.5em;
}
</style>
