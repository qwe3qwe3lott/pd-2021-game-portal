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
  background: url("../assets/svg/cross-icon.svg");
  place-self: end;
  grid-area: close;
}
.title {
  grid-area: title;
  text-align: center;
  max-width: 36em;
}
.content {
  grid-area: content;
}
</style>
