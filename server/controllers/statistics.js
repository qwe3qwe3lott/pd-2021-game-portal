const Statistics = require('../models/statistics.js')

module.exports.getStatistics = async function (req, res) {
  const statistics = await Statistics.find({})
  const mir = statistics.reduce(function (r, a) {
    r[a.game] = r[a.game] || []
    r[a.game].push(a)
    return r
  }, Object.create(null))
  res.status(200).json(mir)
}

module.exports.addStatistics = async function (req, res) {
  const data = req.body
  const statistics = new Statistics(data)
  await statistics.save()
  res.status(200).json({
    statisticsId: statistics.id
  })
}
