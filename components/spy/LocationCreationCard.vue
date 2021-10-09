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
      <div>
        Тайтл
      </div>
      <input :value="title" @change="$emit('titleChanged', {locationId: id, title: $event.target.value})">
      <div>
        Картинка
      </div>
      <input :value="img" @change="$emit('imgChanged', {locationId: id, image: $event.target.value})">
      <div>
        Роли
      </div>
      <input v-for="(role, i) in roles" :key="i" :value="role" @change="$emit('roleChanged', {locationId: id, index: i, role: $event.target.value})">
    </div>
    <button @click="deleteLocation">
      Удалить локацию
    </button>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

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
    ...mapMutations('spy', [
      'DELETE_LOCATION'
    ]),
    changeVisible () {
      this.isRolesShowed = !this.isRolesShowed
    },
    deleteLocation () {
      this.DELETE_LOCATION({
        id: this.id
      })
    }
  }
}
</script>

<style scoped>
.checkout{
  width: 200px;
  height: 500px;
  background-color: blue;
}
</style>
