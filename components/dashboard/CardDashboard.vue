<template>
  <div class="">
    <div class="title-card">
      Шпион
    </div>
    <div class="cards">
      <line-chart
        v-if="spyWins.datasets[0].data.length > 0"
        :chartData="spyWins"
        :height="300"
        class="card"
        :options="{labelFontSize: 50}"
      />
      <line-chart
        v-if="spyLoses.datasets[0].data.length > 0"
        :chartData="spyLoses"
        :height="300"
        class="card"
        :options="{labelFontSize: 24}"
      />
      <line-chart
        v-if="spiesCount.datasets[0].data.length > 0"
        :chartData="spiesCount"
        :height="300"
        class="card"
        :options="{labelFontSize: 24}"
      />
      <line-chart
        v-if="locationsCount.datasets[0].data.length > 0"
        :chartData="locationsCount"
        :height="300"
        class="card"
        :options="{labelFontSize: 24}"
      />
    </div>
  </div>
</template>

<script>
import LineChart from './LineChart'

export default {
  name: 'CardDashboard',
  components: {
    LineChart
  },
  props: ['statistics'],
  data () {
    return {
      spyWins: {
        labels: [],
        datasets: [
          {
            backgroundColor: '#de8282',
            hoverBackgroundColor: 'rgb(7,7,7)',
            label: 'Победы шпионов',
            data: []
          }
        ]
      },
      spyLoses: {
        labels: [],
        datasets: [
          {
            backgroundColor: 'rgba(55,114,255,0.56)',
            hoverBackgroundColor: 'rgba(255, 0, 0, 1)',
            label: 'Проигрыш шпиона',
            defaultFontSize: '20',
            data: []
          }
        ]
      },
      spiesCount: {
        labels: [],
        datasets: [
          {
            backgroundColor: 'rgba(94,178,65,0.56)',
            hoverBackgroundColor: 'rgba(255, 0, 0, 1)',
            label: 'Шпионов в игре',
            defaultFontSize: '20',
            data: []
          }
        ]
      },
      locationsCount: {
        labels: [],
        datasets: [
          {
            backgroundColor: 'rgba(222,215,21,0.56)',
            hoverBackgroundColor: 'rgba(255, 0, 0, 1)',
            label: 'Использовалось локаций',
            defaultFontSize: '20',
            data: []
          }
        ]
      }
    }
  },
  beforeMount () {
    this.updateStatistics()
  },
  methods: {
    async updateStatistics () {
      const allStatistics = await this.statistics
      allStatistics.forEach((item) => {
        this.spyWins.labels.push(item.spyWins)
        this.spyWins.datasets[0].data.push(item.spyWins)
        this.spyLoses.labels.push(item.spyLoses)
        this.spyLoses.datasets[0].data.push(item.spyLoses)
        this.spiesCount.labels.push(item.spiesCount)
        this.spiesCount.datasets[0].data.push(item.spiesCount)
        this.locationsCount.labels.push(item.locationsCount)
        this.locationsCount.datasets[0].data.push(item.locationsCount)
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
  flex-wrap: wrap;
  justify-content: space-around;
  border-bottom: 3px solid gray;
}

.card {
  max-width: 400px;
}

@media (max-width: 950px) {
  .title-card {
    text-align: center;
  }
}

@media (max-width: 420px) {
  .card {
    max-width: 340px;
  }
}
</style>
