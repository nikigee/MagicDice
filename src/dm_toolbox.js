const DM = (() => {
    const DM_obj = {};

    // Combat and initative tracker
    DM_obj.battleBoard = (() => {
        function getColor(PP) {
            if (PP >= 80) {
                return "limegreen";
            } else if (PP >= 65) {
                return "green";
            } else if (PP > 45) {
                return "orange";
            } else if (PP > 15) {
                return "orangered"
            } else {
                return "red";
            }
        }
        class battleBoard {
            constructor(props = {}) {
                const {
                    initList = localStorage.dm_initlist ? JSON.parse(localStorage.getItem("dm_initlist")) : [],
                    monsterList = [],
                } = props;
                this.initList = initList;
                this.monsterList = monsterList;
            }
            collectInfo(callback) {
                // clear previous info
                this.initList = [];
                this.monsterList = [];

                // initiative section
                const initBlocks = document.getElementsByClassName("init-block");
                for (let i = 0; i < initBlocks.length; i++) {
                    this.initList.push({
                        name: initBlocks[i].getElementsByClassName("init-name")[0].value,
                        roll: Number(initBlocks[i].getElementsByClassName("init-roll")[0].value)
                    });
                }
                if (typeof (Storage) !== "undefined")
                    localStorage.setItem("dm_initlist", JSON.stringify(this.initList));
                if (typeof callback == "function")
                    callback();
            }
            updateInit() {
                const initHTML = document.getElementById("init-list");
                if (!initHTML) {
                    return false;
                }
                initHTML.innerHTML = "";
                for (let i = 0; i < this.initList.length; i++) {
                    initHTML.insertAdjacentHTML("beforeend", `<div class="init-block">
                    <input type="text" class="init-name" value="${this.initList[i].name}">
                    <input type="number" class="init-roll" value="${this.initList[i].roll}">
                    </div>`);
                }
                const initInput = initHTML.getElementsByClassName("init-name");
                for (let i = 0; i < initInput.length; i++) {
                    initInput[i].addEventListener("keydown", (e) => {
                        if (e.key == "Delete") {
                            e.target.parentNode.remove();
                            this.collectInfo();
                        };
                    });
                }
            }
            addInit() {
                this.collectInfo(() => {
                    this.initList.push({
                        name: "",
                        roll: 0
                    });
                    this.updateInit();
                });
            }
            sortInit() {
                // collect all the info
                this.collectInfo(() => {
                    this.initList.sort((a, b) => {
                        return b.roll - a.roll
                    });
                    this.updateInit();
                });
            }
            updateBattle() {
                const battleHTML = document.getElementById("battle-list");
                if (!battleHTML) {
                    return false
                }
                battleHTML.innerHTML = "";
                this.monsterList.forEach((mnstr) => {
                    battleHTML.insertAdjacentHTML("beforeend", `<div class="monster-pill" style="background:url("${mnstr.image}") center center; border: 2px solid ${mnstr.isBlooded() ? "red" : "#32cd32"};">
                    <div class="monster-info spoiler">
                        <h3>${mnstr.name}</h3>
                        <span class="ac-shield">AC: ${mnstr.AC}</span>
                        <div class="health-bar"><span class="fill" style="width: 100%; background: ${getColor(mnstr.health.pp)}">${mnstr.health.currentHP}/${mnstr.health.maxHP}</span></div>
                    </div>
                    </div>`);
                });
            }
            create(args = {}) {
                const {
                    init = true,
                        btl = true
                } = args;
                let html = `<div id="monster-board">
                ${init ? `<div id="init-ladder">
                    <div id="init-list">
                    </div>
                    <div id="init-options">
                        <button class="btn-main" id="add-init">Add</button>
                        <button class="btn-main" id="sort-init">Sort</button>
                    </div>
                </div>` : ""}
                ${btl ? `<div id="battle-table">
                    <div id="battle-list">
                    </div>
                    <div id="battle-options">
                        <button class="btn-main" id="add-battle">Add</button>
                        <button class="btn-main" id="add-battle">Remove All</button>
                        <button class="btn-main" id="spoiler-button">Hide OFF</button>
                    </div>
                </div>` : ""}
                </div>`;
                document.getElementById("main").innerHTML = html;
                if (btl) {
                    this.updateBattle();
                }
                if (init) {
                    this.updateInit();
                    document.getElementById("sort-init").addEventListener("click", () => {
                        this.sortInit();
                    });
                    document.getElementById("add-init").addEventListener("click", () => {
                        this.addInit();
                    });
                }
            }
        };
        return new battleBoard();
    })();

    return DM_obj;
})();