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
    time: {
      type: Object,
      default: () => ({
        originTime: 0,
        currentTime: 0
      })
    },
    isOnPause: {
      type: Boolean,
      default: () => false
    }
  },
  data () {
    return {
      originTime: 0,
      currentTime: 0,
      timerId: null,
      colorFull: '#6573ff',
      colorEmpty: '#392d5f'
    }
  },
  computed: {
    timeValue () { return `${Math.floor(this.currentTime / 60)}:${this.currentTime % 60 < 10 ? '0' : ''}${this.currentTime % 60}` },
    barBackgroundStyle () { return this.currentTime <= 0 ? this.colorFull : `linear-gradient(87deg, ${this.colorFull} ${(100 - Math.round(this.currentTime * 100 / this.originTime))}%, ${this.colorEmpty} 0%)` }
  },
  watch: {
    time ({ originTime, currentTime }) {
      this.originTime = originTime
      this.currentTime = currentTime
      if (!this.timerId && originTime > 0 && currentTime > 0) {
        this.startTimer()
      }
    }
  },
  destroyed () {
    this.stopTimer()
  },
  methods: {
    startTimer () {
      this.timerId = setInterval(() => {
        if (!this.isOnPause) {
          if (this.currentTime-- <= 0) {
            this.currentTime = 0
            this.stopTimer()
          }
        }
      }, 1000)
    },
    stopTimer () {
      clearTimeout(this.timerId)
      this.timerId = null
    }
  }
}
</script>

<style scoped>
.container {
  padding: 0.5em;
  background: #3E4447;
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
  border: 0.1em solid black;
  width: 5em;
  height: 0.5em;
  border-radius: 0.5em;
  background: #392d5f;
}

</style>
