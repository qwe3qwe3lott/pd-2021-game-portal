<template>
  <div class="main">
    <button
      class="exit_button"
      @click="exit"
    >
      Выйти
    </button>
    <h1 class="page-title">Статистика по играм</h1>
    <CardDashboard
      :statistics="showStatistics()"
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
      statisticsData: null
    }
  },
  beforeMount () {
    this.checkAuth()
  },
  methods: {
    exit () {
      localStorage.setItem('auth', '')
      this.$router.push('/')
    },
    checkAuth () {
      if (!(localStorage.getItem('auth')?.length > 0)) {
        this.$router.push('/admin/login')
      }
    },
    async showStatistics () {
      const { data } = await this.$back.getters.getAllStatistics()
      const array = data.spy
      const result = []
      for (const item in array) {
        result.push(array[item].meta)
      }
      return result
    }
  }
}

</script>

<style scoped>

.exit_button{
  display: flex;
  margin-left: auto;
}
.main {
  padding: 40px;
  background-color: #c3bfbe;
}

.page-title {
  text-align: center;
  font-size: 30px;
}
</style>
