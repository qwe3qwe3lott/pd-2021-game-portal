<template>
  <fieldset class="set">
    <legend class="label">
      {{ label }}
    </legend>
    <input
      v-for="(value, i) in values"
      :key="i"
      class="input"
      :type="type"
      :maxlength="maxLength"
      :value="value"
      @input="$emit('input', (() => { $event.fieldIndex = i; return $event }).call())"
    >
  </fieldset>
</template>

<script>
export default {
  name: 'FieldSet',
  props: {
    type: { type: String, default: () => 'text' },
    maxLength: { type: Number, default: () => undefined },
    values: { default: () => '', type: undefined },
    label: { type: String, default: () => '' }
  }
}
</script>

<style scoped>
.set {
  text-align: center;
  color: inherit;
  display: grid;
  place-items: center;
  grid-gap: 0.2em;
}
.input {
  border-radius: 1.5em;
  padding: 0.2em;
}
</style>
