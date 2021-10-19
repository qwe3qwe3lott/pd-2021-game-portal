<template>
  <div class="container">
    <p class="username" :style="{'font-weight': (isOwner ? 'bold' : 'normal'), opacity: (isOffline ? 0.5 : 1)}">
      {{ username }}
    </p>
    <button class="button" :disabled="!allowToVote" @click="$emit('votingAgainstPlayer', username)">
      Обвинить
    </button>
    <p class="score">
      {{ score }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'PlayerCard',
  props: {
    username: {
      type: String,
      default: () => ''
    },
    isOwner: {
      type: Boolean,
      default: () => false
    },
    isOffline: {
      type: Boolean,
      default: () => false
    },
    score: {
      type: Number,
      default: () => 0
    },
    allowToVote: {
      type: Boolean,
      default: () => false
    }
  }
}
</script>

<style scoped>
.container {
  margin: 0.2em;
  padding: 0.2em;
  background: #3E4447;
  width: 12em;
  height: fit-content;
  display: flex;
}
.username {
  color: white;
  flex-grow: 1;
}
.button {
  width: 1em;
}
.score {
  color: white;
}
</style>
