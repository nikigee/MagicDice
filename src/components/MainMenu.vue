<template>
  <transition appear name="animate__fadeInDown">
    <div id="main-wrap">
      <img src="../assets/images/MagicLogo.png" id="MagicDiceLogo" alt="Magic Dice Logo" />
      <div id="main-menu">
        <span class="menu-option" id="menu-rolldice">Roll Dice</span>
        <span class="menu-option" onclick="MagicUI.createCharacter()">Create Character</span>
        <span class="menu-option" id="menu-load">Load Character</span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "MainMenu"
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import "../assets/css/animate.min.css";
#main-wrap {
  text-align: center;
  top: 0;
  bottom: 100px;
  margin: auto;
  position: absolute;
  height: max-content;
  left: 0;
  right: 0;
}

#MagicDiceLogo {
  display: block;
  max-width: 450px;
  margin: auto;
}

#main-menu {
  vertical-align: middle;
  text-align: center;
  background: none;
  box-shadow: none;
}

.menu-option {
  text-shadow: 0px 0px 3px black;
  border: dotted 2px white;
  border-radius: 3px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.menu-option:hover {
  background: none;
  color: #c1cace;
  border-color: #c1cace;
  font-weight: normal;
}
</style>
