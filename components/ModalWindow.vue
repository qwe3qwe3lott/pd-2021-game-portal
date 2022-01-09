<template>
  <div class="background">
    <div class="window" role="dialog">
      <h2 class="title">
        {{ title }}
      </h2>
      <button type="button" class="close" @click="$emit('close')" />
      <div class="content">
        <slot name="content" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ModalWindow',
  props: {
    title: {
      type: String,
      default: () => ''
    }
  }
}
</script>

<style scoped>
.background {
  z-index: 999;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  place-items: center;
  background-color: var(--modal-background-color);
}
.window {
  max-width: 90vw;
  background-color: var(--primary-color);
  padding: 0.3em;
  border-radius: 0.5em;
  display: grid;
  grid-gap: 0.5em;
  grid-template:
  "title close" auto
  "content content" auto / max-content auto;
}
.close {
  height: 1.5em;
  width: 1.5em;
  background-color: var(--primary-color-primary-text);
  mask: url("./assets/svg/cross-icon.svg");
  mask-repeat: no-repeat;
  mask-size: cover;
  place-self: end;
  grid-area: close;
}
.title {
  color: var(--primary-color-primary-text);
  grid-area: title;
  text-align: center;
}
.content {
  max-height: calc(100vh - 7em);
  overflow-y: scroll;
  max-width: 90vw;
  grid-area: content;
  -ms-overflow-style: none;
  scrollbar-width: none;
  display: grid;
  place-items: center;
  grid-gap: 0.3em;
}
.content::-webkit-scrollbar {
  display: none;
}
</style>
