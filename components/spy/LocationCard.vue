<template>
  <div class="container">
    <div class="grid" :style="{'background-color': wasPinpointed && wasCorrect ? 'rgba(128,128,0,0.5)' : (wasCorrect ? 'rgba(0,255,0,0.5)' : (wasPinpointed ? 'rgba(255,0,0,0.5)' : 'unset')) }">
      <button class="title" :style="{'cursor': (spy ? 'pointer' : 'default')}" :disabled="!spy" @click="$emit('pinpoint', location)">
        {{ location.title }}
      </button>
    </div>
    <img v-show="!imageHidden" :alt="location.title" :src="location.img" class="image" @error="onImgError">
  </div>
</template>

<script>
export default {
  name: 'LocationCard',
  props: {
    location: {
      type: Object,
      default: () => { return { title: 'Ошибка', img: '' } }
    },
    spy: { type: Boolean, default: () => false },
    wasCorrect: { type: Boolean, default: () => false },
    wasPinpointed: { type: Boolean, default: () => false },
    imageHidden: { type: Boolean, default: () => false }
  },
  data: () => ({
    imgErrorSrc: require('../../assets/svg/error404.svg')
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
  width: 10em;
  object-fit: cover;
  height: 8em;
}
.container{
  min-height: 1.5em;
  width: 10em;
  height: fit-content;
  position: relative;
  margin: 0.2em;
  border-radius: 1em;
  border: black 0.1em solid;
  background-color: var(--grey-background);
  overflow: hidden;
}

.title{
  font-size: 1.2em;
  width: 8em;
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
  display: grid;
  place-items: center;
}
</style>
