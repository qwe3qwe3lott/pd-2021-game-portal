<template>
  <label class="label">
    {{ label }}
    <input :type="type" :maxlength="maxLength" :value="value" class="input" @input="$emit('input', $event)">
  </label>
</template>

<script>
export default {
  name: 'TextField',
  props: {
    type: { type: String, default: () => 'text' },
    maxLength: { type: Number, default: () => undefined },
    value: { default: () => '', type: undefined },
    label: { type: String, default: () => '' }
  }
}
</script>

<style scoped>
.label {
  color: inherit;
  display: grid;
  grid-gap: 0.2em;
  height: min-content;
  place-items: center;
}
.input {
  border-radius: 1.5em;
  padding: 0.2em;
}
</style>
