<template>
  <div :key="id" class="card">
    <div class="header">
      <Switcher :state="requires" @input="UPDATE_REQUIRE_LOCATION_FLAG({ locationId: id, flag: !requires})" />
      <button class="title-button" @click="isOpened = !isOpened">
        {{ title }}
      </button>
      <button class="delete-button" @click="DELETE_LOCATION({ locationId: id })" />
    </div>
    <div v-show="isOpened" class="body">
      <div class="info">
        <Field
          class="text-field"
          :label="'Название'"
          :type="'text'"
          :max-length="32"
          :value="title"
          @input="UPDATE_TITLE({locationId: id, title: $event.target.value})"
        />
        <Field
          class="text-field"
          :label="'URL картинки'"
          :type="'url'"
          :max-length="512"
          :value="img"
          @input="UPDATE_IMAGE({locationId: id, image: $event.target.value})"
        />
        <LocationCard :location="{title, img}" />
      </div>
      <FieldSet
        class="roles"
        :label="'Роли'"
        :max-length="32"
        :type="'text'"
        :values="roles"
        @input="UPDATE_ROLE({locationId: id, index: $event.fieldIndex, role: $event.target.value})"
      />
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import LocationCard from '@/components/spy/LocationCard'
import Switcher from '@/components/UI/inputs/Switcher'
import Field from '@/components/UI/inputs/Field'
import FieldSet from '@/components/UI/inputs/FieldSet'
export default {
  components: { LocationCard, Switcher, Field, FieldSet },
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
  color: white;
  background: var(--primary-color);
  border-radius: 1em;
  padding: 0 0.5em;
  max-width: 30em;
  width: 100%;
  margin: 0.3em 0;
}
.header {
  width: 100%;
  display: flex;
  align-items: center;
  color: var(--primary-color-primary-text);
}
.body{
  height: fit-content;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  justify-content: center;
  background-color: var(--modal-background-color);
  border-radius: 0.5em;
  margin-bottom: 0.3em;
  padding: 0.3em;
}
.title-button {
  width: 100%;
  height: 2.2em;
  line-height: 1.5em;
  white-space: nowrap;
}
.delete-button {
  min-width: 1.5em;
  max-width: 1.5em;
  height: 1.5em;
  background-color: var(--primary-color-primary-text);
  mask: url("./assets/svg/trash-icon.svg");
  mask-repeat: no-repeat;
  mask-size: cover;
}
.info {
  display: grid;
  place-items: center;
  gap: 0.5em;
}
</style>
