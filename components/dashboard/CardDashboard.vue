<template>
  <div class="">
    <div class="title-card">
      {{ statistics.nameGame }}
    </div>
    <div class="cards">
      <line-chart :chartData="countPlayers" :height="300" class="card" :options="{labelFontSize: 24}"/>
      <bar-chart :chartData="ratingLocation" :height="300" class="card"/>
    </div>
  </div>
</template>

<script>
import LineChart from './LineChart.js'
import BarChart from './BarChart'

export default {
  name: 'CardDashboard',
  components: {
    BarChart,
    LineChart
  },
  props: {
    statistics: {
      type: Object,
      default: () => {
      }
    }
  },
  data () {
    return {
      countPlayers: {
        labels: [],
        datasets: [
          {
            backgroundColor: '#444040',
            hoverBackgroundColor: 'rgba(255, 0, 0, 1)',
            label: 'Количество игроков',
            data: []
          }
        ]
      },
      ratingLocation: {
        labels: [],
        datasets: [
          {
            backgroundColor: 'rgba(55,114,255,0.56)',
            hoverBackgroundColor: 'rgba(255, 0, 0, 1)',
            label: 'Количество используемых локаций',
            defaultFontSize: '20',
            data: []
          }
        ]
      }
      // ratingLocation: [{}]
    }
  },
  beforeMount () {
    this.updateStatistics()
  },
  methods: {
    updateStatistics () {
      this.statistics.statisticsGame.forEach((item) => {
        this.countPlayers.labels.push(item.number_of_players)
        this.countPlayers.datasets[0].data.push(item.number_of_players)
        this.ratingLocation.labels.push(item.locations_passed)
        this.ratingLocation.datasets[0].data.push(item.locations_passed)
      })
    }
  }
}
</script>CardDashboard

<style scoped>
.title-card {
  font-size: 30px;
  color: white;
}

.cards {
  display: flex;
  gap: 50px;
}

.card {
  max-width: 400px;
}
</style>
