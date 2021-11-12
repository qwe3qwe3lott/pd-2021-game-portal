<template>
  <div class="wrapper">
    <Header />
    <Nuxt class="main" />
    <Footer />
  </div>
</template>

<style scoped>

.wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1 1 auto;
}
</style>
