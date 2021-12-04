const Statistics = require('../models/statistics.js')

module.exports.getStatistics = async function (req, res) {
  const statistics = await Statistics.find({})
  res.status(200).json(statistics)
}

module.exports.addStatistics = async function (req, res) {
  const data = req.body
  const statistics = new Statistics(data)
  await statistics.save()
  res.status(200).json({
    statisticsId: statistics.id
  })
}
