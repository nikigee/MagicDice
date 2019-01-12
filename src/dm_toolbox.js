const DM = (() => {
    const DM_obj = {};

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

    function returnFromAPI(category, name, callback) {
        name = name.replace(" ", "+");
        const request = new XMLHttpRequest();
        request.open("GET", `http://dnd5eapi.co/api/${category}/?name=${name}`);
        request.onload = () => {
            const data = JSON.parse(this.response);
            if (request.status >= 200 && request.status < 400) {
                if (data.count != 0) {
                    // if found
                    const new_request = new XMLHttpRequest();
                    new_request.open("GET", data.url);
                    new_request.onload = () => {
                        const new_data = JSON.parse(this.response);
                        if (new_request.status >= 200 && new_request.status < 400) {
                            callback(new_data); // finally found what we're looking for.
                        } else {
                            console.log(`Error returned code: ${new_request.status}`);
                        }
                    };
                    new_request.send();
                } else {
                    console.log("No results found!");
                }
            } else {
                console.log(`Error returned code: ${request.status}`);
            }
        }
        request.send();
    }
    // Combat and initative tracker
    DM_obj.battleBoard = (() => {
        function genID() {
            const colours = ["blue", "red", "black", "green", "white", "yellow", "pink", "orange"];
            return {
                color: colours[Math.floor(Math.random() * colours.length)],
                number: Math.floor(Math.random() * 20) + 1
            }
        }
        class Monster {
            constructor(props = {}) {
                const {
                    maxHP = 11,
                        currentHP = maxHP,
                        AC = 12,
                        attack = 3,
                        name = "Bandit",
                        image = "https://i.pinimg.com/736x/a8/f1/b1/a8f1b1a353b92c3e8e166c9eb088f0ba.jpg",
                        full_data = {},
                        id = genID()
                } = props;
                this.maxHP = maxHP,
                    this.currentHP = currentHP,
                    this.AC = AC,
                    this.attack = attack,
                    this.name = name,
                    this.full_data = full_data,
                    this.image = image,
                    this.id = id
            }
            get pp() {
                return Math.round((this.currentHP / this.maxHP) * 100)
            }
        };

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

            // battleList
            addMnstFromAPI(name) {
                returnFromAPI("monsters", name, (data) => {
                    console.log(data);
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
                        <div class="health-bar"><span class="fill" style="width: 100%; background: ${getColor(mnstr.pp)}">${mnstr.currentHP}/${mnstr.maxHP}</span></div>
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