<template>
  <div>
    <nuxt-link :to="'/'">
      Назад
    </nuxt-link>
    <br>
    <button @click="createRoom">
      Создать комнату
    </button>
  </div>
</template>

<script>

export default {
  methods: {
    async createRoom () {
      const res = await this.$back.posts.createRoom({})
      await this.$router.push({ path: `/spy/${res.data.roomId}` })
    }
  }
}
</script>

<style scoped>

</style>
