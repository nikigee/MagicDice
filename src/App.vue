<template>
  <div id="out-out-wrap">
    <div id="content" tabindex="0">
      <MainMenu />
    </div>
    <div id="notif-section"></div>
    <footer>
      <span>&#169;Magic Dice 2020</span>
      <span>
        A tool created by
        <a href="https://nikgo.me" target="_blank">Nikita Golev</a>
      </span>
      <span>
        Contact me by
        <a href="mailto:ngolev.bus@gmail.com">Email</a>
      </span>
      <span>
        Github
        <a href="https://nikgo.me" target="_blank">Source Code</a>
      </span>
      <span>
        Full Credits
      </span>
    </footer>
  </div>
</template>

<script>
import MainMenu from "./components/MainMenu.vue";

export default {
  name: "App",
  components: {
    MainMenu
  }
};
</script>

<style>
@import "./assets/css/style.css";
</style>
