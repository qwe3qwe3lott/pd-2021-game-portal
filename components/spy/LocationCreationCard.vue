<template>
  <div :key="id">
    <b v-show="!isOpened">{{ title }}</b>
    <input :checked="requires" type="checkbox" @input="UPDATE_REQUIRE_LOCATION_FLAG({ locationId: id, flag: !requires})">
    <button @click="isOpened = !isOpened">
      Изменить настройки локации
    </button>
    <div v-show="isOpened" class="checkout">
      <div class="info">
        <div>
          Тайтл
        </div>
        <input type="text" maxlength="32" :value="title" @input="UPDATE_TITLE({locationId: id, title: $event.target.value})">
        <div>
          Картинка
        </div>
        <input type="url" maxlength="512" :value="img" @input="UPDATE_IMAGE({locationId: id, image: $event.target.value})">
        <LocationCard :location="{title, img}" />
      </div>
      <div class="roles">
        <div>
          Роли
        </div>
        <input
          v-for="(role, i) in roles"
          :key="i"
          type="text"
          maxlength="32"
          :value="role"
          @input="UPDATE_ROLE({locationId: id, index: i, role: $event.target.value})"
        >
      </div>
    </div>
    <button @click="DELETE_LOCATION({ locationId: id })">
      Удалить локацию
    </button>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import LocationCard from '@/components/spy/LocationCard'
export default {
  components: {
    LocationCard
  },
  props: {
    id: { type: Number, default: () => -1 },
    title: { type: String, default: () => '' },
    img: { type: String, default: () => '' },
    roles: { type: Array, default: () => [] },
    requires: { type: Boolean, default: () => true }
  },
  data () {
    return {
      isOpened: false
    }
  },
  methods: {
    ...mapMutations('spy', ['UPDATE_REQUIRE_LOCATION_FLAG', 'DELETE_LOCATION', 'UPDATE_ROLE', 'UPDATE_TITLE', 'UPDATE_IMAGE'])
  }
}
</script>

<style scoped>
.checkout{
  width: fit-content;
  height: fit-content;
  background-color: lightgray;
  display: flex;
}

.roles, .info{
  display: flex;
  flex-direction: column;
}
</style>
