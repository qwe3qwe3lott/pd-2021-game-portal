import { Line } from 'vue-chartjs'

export default {
  extends: Line,
  props: ['chartData', 'options'],
  labelFontSize: 24,
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
