import { Bar } from 'vue-chartjs'
import consolaGlobalInstance from 'consola'

export default {
  extends: Bar,
  props: ['chartData', 'options'],
  mounted () {
    const parsed = JSON.parse(JSON.stringify(this.chartData))
    consolaGlobalInstance.log(parsed)
    this.renderChart(parsed, this.options)
  }
}
