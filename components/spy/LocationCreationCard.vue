<template>
  <div :key="id">
    <b>{{ title }}</b>
    <i>{{ img }}</i>
    <b>{{ id }}</b>
    <input :checked="requires" type="checkbox" @input="$emit('isRequiredChanged', {title, requires:!requires})">
    <div v-for="(role, i) in roles" :key="i">
      {{ role }}
    </div>
    <button @click="changeVisible">
      Изменить настройки локации
    </button>
    <div v-show="isRolesShowed" class="checkout">
      <input v-for="(role, i) in roles" :key="i" :value="role">
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: Number,
      default: () => -1
    },
    title: {
      type: String,
      default: () => ''
    },
    img: {
      type: String,
      default: () => ''
    },
    roles: {
      type: Array,
      default: () => []
    },
    requires: {
      type: Boolean,
      default: () => true
    }
  },
  data () {
    return {
      isRolesShowed: false
    }
  },
  methods: {
    changeVisible () {
      this.isRolesShowed = !this.isRolesShowed
    }
  }
}
</script>

<style scoped>
.checkout{
  width: 200px;
  height: 200px;
  background-color: blue;
}
</style>
