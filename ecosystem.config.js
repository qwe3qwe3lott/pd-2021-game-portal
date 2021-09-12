module.exports = {
  apps: [
    {
      name: 'pd-2021-gama-portal',
      exec_mode: 'cluster',
      instances: 'max',
      script: './node_modules/nuxt/bin/nuxt.js',
      args: 'start'
    }
  ]
}
