<template>
  <main>
    <Timer :key="updateKey" :seconds="countSeconds"/>
    <input v-model="mir">
    <button @click="updateSecond">
      +1
    </button>
  </main>
</template>

<script>
import Timer from '@/components/timer/Timer'

export default {
  components: {
    Timer
  },
  data () {
    return {
      mir: '',
      countSeconds: 100,
      updateKey: 0
    }
  },
  methods: {
    updateSecond () {
      this.countSeconds = parseInt(this.mir)
      this.updateKey += 1
    }
  }
}
</script>
