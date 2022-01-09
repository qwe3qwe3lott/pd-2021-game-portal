<template>
  <label class="checkbox" :title="title">
    <input :checked="state" type="checkbox" class="checkbox" @input="$emit('input')">
    <div class="checkbox__text">⁣</div>
  </label>
</template>

<script>
export default {
  name: 'Switcher',
  props: {
    state: { type: Boolean, default: () => true },
    title: { type: String, default: () => '' }
  }
}
</script>

<style scoped>
.checkbox input {
  position: absolute;
  z-index: -1;
  opacity: 0;
  margin: 0.5em 0 0 1em;
}
.checkbox__text {
  position: relative;
  padding: 0 0 0 3em;
  cursor: pointer;
}
.checkbox__text:before {
  content: '';
  position: absolute;
  top: -0.1em;
  left: 0;
  width: 2.5em;
  height: 1.3em;
  border-radius: 0.65em;
  background: black;
  box-shadow: inset 0 0.1em 0.15em rgba(0,0,0,.2);
  transition: .2s;
}
.checkbox__text:after {
  content: '';
  position: absolute;
  left: 0.1em;
  width: 1.1em;
  height: 1.1em;
  border-radius: 0.5em;
  background: #E25225;
  box-shadow: 0 0.1em 0.25em rgba(0,0,0,.3);
  transition: .2s;
}
.checkbox input:checked + .checkbox__text:before {
  background: white;
}
.checkbox input:checked + .checkbox__text:after {
  left: 1.3em;
}
.checkbox input:focus + .checkbox__text:before {
  box-shadow: inset 0 0.1em 0.15em rgba(0,0,0,.2), 0 0 0 0.15em rgba(255,255,0,.7);
}
</style>
