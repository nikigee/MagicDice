const DM = (() => {
    const DM_obj = {};
    DM_obj.config = localStorage.getItem("md_dmconfig") ? JSON.parse(localStorage.getItem("md_dmconfig")) : {
        img_folder: "./src/img"
    };
    DM_obj.saveConfig = () => {
        console.log("Saving config...");
        localStorage.setItem("md_dmconfig", JSON.stringify(DM_obj.config));
        return console.log(JSON.parse(localStorage.getItem("md_dmconfig")));
    };

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

    // Combat and initative tracker
    DM_obj.battleBoard = (() => {
        function genID() {
            const colours = ["blue", "red", "purple", "green", "white", "yellow", "pink", "orange", "crimson", "gold", "darkgreen", "cyan", "magenta"];
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
                        image = `./src/img/monster.jpg`,
                        full_data = {},
                        id = genID()
                } = props;
                this.maxHP = Number(maxHP),
                    this.currentHP = Number(currentHP),
                    this.AC = AC,
                    this.attack = Number(attack),
                    this.name = name,
                    this.full_data = full_data,
                    this.image = (image == "") ? `${DM_obj.config.img_folder}/monsters/${name.toLowerCase().replace(/ /g, "-")}.jpg` : image,
                    this.id = id
            }
            get pp() {
                return Math.round((this.currentHP / this.maxHP) * 100)
            }
            get strID() {
                return this.id.color + this.id.number
            }
            get isBlooded() {
                if (this.pp < 50) {
                    return true
                } else {
                    return false
                }
            }
            add(amt) {
                this.currentHP += amt; // the modding itself
                if (this.currentHP > this.maxHP) {
                    this.currentHP = this.maxHP;
                }
                var status = (amt < 0) ? "Damaged" : "Healed"; // did it heal or damage?
                console.log(status + " by " + amt + " points! %c(HP: " + this.currentHP + " / " + this.maxHP + ")", "color:" + getColor(this.currentHP / this.maxHP * 100));
                return this.currentHP;
            }
        };

        class battleBoard {
            constructor(props = {}) {
                const {
                    initList = localStorage.dm_initlist ? JSON.parse(localStorage.getItem("dm_initlist")) : [],
                        monsterList = new Map()
                } = props;
                this.initList = initList;
                this.monsterList = monsterList;
            }
            collectInfo(callback) {
                // clear previous info
                this.initList = [];
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
            addMonster(monsterData) {
                const mnstr = new Monster(monsterData);
                // make sure it's unique
                while (this.monsterList.get(mnstr.strID)) {
                    mnstr.id = genID();
                }
                this.monsterList.set(mnstr.strID, mnstr);
            }
            updateBattle() {
                const battleHTML = document.getElementById("battle-list");
                if (!battleHTML) {
                    return false
                }
                battleHTML.innerHTML = "";
                this.monsterList.forEach((mnstr) => {
                    battleHTML.insertAdjacentHTML("beforeend", `<div class="monster-pill" style="background:url('${mnstr.image}') center center; border: 2px solid ${mnstr.isBlooded ? "red" : "#32cd32"};background-size: cover;">
                    <div class="monster-info spoiler">
                        <h3>${mnstr.name}</h3>
                        <span class="ac-shield">AC: ${mnstr.AC}</span>
                        <span id="attack${mnstr.strID}">Attack Roll: ${mnstr.attack < 0 ? mnstr.attack : `+${mnstr.attack}`}</span>
                        <span style="color:${mnstr.id.color}">ID: ${mnstr.strID}</span>
                        <div class="fill-bar health-bar"><span class="fill" style="width: ${mnstr.pp}%; background: ${getColor(mnstr.pp)}">${mnstr.currentHP}/${mnstr.maxHP}</span></div>
                        <div class="monster-buttons"><i class="fa fa-info-circle"></i><i class="fa fa-remove"></i></div>
                    </div>
                    </div>`);
                    document.getElementById(`attack${mnstr.strID}`).addEventListener("click", (e)=>{
                        die.gfx_dice(`d20+${mnstr.attack}`, e.clientX-100, e.clientY-50);
                    });
                    const health_bar = document.getElementsByClassName("health-bar");
                    health_bar[health_bar.length - 1].addEventListener("click", (e) => {
                        const health_window = new richDice(e.clientX, e.clientY);
                        health_window.setSize(300);
                        health_window.setTitle("Add/Remove Health");
                        health_window.setDescription("Enter a number to add/remove health from this character.");
                        health_window.addPrompt("Amount to add", "-12");
                        health_window.css.alignment = "left";
                        health_window.render((d) => {
                            d.getElementsByClassName(health_window.ID + "Amount to add")[0].addEventListener("keydown", (e) => {
                                if (e.keyCode == 13) {
                                    let num = e.target.value;
                                    if (isFinite(Number(num))) {
                                        mnstr.add(Number(num));
                                    } else if (new RegExp(/[0-9]{0,9}d[0-9]{1,9}/).test(num)) {
                                        mnstr.add(die.r(String(num)));
                                    }
                                    this.updateBattle();
                                    d.remove();
                                }
                            });
                        });
                    });
                    const remove_button = document.getElementsByClassName("fa-remove");
                    remove_button[remove_button.length - 1].addEventListener("click", () => {
                        console.log(`Deleting ${mnstr.name} from list...`);
                        this.monsterList.delete(mnstr.strID);
                        this.updateBattle();
                    });
                    const info_button = document.getElementsByClassName("fa-info-circle");
                    info_button[info_button.length - 1].addEventListener("click", (e) => {
                        const popup = new richDice(e.clientX - 250, e.clientY - 250);
                        popup.setTitle(`${mnstr.name}`);
                        popup.setDescription("Opening a portal to the ethereal plane...");
                        popup.addCustomHTML("", `<iframe width=500 height=700 src="https://chisaipete.github.io/bestiary/creatures/${mnstr.name.toLowerCase().replace(/ /g, "-")}"></iframe>`);
                        popup.css.footer_padding = 0;
                        popup.render();
                    });
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
                        <button class="btn-main" id="library-add">Library Add</button>
                        <button class="btn-main" id="remove-battle">Remove All</button>
                        <button class="btn-main" id="spoiler-button">Hide OFF</button>
                    </div>
                </div>` : ""}
                </div>`;
                document.getElementById("main").innerHTML = html;
                if (btl) {
                    this.updateBattle();
                    document.getElementById("add-battle").addEventListener("click", (e) => {
                        const form = new richDice(e.clientX - 150, e.clientY - 300);
                        form.setTitle("Monster Creator");
                        form.setDescription("Fill out this form to add a monster to the board.");
                        form.setBackground("./src/img/monsters.jpg");
                        form.addPrompt("Name", "Bandit");
                        form.addPrompt("Max HP", "11");
                        form.addPrompt("AC", "12");
                        form.addPrompt("Attack Roll", "3");
                        form.addPrompt("Image URL", "https://i.pinimg.com/736x/a8/f1/b1/a8f1b1a353b92c3e8e166c9eb088f0ba.jpg");
                        form.addPrompt("Color Grouping", "orange");
                        form.addPrompt("Quantity", "1");
                        form.render((dom) => {
                            const inputs = dom.getElementsByTagName("input");
                            for (let i = 0; i < inputs.length; i++) {
                                inputs[i].addEventListener("keydown", (e) => {
                                    if (e.key == "Enter") {
                                        const color_string = dom.getElementsByClassName(`${form.ID}Color Grouping`)[0].value.length ? dom.getElementsByClassName(`${form.ID}Color Grouping`)[0].value.toLowerCase() : genID().color;
                                        let j = isNaN(dom.getElementsByClassName(`${form.ID}Quantity`)[0].value) ? 1 : Number(dom.getElementsByClassName(`${form.ID}Quantity`)[0].value);
                                        if (j == 0)
                                            j = 1;
                                        for (let i = 0; i < j; i++) {
                                            this.addMonster({
                                                name: dom.getElementsByClassName(`${form.ID}Name`)[0].value,
                                                maxHP: Number(dom.getElementsByClassName(`${form.ID}Max HP`)[0].value),
                                                AC: Number(dom.getElementsByClassName(`${form.ID}AC`)[0].value),
                                                attack: Number(dom.getElementsByClassName(`${form.ID}Attack Roll`)[0].value),
                                                image: (dom.getElementsByClassName(`${form.ID}Image URL`)[0].value) ? dom.getElementsByClassName(`${form.ID}Image URL`)[0].value : undefined,
                                                id: {
                                                    color: color_string,
                                                    number: i + 1
                                                }
                                            });
                                        };
                                        this.updateBattle();
                                        dom.remove();
                                    }
                                });
                            }
                        });
                    });
                    document.getElementById("remove-battle").addEventListener("click", () => {
                        this.monsterList = new Map();
                        this.updateBattle();
                    });
                    document.getElementById("library-add").addEventListener("click", (e) => {
                        const library = new richDice(e.clientX - 100, e.clientY - 150);
                        library.setTitle("Add From Library");
                        library.setDescription("Add a monster from Falius' archives");
                        let list = "";
                        Library.monsters.forEach((v)=>{
                            list += `<option>${v.name}</option>`
                        });
                        library.addCustomHTML("Monster Name", `<input type=text list=monsters class="monster_name_input">
                        <datalist id=monsters >
                            ${list}
                        </datalist>`);
                        library.addPrompt("Quantity", "1");
                        // handle callback
                        library.render((dom)=>{
                            const inputs = dom.getElementsByTagName("input");
                            for (let i = 0; i < inputs.length; i++) {
                                inputs[i].addEventListener("keydown", (e) => {
                                    if (e.key == "Enter") {
                                        if(!Library.monsters.get(dom.getElementsByClassName(`monster_name_input`)[0].value)){
                                            return false;
                                        }
                                        let j = isNaN(dom.getElementsByClassName(`${library.ID}Quantity`)[0].value) ? 1 : Number(dom.getElementsByClassName(`${library.ID}Quantity`)[0].value);
                                        if (j == 0)
                                            j = 1;
                                        const monster = Library.monsters.get(dom.getElementsByClassName(`monster_name_input`)[0].value);
                                        const id_color = genID().color;
                                        for (let i = 0; i < j; i++) {
                                            monster.id = {color: id_color, number: i+1};
                                            this.addMonster(monster);
                                            dom.remove();
                                        }
                                        this.updateBattle();
                                    }
                                });
                            }
                        });
                    });
                    document.getElementById("spoiler-button").addEventListener("click", (e) => {
                        const spoilers = document.getElementsByClassName("spoiler");
                        const visibility = spoilers[0].style.visibility == "hidden" ? "visible" : "hidden";
                        for (let i = 0; i < spoilers.length; i++) {
                            spoilers[i].style.visibility = visibility;
                        }
                        e.target.innerHTML = `Hide ${visibility == "hidden" ? "ON" : "OFF"}`;
                    });
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