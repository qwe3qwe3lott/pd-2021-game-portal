<template>
  <div class="container" :style="{'font-size': wasPinpointed ? '100px' : '25px'}">
    <div class="grid">
      <p class="title">
        {{ location.title }}
      </p>
      <button v-if="spy" class="pointer" @click="$emit('pinpoint', location)">
        Указать
      </button>
    </div>
    <img :alt="location.title" :src="location.img" class="image" @error="onImgError">
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
    spy: { type: Boolean, default: () => false },
    wasCorrect: { type: Boolean, default: () => false },
    wasPinpointed: { type: Boolean, default: () => false }
  },
  data: () => ({
    imgErrorSrc: require('@/assets/svg/error404.svg')
  }),
  methods: {
    onImgError (e) {
      e.target.src = this.imgErrorSrc
      return false
    }
  }
}
</script>

<style scoped>
.image{
  width: 100%;
  object-fit: cover;
  height: 100%;
  border-radius: 1em;
  border: black 0.1em solid;
}
.container{
  position: relative;
  height: 10em;
  width: 12em;
  margin: 0.2em;
}
.title{
  font-size: 1.2em;
  width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
  text-shadow: 1px 0 1px #000, 0 1px 1px #000, -1px 0 1px #000, 0 -1px 1px #000;;
}
.grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  display: grid;
  place-items: center;
  grid-template-rows: 90% 10%;
}
.pointer {
}
</style>
