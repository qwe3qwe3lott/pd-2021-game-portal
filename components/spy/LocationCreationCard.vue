<template>
  <div :key="id">
    <b>{{ title }}</b>
    <i>{{ img }}</i>
    <b>{{ id }}</b>
    <input :checked="requires" type="checkbox" @input="UPDATE_REQUIRE_LOCATION_FLAG({ locationId: id, flag: !requires})">
    <div v-for="(role, i) in roles" :key="i">
      {{ role }}
    </div>
    <button @click="isRolesShowed = !isRolesShowed">
      Изменить настройки локации
    </button>
    <div v-show="isRolesShowed" class="checkout">
      <div>
        Тайтл
      </div>
      <input :value="title" @input="UPDATE_TITLE({locationId: id, title: $event.target.value})">
      <div>
        Картинка
      </div>
      <input :value="img" @input="UPDATE_IMAGE({locationId: id, image: $event.target.value})">
      <div>
        Роли
      </div>
      <input v-for="(role, i) in roles" :key="i" :value="role" @input="UPDATE_ROLE({locationId: id, index: i, role: $event.target.value})">
    </div>
    <button @click="DELETE_LOCATION({ locationId: id })">
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
      'UPDATE_REQUIRE_LOCATION_FLAG', 'DELETE_LOCATION', 'UPDATE_ROLE', 'UPDATE_TITLE', 'UPDATE_IMAGE'
    ])
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
