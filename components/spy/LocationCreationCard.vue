<template>
  <div :key="id" class="card">
    <div class="header">
      <Switcher :requires="requires" @input="UPDATE_REQUIRE_LOCATION_FLAG({ locationId: id, flag: !requires})" />
      <button class="title-button" @click="isOpened = !isOpened">
        {{ title }}
      </button>
      <button class="delete-button" @click="DELETE_LOCATION({ locationId: id })" />
    </div>
    <div v-show="isOpened" class="body">
      <div class="info">
        <!-- TODO: Вынести поле с инпутом в UI компонент -->
        <label>
          Название
          <input type="text" maxlength="32" :value="title" @input="UPDATE_TITLE({locationId: id, title: $event.target.value})">
        </label>
        <br>
        <label>
          URL картинки
          <input type="url" maxlength="512" :value="img" @input="UPDATE_IMAGE({locationId: id, image: $event.target.value})">
        </label>
        <LocationCard :location="{title, img}" />
      </div>
      <div class="roles">
        <div>
          Роли
        </div>
        <input
          v-for="(role, i) in roles"
          :key="i"
          style="display: block"
          type="text"
          maxlength="32"
          :value="role"
          @input="UPDATE_ROLE({locationId: id, index: i, role: $event.target.value})"
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import LocationCard from '@/components/spy/LocationCard'
import Switcher from '@/components/UI/inputs/Switcher'
export default {
  components: { LocationCard, Switcher },
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
.card {
  background: var(--primary-color);
  border-radius: 1em;
  padding: 0.5em;
  max-width: 50em;
  min-width: 25em;
  width: fit-content;
  margin: 0.3em 0;
}
.header {
  width: 100%;
  display: flex;
  align-items: center;
  color: var(--primary-color-primary-text);
}
.body{
  margin-top: 0.4em;
  width: max-content;
  height: fit-content;
  display: flex;
  justify-content: center;
  background-color: var(--modal-background-color);
  border-radius: 0.5em;
  padding: 0.3em;
}
.body input{
  border-radius: 15px;
  font-family: inherit;
  font-size: 8pt;
}
.title-button {
  width: 100%;
}
.delete-button{
  width: 1.5em;
  height: 1.5em;
  background: url("./assets/svg/trash-icon.svg");
}
</style>
