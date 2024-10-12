// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@unocss/nuxt","@element-plus/nuxt"],
  elementPlus: {},

  // css: [
  //   'element-plus/lib/theme-chalk/index.css' // 引用Element Plus的默认主题样式
  // ]
});
