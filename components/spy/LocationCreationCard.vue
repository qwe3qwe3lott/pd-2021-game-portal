<template>
  <div :key="id" class="card-body">
    <label class="checkbox">
      <input :checked="requires" type="checkbox" class="checkbox" @input="UPDATE_REQUIRE_LOCATION_FLAG({ locationId: id, flag: !requires})">
      <div class="checkbox__text">⁣</div>
    </label>
    <b v-if="requires" v-show="!isOpened" class="card-name">{{ title }}</b>
    <b v-else v-show="!isOpened" class="card-name_turned-off">{{ title }}</b>
    <div class="button-handler">
      <button class="card-button" @click="isOpened = !isOpened">
        <img src="../../assets/svg/Edit_icon_(the_Noun_Project_30184).svg" width="30" alt="Изменить настройки локации">
      </button>
      <button class="card-button" @click="DELETE_LOCATION({ locationId: id })">
        <img src="../../assets/svg/delete-button.svg" width="25" alt="Удалить локацию">
      </button>
    </div>
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
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import LocationCard from '@/components/spy/LocationCard'
export default {
  components: { LocationCard },
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
.card-body{
  background: #E54817;
  border-radius: 15px;
  padding: 0.5%;
  width: 45%;
  margin-bottom: 0.5%;
  box-shadow: 0 5px 5px rgba(0,0,0,0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.checkout{
  width: fit-content;
  height: fit-content;
  display: flex;
  background-color: rgb(0,0,0,0.3);
  border-radius: 15px;
  padding: 1%;
  color: white;
}
.checkout input{
  border-radius: 15px;
  font-family: inherit;
  font-size: 8pt;
}

.roles, .info{
  display: flex;
  flex-direction: column;
}

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
.card-button{
  width: max-content;
  border: none;
  border-radius: 15px;
  background-color: #E54917;
  color: white;
  cursor: pointer;
  font-size: 12pt;
  display: flex;
  align-items: center;
  gap: 2%;
  font-family: 'Press Start 2P', cursive;
}
.button-handler{
  display: flex;
  width: 10%;
  justify-content: space-between;
}
.card-name{
  color: white;
  font-size: 10pt;
}
.card-name_turned-off{
  color: black;
  font-size: 10pt;
}
</style>
