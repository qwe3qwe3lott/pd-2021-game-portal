<template>
  <div>
    <h1>Комната {{ $route.params.room }}</h1>
    <div class="temp-container">
      <button :disabled="gameIsRunning" @click="become(true)">
        Зрители
      </button>
      <div v-for="(user, index) in watchers" :key="index">
        {{ user.username }}{{ (user.isOwner ? ' (owner)' : '') }}
      </div>
    </div>
    <br>
    <div class="temp-container">
      <button :disabled="gameIsRunning" @click="become(false)">
        Игроки
      </button>
      <PlayerCard
        v-for="(user, index) in (gameIsRunning ? players : playersFromUsers)"
        :key="index"
        :username="user.username"
        :is-owner="user.isOwner"
        :score="user.score"
        :is-offline="gameIsRunning && !playersFromUsers.some(p => p.username === user.username)"
        :allow-to-vote="gameIsRunning && !gameIsOnPause && !gameIsOnVoting && !gameIsOnBrief && player && player.votes && player.votes.some(vote => vote === user.username)"
        @votingAgainstPlayer="startVotingAgainstPlayer"
      />
    </div>
    <div v-show="winners.length > 0">
      <b>{{ winners.length === 1 ? 'Победитель:' : 'Победители:' }}</b>
      <div v-for="(winner, index) in winners" :key="index">
        {{ winner }}
      </div>
    </div>
    <br>
    <div v-if="iAmOwner" class="temp-container">
      <b>Панель владельца</b>
      <button :disabled="gameIsRunning && !gameIsOnPause" @click="startOrResumeGame">
        {{ (gameIsRunning ? 'Возобновить игру' : 'Начать игру') }}
      </button>
      <button :disabled="!gameIsRunning || gameIsOnPause" @click="pauseGame">
        Приостановить игру
      </button>
      <button :disabled="!gameIsRunning" @click="stopGame">
        Закончить игру
      </button>
    </div>
    <br>
    <!-- Основной таймер -->
    <Timer :time="timerTime" :is-on-pause="gameIsOnPause || gameIsOnVoting" />
    <br>
    <!-- Таймер для голосования -->
    <div v-show="gameIsOnVoting">
      <Timer :time="additionalTimerTime" :is-on-pause="gameIsOnPause" />
      <b>{{ voting.defendantUsername }} обвиняется в шпионаже</b>
      <div v-show="iAmPlayer && ![voting.defendantUsername, voting.accuserUsername].includes(username)">
        <button @click="voteAgainstPlayer(true)">
          Согласиться
        </button>
        <button @click="voteAgainstPlayer(false)">
          Не согласиться
        </button>
      </div>
    </div>
    <br>
    <div v-if="gameIsRunning" class="temp-container">
      <div v-if="gameIsOnBrief">
        <b>Перерыв между раундами</b>
      </div>
      <div v-else-if="!iAmPlayer">
        <b>Вы зритель и не знаете подробностей раунда</b>
      </div>
      <div v-else>
        <b>Текущий раунд</b>
        <i>Роль: {{ player ? (player.isSpy ? 'Шпион' : player.role) : '' }}</i>
        <i>Локация: {{ location ? location.title : '???' }}</i>
      </div>
    </div>
    <br>
    <div class="temp-container">
      <b>Локации</b>
      <LocationCard v-for="(loc, index) in locations" :key="index" :location="loc" :spy="gameIsRunning && !gameIsOnPause && !gameIsOnBrief && (player ? player.isSpy : false)" @pinpoint="pinpointLocation" />
    </div>
    <br>
    <nuxt-link :to="'/'">
      Выйти
    </nuxt-link>
  </div>
</template>

<script>
import consolaGlobalInstance from 'consola'
import LocationCard from '@/components/spy/LocationCard'
import PlayerCard from '@/components/spy/PlayerCard'
import Timer from '@/components/timer/Timer'
// TODO: Сделать указание на локацию после раунда и на указанную шпионом локаицю
export default {
  components: { LocationCard, PlayerCard, Timer },
  layout: 'gameLayout',
  async validate (ctx) {
    const res = await ctx.$back.getters.checkRoom(ctx.route.params.room)
    return res.data.exists
  },
  data () {
    return {
      users: [],
      locations: [],
      roomId: this.$route.params.room,
      roundId: null,
      ownerKey: '',
      gameIsRunning: false,
      gameIsOnPause: false,
      gameIsOnBrief: false,
      gameIsOnVoting: false,
      gameIsOnSpyChance: false,
      player: null,
      players: [],
      winners: [],
      location: null,
      voting: { defendantUsername: null, accuserUsername: null },
      timerTime: { originTime: 0, currentTime: 0 },
      additionalTimerTime: { originTime: 0, currentTime: 0 },
      ioApi: {},
      ioData: {}
    }
  },
  computed: {
    iAmOwner () { return this.myUser.isOwner },
    iAmPlayer () { return this.gameIsRunning ? this.players.some(p => p.username === this.username) : !this.myUser.isWatcher },
    myUser () { return this.users.find(user => user.username === this.username) ?? {} },
    watchers () { return this.users.filter(user => user.isWatcher) },
    playersFromUsers () { return this.users.filter(user => !user.isWatcher) },
    username: {
      get () { return this.$store.getters.getUsername },
      set (username) { this.$store.commit('SET_USERNAME', username) }
    }
  },
  watch: {
    'ioApi.ready' () {
      if (!this.username) { return }
      this.joinRoom()
    },
    'ioData.users' (users) { this.users = users; consolaGlobalInstance.log('users', users) },
    'ioData.rename' (username) { this.username = username; consolaGlobalInstance.log('rename', username) },
    'ioData.locations' (locations) { this.locations = locations; consolaGlobalInstance.log('locations', locations) },
    'ioData.ownerKey' (ownerKey) { this.ownerKey = ownerKey; consolaGlobalInstance.log('ownerKey', ownerKey) },
    'ioData.gameRunningFlag' (gameRunningFlag) { this.gameIsRunning = gameRunningFlag; consolaGlobalInstance.log('gameIsRunning', gameRunningFlag) },
    'ioData.gamePauseFlag' (gamePauseFlag) { this.gameIsOnPause = gamePauseFlag; consolaGlobalInstance.log('gameIsOnPause', gamePauseFlag) },
    'ioData.gameBriefFlag' (gameBriefFlag) { this.gameIsOnBrief = gameBriefFlag; consolaGlobalInstance.log('gameIsOnBrief', gameBriefFlag) },
    'ioData.gameVotingFlag' (gameVotingFlag) { this.gameIsOnVoting = gameVotingFlag; consolaGlobalInstance.log('gameIsOnVoting', gameVotingFlag) },
    'ioData.gameSpyChanceFlag' (gameSpyChanceFlag) { this.gameIsOnSpyChance = gameSpyChanceFlag; consolaGlobalInstance.log('gameIsOnSpyChance', gameSpyChanceFlag) },
    'ioData.roundId' (roundId) { this.roundId = roundId; consolaGlobalInstance.log('roundId', roundId) },
    'ioData.players' (players) { this.players = players; consolaGlobalInstance.log('players', players) },
    'ioData.player' (player) { this.player = player; consolaGlobalInstance.log('player', player) },
    'ioData.location' (location) { this.location = location; consolaGlobalInstance.log('location', location) },
    'ioData.timerTime' (timerTime) { this.timerTime = timerTime; consolaGlobalInstance.log('timerTime', timerTime) },
    'ioData.additionalTimerTime' (additionalTimerTime) { this.additionalTimerTime = additionalTimerTime; consolaGlobalInstance.log('additionalTimerTime', additionalTimerTime) },
    'ioData.voting' (voting) { this.voting = voting; consolaGlobalInstance.log('voting', voting) },
    'ioData.winners' (winners) { this.winners = winners; consolaGlobalInstance.log('winners', winners) }
  },
  mounted () {
    this.socket = this.$nuxtSocket({
      name: 'spy',
      channel: '/spy',
      serverAPI: true
    })
    consolaGlobalInstance.log(this.socket)
  },
  methods: {
    joinRoom () {
      this.ioApi.joinRoom({
        roomId: this.roomId,
        username: this.username
      })
    },
    // TODO: На клиенте расширить проверки состояния комнаты перед отправкой запросов
    become (becomeWatcher) {
      if (this.gameIsRunning || this.myUser.isWatcher === becomeWatcher) { return }
      this.ioApi.become({
        roomId: this.roomId,
        username: this.username,
        becomeWatcher
      })
    },
    startOrResumeGame () {
      if (!this.ownerKey) { return }
      this.ioApi.startOrResumeGame({
        roomId: this.roomId,
        ownerKey: this.ownerKey
      })
    },
    pauseGame () {
      if (!this.gameIsRunning || !this.ownerKey) { return }
      this.ioApi.pauseGame({
        roomId: this.roomId,
        ownerKey: this.ownerKey
      })
    },
    stopGame () {
      if (!this.gameIsRunning || !this.ownerKey) { return }
      this.ioApi.stopGame({
        roomId: this.roomId,
        ownerKey: this.ownerKey
      })
    },
    pinpointLocation (location) {
      if (!this.gameIsRunning || !this.player || !this.player.spyKey) { return }
      consolaGlobalInstance.log('pinpointLocation')
      this.ioApi.pinpointLocation({
        roomId: this.roomId,
        username: this.username,
        spyKey: this.player.spyKey,
        location,
        roundId: this.roundId
      })
    },
    startVotingAgainstPlayer (username) {
      if (!this.gameIsRunning || this.gameIsOnPause || this.gameIsOnBrief || this.gameIsOnVoting || this.gameIsOnSpyChance) { return }
      consolaGlobalInstance.log('startVotingAgainstPlayer')
      this.ioApi.startVotingAgainstPlayer({
        roomId: this.roomId,
        username: this.username,
        defendantUsername: username,
        roundId: this.roundId
      })
    },
    voteAgainstPlayer (voteFlag) {
      if (!this.gameIsRunning || this.gameIsOnPause || this.gameIsOnBrief || !this.gameIsOnVoting || this.gameIsOnSpyChance) { return }
      if (this.username === this.voting.defendantUsername || this.username === this.voting.accuserUsername) { return }
      consolaGlobalInstance.log('voteAgainstPlayer')
      this.ioApi.voteAgainstPlayer({
        roomId: this.roomId,
        username: this.username,
        defendantUsername: this.voting.defendantUsername,
        voteFlag,
        roundId: this.roundId
      })
    }
  }
}
</script>

<style scoped>
.temp-container {
  padding: 5px;
  outline: #1400ff 1px solid;
  width: fit-content;
}
</style>
