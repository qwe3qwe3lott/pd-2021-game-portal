<template>
  <div class="container">
    <div class="small">
      <p class="title">
        {{ location.title }}
      </p>
    </div>
    <img :src="location.img" class="image">
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
.image{
  width: 12em;
  object-fit: cover;
  height: 10em;
  border-radius: 25%;
}
.container{
  position: relative;
}
.title{
  font-size: 30px;
}
.small {
  position: absolute;
  height: 100%;
  width: 100%;
  display: grid;
  place-items: center;
}

</style>
