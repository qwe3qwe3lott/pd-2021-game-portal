<template>
  <div class="">
    {{ valueTame }}
    <div class="fill_scale" :style="{background: style}">

    </div>
  </div>
</template>

<script>
export default {
  name: 'Timer',
  props: ['seconds'],
  data () {
    return {
      currentTime: this.seconds,
      timer: null,
      valueTame: Math.floor(this.seconds / 60) + ':' + this.seconds % 60,
      style: 'linear-gradient(87deg, #d0fbe4 1%, #c1c1f9 0%)'
    }
  },
  watch: {
    currentTime (time) {
      if (time === 0) {
        this.stopTimer()
      }
    }

  },
  mounted () {
    this.startTimer()
  },
  destroyed () {
    this.stopTimer()
  },
  methods: {
    startTimer () {
      this.timer = setInterval(() => {
        this.currentTime--
        this.valueTame = Math.floor(this.currentTime / 60) + ':' + this.currentTime % 60
        this.style = 'linear-gradient(87deg, #d0fbe4 ' + (100 - Math.round(this.currentTime * 100 / this.seconds)) + '%, #c1c1f9 0%)'
      }, 1000)
    },
    stopTimer () {
      clearTimeout(this.timer)
    }
  }
}
</script>

<style>
.fill_scale {
  width: 300px;
  height: 30px;
  border-radius: 5px;
}

</style>
