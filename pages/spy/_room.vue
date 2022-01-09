<template>
  <div>
    <input
      ref="roomId"
      v-model="currentURL"
      class="hidden-room-id"
      readonly
      @focus="$event.target.select()"
    >
    <div class="room-header">
      <button @click="copyInviteLink">
        Скопировать приглашение
      </button>
      <div class="watchers-block">
        <button :disabled="gameIsRunning" @click="become(true)">
          Зрители:
        </button>
        <span v-show="!watchers.length"> зрителей нет</span>
        <div v-for="(user, index) in watchers" :key="index" :style="{ 'font-weight': (user.isOwner ? 'bold': 'normal') }">
          {{ user.username }}
        </div>
      </div>
    </div>
    <nuxt-link :to="'/'" class="exit-room">
      Выйти из комнаты
    </nuxt-link>
    <!---->
    <div class="temp-container">
      <div class="game-panel">
        <div class="timers">
          <!-- Основной таймер -->
          <Timer
            v-show="!gameIsOnVoting && !gameIsOnSpyChance"
            :time="timerTime"
            :is-on-pause="gameIsOnPause || gameIsOnVoting"
          />
          <br>
          <!-- Таймер для голосования -->
          <div v-show="gameIsOnVoting || gameIsOnSpyChance">
            <Timer :time="additionalTimerTime" :is-on-pause="gameIsOnPause" />
            <b v-show="!gameIsOnSpyChance">{{ voting.defendantUsername }} обвиняется в шпионаже</b>
            <b v-show="gameIsOnSpyChance">Шпион угадывает локацию</b>
            <div
              v-show="!gameIsOnSpyChance && iAmPlayer && ![voting.defendantUsername, voting.accuserUsername].includes(username)"
            >
              <button @click="voteAgainstPlayer(true)">
                Согласиться
              </button>
              <button @click="voteAgainstPlayer(false)">
                Не согласиться
              </button>
            </div>
          </div>
        </div>
        <!--Статус игрока-->
        <div v-if="gameIsRunning" class="status-player">
          <div v-if="gameIsOnBrief">
            <b>Перерыв между раундами</b>
          </div>
          <div v-else-if="!iAmPlayer">
            <b>Вы зритель и не знаете подробностей раунда</b>
          </div>
          <div v-else>
            <span>Роль: {{ player ? (player.isSpy ? 'Шпион' : player.role) : '' }}</span>
            <span>Локация: {{ location ? location.title : '???' }}</span>
          </div>
        </div>
        <!--Список игроков-->
        <div class="list-players">
          <button title="Войти в игру" class="list-players__button" :disabled="gameIsRunning" @click="become(false)">
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
      </div>
    </div>
    <div v-show="winners.length > 0" class="winners-pane">
      <b>{{ winners.length === 1 ? 'Победитель:' : 'Победители:' }}</b>
      <div v-for="(winner, index) in winners" :key="index">
        {{ winner }}
      </div>
    </div>
    <div class="temp-container">
      <div v-if="iAmOwner" class="panel-owner">
        <div class="base-button">
          <button :disabled="gameIsRunning && !gameIsOnPause" @click="startOrResumeGame">
            <img
              class="panel-owner__image"
              :src="require('~/assets/svg/start-game.png')"
              title="Начать игру"
              alt="Начать игру"
            >
          </button>
          <button :disabled="!gameIsRunning || gameIsOnPause" @click="pauseGame">
            <img
              class="panel-owner__image"
              :src="require('~/assets/svg/pause-game.png')"
              title="Приостановить игру"
              alt="Приостановить игру"
            >
          </button>
          <button :disabled="!gameIsRunning" @click="stopGame">
            <img
              class="panel-owner__image"
              :src="require('~/assets/svg/cross-icon.svg')"
              title="Закончить игру"
              alt="Закончить игру"
            >
          </button>
          <button :disabled="gameIsRunning" @click="showOptionsCard = true">
            <img
              class="panel-owner__image"
              :src="require('~/assets/svg/gear.svg')"
              title="Расширенные настройки"
              alt="Расширенные настройки"
            >
          </button>
        </div>
        <form v-if="!gameIsRunning" @submit.prevent="setNewRoomOptions()">
          <modal-window v-if="showOptionsCard" :title="'Расширенные настройки'" @close="showOptionsCard = false">
            <template #content>
              <OptionsCard />
              <input class="panel-owner__settings" type="submit" value="Обновить правила">
            </template>
          </modal-window>
        </form>
      </div>
    </div>
    <div class="settings-block">
      <Switcher :state="hideLocationsPictures" :title="'Скрывать картинки'" class="pictures-hider" @input="hideLocationsPictures = !hideLocationsPictures" />
    </div>
    <div class="temp-container">
      <div class="locations-container location-list">
        <LocationCard
          v-for="(loc, index) in locations"
          :key="index"
          :was-correct="loc.wasCorrect"
          :was-pinpointed="loc.wasPinpointed"
          :image-hidden="hideLocationsPictures"
          :location="loc"
          :spy="gameIsRunning && !gameIsOnPause && !gameIsOnBrief && (!gameIsOnVoting || gameIsOnSpyChance) && (player ? player.isSpy : false)"
          @pinpoint="pinpointLocation"
        />
      </div>
    </div>
    <br>
  </div>
</template>

<script>
import consolaGlobalInstance from 'consola'
import { mapState } from 'vuex'
import Switcher from '@/components/UI/inputs/Switcher'
import LocationCard from '@/components/spy/LocationCard'
import PlayerCard from '@/components/spy/PlayerCard'
import Timer from '@/components/timer/Timer'
import OptionsCard from '@/components/spy/OptionsCard'
export default {
  components: {
    LocationCard,
    PlayerCard,
    Timer,
    OptionsCard,
    Switcher
  },
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
      voting: {
        defendantUsername: null,
        accuserUsername: null
      },
      timerTime: {
        originTime: 0,
        currentTime: 0
      },
      additionalTimerTime: {
        originTime: 0,
        currentTime: 0
      },
      ioApi: {},
      ioData: {},
      showOptionsCard: false,
      hideLocationsPictures: false,
      currentURL: ''
    }
  },
  computed: {
    iAmOwner () {
      return this.myUser.isOwner
    },
    iAmPlayer () {
      return this.gameIsRunning ? this.players.some(p => p.username === this.username) : !this.myUser.isWatcher
    },
    myUser () {
      return this.users.find(user => user.username === this.username) ?? {}
    },
    watchers () {
      return this.users.filter(user => user.isWatcher)
    },
    playersFromUsers () {
      return this.users.filter(user => !user.isWatcher)
    },
    username: {
      get () {
        return this.$store.state.username
      },
      set (value) {
        this.$store.commit('SET_USERNAME', value)
      }
    },
    anyGameIsRunningFlag: {
      get () {
        return this.$store.state.anyGameIsRunningFlag
      },
      set (value) {
        this.$store.commit('SET_ANY_GAME_IS_RUNNING_FLAG', value)
      }
    },
    ...mapState('spy', ['roomOptions']),
    ...mapState(['oldUsername'])
  },
  watch: {
    'ioApi.ready' () {
      consolaGlobalInstance.log('ioApi.ready')
      if (!this.username) {
        this.$router.push({ path: '/' })
        return
      }
      this.joinRoom()
    },
    'ioData.users' (users) {
      this.users = users
      consolaGlobalInstance.log('users', users)
    },
    'ioData.rename' (username) {
      this.username = {
        username,
        isServerRename: true
      }
      consolaGlobalInstance.log('rename', username)
    },
    'ioData.locations' (locations) {
      this.locations = locations
      consolaGlobalInstance.log('locations', locations)
    },
    'ioData.ownerKey' (ownerKey) {
      this.ownerKey = ownerKey
      consolaGlobalInstance.log('ownerKey', ownerKey)
    },
    'ioData.gameRunningFlag' (gameRunningFlag) {
      this.gameIsRunning = gameRunningFlag
      if (!gameRunningFlag) { this.clearLocationsMarks() }
      consolaGlobalInstance.log('gameIsRunning', gameRunningFlag)
      this.anyGameIsRunningFlag = gameRunningFlag
    },
    'ioData.gamePauseFlag' (gamePauseFlag) {
      this.gameIsOnPause = gamePauseFlag
      consolaGlobalInstance.log('gameIsOnPause', gamePauseFlag)
    },
    'ioData.gameBriefFlag' (gameBriefFlag) {
      this.gameIsOnBrief = gameBriefFlag
      consolaGlobalInstance.log('gameIsOnBrief', gameBriefFlag)
    },
    'ioData.locationsTitles' (payload) {
      consolaGlobalInstance.log('locationsTitles', payload)
      this.setLocationsMarkers(payload.spyLocation, payload.correctLocation)
    },
    'ioData.gameVotingFlag' (gameVotingFlag) {
      this.gameIsOnVoting = gameVotingFlag
      consolaGlobalInstance.log('gameIsOnVoting', gameVotingFlag)
    },
    'ioData.gameSpyChanceFlag' (gameSpyChanceFlag) {
      this.gameIsOnSpyChance = gameSpyChanceFlag
      consolaGlobalInstance.log('gameIsOnSpyChance', gameSpyChanceFlag)
    },
    'ioData.roundId' (roundId) {
      this.roundId = roundId
      this.clearLocationsMarks()
      consolaGlobalInstance.log('roundId', roundId)
    },
    'ioData.players' (players) {
      this.players = players
      consolaGlobalInstance.log('players', players)
    },
    'ioData.player' (player) {
      this.player = player
      consolaGlobalInstance.log('player', player)
    },
    'ioData.location' (location) {
      this.location = location
      consolaGlobalInstance.log('location', location)
    },
    'ioData.timerTime' (timerTime) {
      this.timerTime = timerTime
      consolaGlobalInstance.log('timerTime', timerTime)
    },
    'ioData.additionalTimerTime' (additionalTimerTime) {
      this.additionalTimerTime = additionalTimerTime
      consolaGlobalInstance.log('additionalTimerTime', additionalTimerTime)
    },
    'ioData.voting' (voting) {
      this.voting = voting
      consolaGlobalInstance.log('voting', voting)
    },
    'ioData.winners' (winners) {
      this.winners = winners
      consolaGlobalInstance.log('winners', winners)
    }
  },
  mounted () {
    this.currentURL = window.location.href
    this.socket = this.$nuxtSocket({
      name: 'spy',
      channel: '/spy',
      serverAPI: true
    })
    consolaGlobalInstance.log(this.socket)
    this.usernameHandler = this.$store.subscribe((mutation) => {
      if (mutation.type !== 'SET_USERNAME') {
        return
      }
      if (mutation.payload.isServerRename) {
        return
      }
      this.changeUsername()
    })
  },
  destroyed () {
    this.anyGameIsRunningFlag = false
    this.usernameHandler()
  },
  methods: {
    copyInviteLink () {
      this.$refs.roomId.focus()
      document.execCommand('copy')
    },
    joinRoom () {
      consolaGlobalInstance.log('joinRoom')
      this.ioApi.joinRoom({
        roomId: this.roomId,
        username: this.username
      })
    },
    // TODO: На клиенте расширить проверки состояния комнаты перед отправкой запросов
    become (becomeWatcher) {
      if (this.gameIsRunning || this.myUser.isWatcher === becomeWatcher) {
        return
      }
      consolaGlobalInstance.log('become')
      this.ioApi.become({
        roomId: this.roomId,
        username: this.username,
        becomeWatcher
      })
    },
    startOrResumeGame () {
      if (!this.ownerKey) {
        return
      }
      consolaGlobalInstance.log('startOrResumeGame')
      this.ioApi.startOrResumeGame({
        roomId: this.roomId,
        ownerKey: this.ownerKey
      })
    },
    pauseGame () {
      if (!this.gameIsRunning || !this.ownerKey) {
        return
      }
      consolaGlobalInstance.log('pauseGame')
      this.ioApi.pauseGame({
        roomId: this.roomId,
        ownerKey: this.ownerKey
      })
    },
    stopGame () {
      if (!this.gameIsRunning || !this.ownerKey) {
        return
      }
      consolaGlobalInstance.log('stopGame')
      this.ioApi.stopGame({
        roomId: this.roomId,
        ownerKey: this.ownerKey
      })
    },
    pinpointLocation (location) {
      if (!this.gameIsRunning || this.gameIsOnPause || this.gameIsOnBrief || (this.gameIsOnVoting && !this.gameIsOnSpyChance) || !this.player || !this.player.spyKey) {
        return
      }
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
      if (!this.gameIsRunning || this.gameIsOnPause || this.gameIsOnBrief || this.gameIsOnVoting || this.gameIsOnSpyChance) {
        return
      }
      consolaGlobalInstance.log('startVotingAgainstPlayer')
      this.ioApi.startVotingAgainstPlayer({
        roomId: this.roomId,
        username: this.username,
        defendantUsername: username,
        roundId: this.roundId
      })
    },
    voteAgainstPlayer (voteFlag) {
      if (!this.gameIsRunning || this.gameIsOnPause || this.gameIsOnBrief || !this.gameIsOnVoting || this.gameIsOnSpyChance) {
        return
      }
      if (this.username === this.voting.defendantUsername || this.username === this.voting.accuserUsername) {
        return
      }
      consolaGlobalInstance.log('voteAgainstPlayer')
      this.ioApi.voteAgainstPlayer({
        roomId: this.roomId,
        username: this.username,
        defendantUsername: this.voting.defendantUsername,
        voteFlag,
        roundId: this.roundId
      })
    },
    setNewRoomOptions () {
      if (this.gameIsRunning) {
        return
      }
      const newOptions = {}
      for (const option of this.roomOptions) {
        newOptions[option.key] = option.value
      }
      consolaGlobalInstance.log('setNewRoomOptions')
      this.ioApi.setNewRoomOptions({
        roomId: this.roomId,
        ownerKey: this.ownerKey,
        options: newOptions
      }).then(() => { this.showOptionsCard = false })
    },
    changeUsername () {
      if (this.gameIsRunning || this.username === this.oldUsername) {
        return
      }
      this.ioApi.changeUsername({
        roomId: this.roomId,
        oldUsername: this.oldUsername,
        newUsername: this.username
      })
    },
    clearLocationsMarks () {
      this.locations.forEach((location) => {
        delete location.wasCorrect
        delete location.wasPinpointed
      })
    },
    setLocationsMarkers (spyTitle, correctTitle) {
      const spyLocationId = this.locations.findIndex(loc => loc.title === spyTitle)
      const correctLocationId = this.locations.findIndex(loc => loc.title === correctTitle)
      if (correctLocationId !== -1) {
        const correctLocation = this.locations[correctLocationId]
        correctLocation.wasCorrect = true
        this.locations[correctLocationId] = correctLocation
      }
      if (spyLocationId !== -1) {
        const spyLocation = this.locations[spyLocationId]
        spyLocation.wasPinpointed = true
        this.locations[spyLocationId] = spyLocation
      }
    }
  }
}
</script>

<style scoped>
.hidden-room-id {
  position: fixed;
  top: -100px
}

.room-header {
  display: flex;
  justify-content: space-between;
  padding: 0.5em;
  background-color: var(--grey-background);
  color: var(--primary-color-primary-text)
}

.exit-room {
  text-decoration: none;
  color: black;
  display: flex;
  justify-content: center;
}

.watchers-block {
  display: flex;
  gap: 10px;
}

.game-panel {
  height: auto;
  padding: 0.5em;
  margin: 0.5em auto;
  display: flex;
  background-color: var(--grey-black-background);
  max-width: 650px;
  border-radius: 1em;
  box-shadow: 5px 5px 5px 5px #54331b;
  gap: 1em;
  justify-content: space-between;
}

.status-player {
  padding: 1em;
  max-width: 180px;
  min-width: 180px;
  border: white 1px solid;
  border-radius: 0.5em;
}

.status-player div {
  background-blend-mode: multiply;
  border-radius: 1em;
  height: 100%;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1em;
  color: white;
}

.timers {
  max-width: 150px;
  flex-direction: column;
  display: flex;
  text-align: center;
  justify-content: center;
  color: var(--primary-color-primary-text);
}

.list-players {
  min-width: 200px;
}

.list-players__button {
  color: white;
  text-align: center;
  display: flex;
  margin: 0 auto;
}

.panel-owner {
  margin: 0 auto 1em;
  max-width: 500px;
}

.base-button {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1em;
}

.panel-owner__image {
  width: 30px;
}

.panel-owner form {
  display: flex;
  justify-content: space-between;
}
.winners-pane {
  display: grid;
  place-items: center;
}
.panel-owner__settings {
  color: var(--primary-color-primary-text);
}

.settings-block {
  display: grid;
  place-items: center;
}

.location-list {
  justify-content: center;
}

.temp-container {
  padding: 5px;
}

.locations-container {
  display: flex;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .game-panel {
    flex-direction: column;
    align-items: center;
  }
}
</style>
