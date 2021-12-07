<template>
  <label class="checkbox">
    <input :checked="requires" type="checkbox" class="checkbox" @input="$emit('input')">
    <div class="checkbox__text">⁣</div>
  </label>
</template>

<script>
export default {
  name: 'Switcher',
  props: {
    requires: { type: Boolean, default: () => true }
  }
}
</script>

<style scoped>
.checkbox input {
  position: absolute;
  z-index: -1;
  opacity: 0;
  margin: 10px 0 0 20px;
}
.checkbox__text {
  position: relative;
  padding: 0 0 0 60px;
  cursor: pointer;
}
.checkbox__text:before {
  content: '';
  position: absolute;
  top: -4px;
  left: 0;
  width: 50px;
  height: 26px;
  border-radius: 13px;
  background: black;
  box-shadow: inset 0 2px 3px rgba(0,0,0,.2);
  transition: .2s;
}
.checkbox__text:after {
  content: '';
  position: absolute;
  top: -2px;
  left: 2px;
  width: 22px;
  height: 22px;
  border-radius: 10px;
  background: #E25225;
  box-shadow: 0 2px 5px rgba(0,0,0,.3);
  transition: .2s;
}
.checkbox input:checked + .checkbox__text:before {
  background: white;
}
.checkbox input:checked + .checkbox__text:after {
  left: 26px;
}
.checkbox input:focus + .checkbox__text:before {
  box-shadow: inset 0 2px 3px rgba(0,0,0,.2), 0 0 0 3px rgba(255,255,0,.7);
}
</style>
