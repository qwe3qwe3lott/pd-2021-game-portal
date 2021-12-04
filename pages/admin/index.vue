<template>
  <div class="main">
    <h1 class="page-title">Статистика по играм</h1>
    <CardDashboard
      v-for="(statistics, index) in statisticsData"
      :key="index"
      :statistics="statistics"
    />
  </div>
</template>

<script>
import CardDashboard from '@/components/dashboard/CardDashboard'

export default {
  components: { CardDashboard },
  layout: 'empty',
  data () {
    return {
      statisticsData: []
    }
  },
  beforeMount () {
    this.checkAuth()
    this.showStatistics()
  },
  methods: {
    checkAuth () {
      if (!(localStorage.getItem('auth')?.length > 0)) {
        this.$router.push('/admin/login')
      }
    },
    showStatistics () {
      this.$back.getters.getAllStatistics().then(({ data }) => {
        for (const item in data) {
          this.statisticsData.push({
            nameGame: item,
            statisticsGame: data[item]
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.main{
  padding: 40px;
}

.page-title{
  text-align: center;
}
</style>
