<template>
  <div>
    <b>{{ location.title }}</b>
    <button v-if="spy" @click="$emit('pinpoint', location)">
      Указать
    </button>
  </div>
</template>

<script>
export default {
  name: 'LocationCard',
  props: {
    location: {
      type: Object,
      default: () => {
        return {
          title: 'void',
          img: ''
        }
      }
    },
    spy: { type: Boolean, default: () => false }
  }
}
</script>

<style scoped>

</style>
