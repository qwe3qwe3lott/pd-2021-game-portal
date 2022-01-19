import { Line } from 'vue-chartjs'

export default {
  extends: Line,
  props: ['chartData', 'options'],
  labelFontSize: 24,
  mounted () {
    const parsed = JSON.parse(JSON.stringify(this.chartData))
    this.renderChart(parsed, this.options)
  }
}
