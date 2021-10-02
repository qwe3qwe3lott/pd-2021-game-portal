<template>
  <div class="container">
    <p class="numbers">
      {{ timeValue }}
    </p>
    <div class="bar" :style="{background: barBackgroundStyle}" />
  </div>
</template>

<script>
export default {
  name: 'Timer',
  props: {
    seconds: {
      type: Number,
      default: () => 0
    }
  },
  data () {
    return {
      currentTime: 0,
      timerId: null,
      colorFull: '#6573ff',
      colorEmpty: '#392d5f'
    }
  },
  computed: {
    timeValue () { return Math.floor(this.currentTime / 60) + ':' + this.currentTime % 60 },
    barBackgroundStyle () { return `linear-gradient(87deg, ${this.colorFull} ${(100 - Math.round(this.currentTime * 100 / this.seconds))}%, ${this.colorEmpty} 0%)` }
  },
  watch: {
    seconds (newVal) {
      if (this.timerId) {
        this.stopTimer()
      }
      this.currentTime = newVal
      if (newVal > 0) {
        this.startTimer()
      }
    }
  },
  mounted () {
    if (this.seconds > 0) {
      this.startTimer()
    }
  },
  destroyed () {
    this.stopTimer()
  },
  methods: {
    startTimer () {
      if (this.currentTime <= 0) { return }
      this.timerId = setInterval(() => {
        if (--this.currentTime <= 0) {
          this.currentTime = 0
          this.stopTimer()
        }
      }, 1000)
    },
    stopTimer () {
      clearTimeout(this.timerId)
    }
  }
}
</script>

<style>
.container {
  padding: 0.5em;
  background: #3E4447;
  border: 1px solid black;
  border-radius: 1em;
  width: fit-content;
  height: fit-content;
  display: grid;
  place-items: center;
}
.numbers {
  width: max-content;
  color: white;
}
.bar {
  border: 1px solid black;
  width: 5em;
  height: 0.5em;
  border-radius: 0.5em;
  background: #392d5f;
}

</style>
