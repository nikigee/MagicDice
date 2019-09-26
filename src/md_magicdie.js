const Dice = (() => {
    /* legacy functions */
    function r(arg, mute) {
        try {
            const rCvrt = cvt(arg);
            if (rCvrt.iterator == 0) {
                return 0;
            }
            let total = 0;
            if (rCvrt.foreach_modifier) {
                if (!mute) {
                    console.log("Modfier (+" + rCvrt.foreach_modifier + ")");
                }
            }
            let roll;
            for (let i = 1; i <= rCvrt.iterator; i++) {
                roll = Math.floor(Math.random() * rCvrt.face) + 1;
                if (rCvrt.foreach_modifier)
                    roll += rCvrt.foreach_modifier;
                if (!mute)
                    console.log("Roll " + i + ": " + roll);
                total += roll;
            }
            if (rCvrt.bonus) {
                if (!mute)
                    console.log(`Bonus Applied (+${rCvrt.bonus})`);
                total = total + rCvrt.bonus;
            }
            if (rCvrt.negative)
                total = total * -1;
            if (!mute) {
                console.log("Total roll: " + total);
            }
            return total;
        } catch (err) {
            return console.error(`Something went wrong while rolling the dice! (${err})`);
        }
    }

    /* turns 8d6 into something the computer understands */
    function cvt(diceRoll) {
        diceRoll = diceRoll.toLowerCase();
        let diceObj = {};
        if (diceRoll[0] == "-") {
            diceRoll = diceRoll.replace("-", "");
            diceObj.negative = true;
        }
        if (diceRoll.includes("*")) {
            diceObj.foreach_modifier = parseInt(diceRoll.split("*")[1]);
        }
        if (diceRoll.includes("+")) {
            diceObj.bonus = parseInt(diceRoll.split("+")[1]);
        }
        diceRoll = diceRoll.split("d");
        diceObj.iterator = (diceRoll[0] != "") ? parseInt(diceRoll[0]) : 1;
        diceObj.face = parseInt(diceRoll[1]);
        if (isNaN(diceObj.iterator) || isNaN(diceObj.face)) {
            throw Error("Invalid dice roll!");
        }
        return diceObj;
    }
    /* turns diceObjects into strings */
    function serialise(diceObj) {
        return `${(diceObj.negative) ? "-" : ""}${diceObj.iterator}d${diceObj.face}${(diceObj.foreach_modifier) ? "*" : ""}${(diceObj.bonus) ? "+"+diceObj.bonus : ""}`;
    }

    class diceRoll {
        constructor(dice = "d20", opts = {}) {
            const {
                x = (document.body.clientWidth / 2) - 225,
                    y = 150
            } = opts;
            this.pos = {
                x,
                y
            };
            this.dice = dice;
            this.roll();
        }
        get diceObj() {
            return cvt(this.dice);
        }
        get max() {
            const rCvrt = this.diceObj;
            return ((rCvrt.face + ((rCvrt.foreach_modifier) ? rCvrt.foreach_modifier : 0)) * rCvrt.iterator) + ((rCvrt.bonus) ? rCvrt.bonus : 0);
        }
        get total() {
            let total = this.list.reduce((a, b) => a + b); // get total from list
            const bonus = this.diceObj.bonus;
            if (bonus)
                total += bonus;
            return total;
        }
        addDice(number){
            const obj = this.diceObj;
            obj.iterator += number; // add x dice
            this.dice = serialise(obj); // convert and set
            this.roll(); // reset
            return this;
        }
        reRoll(value) {
            const index = this.list.indexOf(value);
            if (index != -1) {
                this.list[index] = Math.floor(Math.random() * this.diceObj.face) + 1;
                return this.list[index];
            }
            return false
        }
        roll() {
            try {
                const rCvrt = this.diceObj;
                if (rCvrt.iterator == 0) {
                    return 0;
                }
                let total = 0;
                let list = [];
                let roll;
                for (let i = 1; i <= rCvrt.iterator; i++) {
                    roll = Math.floor(Math.random() * rCvrt.face) + 1;
                    if (rCvrt.foreach_modifier)
                        roll += rCvrt.foreach_modifier;
                    list.push(roll);
                    total += roll;
                }
                if (rCvrt.bonus) {
                    total = total + rCvrt.bonus;
                }
                if (rCvrt.negative)
                    total = total * -1;
                this.list = list;
                return this.total;
            } catch (err) {
                return console.error(`Something went wrong while rolling the dice! (${err})`);
            }
        }
        show() {
            console.log(`Dice Roll (${this.dice})`);
            const rCvrt = this.diceObj;
            if (rCvrt.foreach_modifier) {
                console.log("Modfier (+" + rCvrt.foreach_modifier + ")");
            }
            this.list.forEach((x, i) => {
                console.log(`Roll ${i+1}: ${x}`);
            });
            if (rCvrt.bonus) {
                console.log(`Bonus Applied (+${rCvrt.bonus})`);
            }
            console.log("Total roll: " + this.total);
        }
        render() {
            const dice = new richDice(this.pos.x, this.pos.y);
            const rollObj = this.diceObj;

            dice.setTitle(`Dice Roll (${this.dice})`);
            dice.setDescription(`You raise your hand and throw the dice across the table.`);
            dice.setSize(250, 750);
            dice.css.alignment = "left";

            /* List of rolls */
            if (rollObj.iterator > 1) {
                let htmlList = "<div class='dice-table'>"; // start the custom html table
                this.list.forEach((x, i) => {
                    htmlList += `<div class="gfx_dice">${x}</div>${(i+1 == rollObj.iterator) ? "" : "+"}`;
                });
                htmlList += "</div>";
                dice.addCustomHTML("Rolls:", htmlList);
            }
            /* Showing the bonus or not */
            if (rollObj.bonus) {
                if (rollObj.iterator > 1)
                    dice.addField("Bonus:", `${rollObj.bonus}`);
            }
            dice.addField(`Total: `, this.total); // display total
            const sound = new Audio("./src/misc/diceroll.mp3");
            dice.render(() => {
                sound.play(); // play sound effect
            });
            return dice;
        }
        static r(arg, mute) {
            return r(arg, mute);
        }
        static x(arg) {
            try {
                const dice = new diceRoll(arg);
                dice.show();
                return dice;
            } catch (err) {
                console.error(err);
            }
        }
        static cvt(roll){
            return cvt(roll);
        }
        static gfx_dice(arg, x, y) {
            try {
                const magicRoll = new diceRoll(arg, {
                    x: x,
                    y: y
                }); // the dice roll
                return magicRoll.render();
            } catch (err) {
                return console.error(`Something went wrong while rolling the dice! (${err})`);
            }
        }
    }
    return diceRoll;
})();

const die = {
    r: Dice.r,
    cvt: Dice.cvt,
    x: Dice.x,
    gfx_dice: Dice.gfx_dice
}; // alternate name for static functions

// Player character handler to make things easier, rather than forcing the user to assign their characters to variables.
magicHandler = (() => {
    class magicHandler {
        constructor() {
            this.managed_players = [];
        }
        get last() {
            if (this.managed_players.length > 0) {
                return this.managed_players[this.managed_players.length - 1];
            }
        }
        get ply() {
            if (this.managed_players.length == 0) {
                return console.log("Currently no characters are loaded! You can load from a save file using the command 'Load.restoreFromFile()'");
            } else if (this.managed_players.length == 1) {
                return this.managed_players[0];
            } else {
                return this.managed_players;
            }
        }
        randomPlayer(name = `NPC ${this.managed_players.length}`, lvl = 3) {
            let ran_class = Array.from(Library.player_classes);
            ran_class = ran_class[Math.floor(Math.random() * ran_class.length)][1]; // get a random class
            this.managed_players.push(new Player({
                name: name,
                lvl: lvl,
                classData: ran_class
            }));
            this.last.render.generate();
            MagicUI.populateToolbar();
        }
    }
    return new magicHandler();
})();
Object.defineProperty(self, 'ply', {
    get: function () {
        return magicHandler.ply;
    }
});

const richDice = (() => {
    class richDice {
        constructor(x = 0, y = 0) {
            this.x = x,
                this.y = y,
                this.css = {
                    size: "",
                    alignment: "center",
                    footer_padding: 20,
                    background: "",
                },
                this.title = "Untitled Window",
                this.fields = new Map(),
                this.image = "",
                this.ID = Math.floor(Math.random() * 100000);
        }
        setTitle(title) {
            this.title = title;
        }
        setSize(width, height) {
            if (width) {
                this.css.size += `max-width: ${width}px;`;
                this.width = width;
            }
            if (height) {
                this.height = height;
                this.css.size += `max-height: ${height}px;`
            }
        }
        setBackground(url) {
            this.css.background = `background: url('${url}') center center;`;
        }
        setDescription(desc) {
            this.desc = desc;
        }
        setImage(url) {
            this.image = `<img src="${url}" alt="Image">`;
        }
        addField(title, text) {
            this.fields.set(title, {
                type: 0,
                content: text
            });
        }
        addPrompt(title, placeholder) {
            this.fields.set(title, {
                type: 1,
                content: placeholder
            });
        }
        addCustomHTML(title, text) {
            this.fields.set(title, {
                type: 2,
                content: text
            });
        }
        get dom() {
            return document.getElementsByClassName(this.ID)[0];
        }
        render(callback) {
            this.clicks = "";
            if (this.dom) {
                this.dom.remove();
            }
            /* The richDice Content */
            let content = `<h3>${this.title}</h3>`;
            if (this.desc) {
                content += `<p>${this.desc}</p>`;
            }
            content += this.image;
            this.fields.forEach((v, k) => {
                if (v.type == 0) {
                    content += `
                    <h4>${k}</h4>
                    <span>${v.content}</span>`;
                } else if (v.type == 1) {
                    content += `
                    <label for="${this.ID+k}">${k}</label>
                    <input type="text" placeholder="${v.content}" class="${this.ID+k}">`;
                } else if (v.type == 2) {
                    content += `
                        <h4>${k}</h4>
                        ${v.content}`;
                }
            });
            /* The richDice Container */
            const container = `<div class="richDice ${this.ID}" style="left: ${this.x}; top: ${this.y}; ${this.css.background}">
            <div class="richBar"><span class="richClose"></span></div>
            <div class="richContent" style="text-align: ${this.css.alignment}; padding-bottom: ${this.css.footer_padding}px; ${this.css.size}">
                ${content}
            </div>
            </div>`;
            document.getElementById("main").insertAdjacentHTML('beforeend', container);
            this.dom.firstElementChild.getElementsByClassName("richClose")[0].addEventListener("click", () => {
                this.dom.remove();
            });

            /* you know javascript is the best language when this ugly mess is the only way of getting this to work. kill me.*/
            var obj = this;

            function mouseMove(e) {
                if (!obj.clicks) {
                    obj.clicks = {
                        x: e.clientX,
                        y: e.clientY
                    }
                }
                // if box is removed but mousemove event is still ongoing
                if (!obj.dom) {
                    this.clicks = "";
                    window.removeEventListener("mousemove", mouseMove);
                    return false;
                }
                obj.dom.style.left = obj.x += (e.clientX - obj.clicks.x);
                obj.dom.style.top = obj.y += (e.clientY - obj.clicks.y);

                obj.clicks.x = e.clientX;
                obj.clicks.y = e.clientY;
            }
            this.dom.firstElementChild.addEventListener("mousedown", () => {
                this.dom.style.userSelect = "none";
                window.addEventListener("mousemove", mouseMove);
            });
            this.dom.addEventListener("mouseup", () => {
                this.dom.style.userSelect = "";
                this.clicks = "";
                window.removeEventListener("mousemove", mouseMove);
            });
            if (this.dom.querySelector("input")) {
                this.dom.querySelector("input").focus();
            };
            if (callback) callback(this.dom);
        }
        static genPrompt(title, desc, opts = {
            p_title: "",
            p_placeholder: "",
            x: 0,
            y: 0
        }, callback) {
            const {
                p_title = p_title,
                    p_placeholder = p_placeholder,
                    x = x,
                    y = y
            } = opts;
            const window = new richDice(opts.x, opts.y);
            window.setTitle(title);
            window.setDescription(desc);
            window.setSize("300");
            window.css.alignment = "left";
            window.addPrompt(opts.p_title, opts.p_placeholder);
            window.render((dom) => {
                document.getElementsByClassName(window.ID + opts.p_title)[0].focus(); // focus user on the text field
                // called after the user submits on the prompt
                dom.addEventListener("keypress", (e) => {
                    if (e.key == "Enter") {
                        const data = window.dom.querySelector("input").value;
                        callback(data); // give the data back
                        if (window.dom)
                            window.dom.remove();
                    }
                });
            });
        }
    }
    return richDice;
})();


const Spell = (() => {
    function getGetOrdinal(n) {
        var s = ["th", "st", "nd", "rd"],
            v = n % 100;
        return (n != 0) ? n + (s[(v - 20) % 10] || s[v] || s[0]) : "Cantrip";
    }
    class Spell {
        constructor(props = {}) {
            const {
                name = "Unkown Spell",
                    level = "1st",
                    school = "Spell",
                    components = "V S",
                    ctime = "1 Action",
                    ritual = "no",
                    concentration = "no",
                    description = "No description exists for this spell.",
                    duration = "Instantaneous",
                    range = "10 feet",
                    roll = "0d4",
                    url = "https://dnd5e.fandom.com/wiki/" + name.replace(/ /g, "_"),
            } = props;
            this.name = name;
            if (!isNaN(level)) {
                this.level = getGetOrdinal(level);
            } else {
                this.level = level;
            }
            this.ctime = ctime;
            this.ritual = ritual;
            this.concentration = concentration;
            this.school = school;
            this.description = description;
            this.components = (typeof (components) != "string") ? components.join(" ") : components;
            if (!isNaN(duration)) {
                this.duration = (duration !== 0) ? duration + " minutes" : "Instantaneous";
            } else {
                this.duration = duration;
            }
            if (!isNaN(range)) {
                this.range = range + " feet";
            } else {
                this.range = range;
            }
            this.roll = roll;
            this.url = url;
        }
        get intLvl() {
            return (isNaN(Number(this.level[0]))) ? 0 : Number(this.level[0]);
        }
        cast(lvl) {
            let attck = this.roll;
            const roll = new Dice(attck);
            if (lvl > this.intLvl) {
                roll.addDice(lvl - this.intLvl); // add x dice per level
            }
            return roll.show();
        };
        get wiki() {
            window.open(this.url);
        };
        get x() {
            console.log("\n" + this.name.toUpperCase());
            console.log(this.level + "-level " + this.school);
            console.log("Casting Time: " + this.ctime);
            console.log("Range: " + this.range);
            console.log("Components: " + this.components);
            console.log("Duration: " + this.duration);
            console.log(`Roll: ${this.roll}`);
            console.log(`${this.description}`);
        }
    };
    return Spell;
})();

class Item {
    constructor(props = {}) {
        const {
            name = "Unkown Item",
                cost = 0,
                dmg = "",
                dmgType = "",
                range = 10,
                desc = "No description exists for this item",
                weight = 1,
                qnty = 1,
                properties = [],
                singleUse = false
        } = props;
        this.name = name;
        this.cost = cost;
        this.dmgType = dmgType;
        this.desc = desc;
        this.range = range;
        this.dmg = dmg;
        this.weight = weight;
        this.properties = properties;
        this.singleUse = singleUse;
        this.qnty = qnty;
    }
    get tWeight() {
        return this.weight * this.qnty;
    }
}
const MagicUI = (() => {
    const UI = {};
    UI.resetDOM = (callback) => {
        document.body.innerHTML = `<div id="out-wrap" tabindex="0"><div id="banner"><img src="src/img/logo.png" alt="Magic Dice" onclick="MagicUI.mainMenu()"><h2>A character manager built for Dungeons & Dragons 5e</h2></div><div id="main"></div></div><div id="toolbar-section" class="toolbar-fixed"></div><footer><h3>&#169;Magic Dice 2019</h3><span>A tool created by <a href="https://nikgo.me" target="_blank">Nikita Golev</a></span><span>Contact me by <a href="mailto:ngolev.bus@gmail.com">Email</a></span><span>Github <a href="https://github.com/AdmiralSoviet/MagicDice" target="_blank">Source Code</a></span></footer>`
        UI.populateToolbar();
        const device_width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        if (magicHandler.managed_players.length && device_width > 436) {
            document.querySelector("#out-wrap").style.minHeight = "calc(100vh - 38px)";
        }
        if (callback)
            callback();
    };
    UI.populateToolbar = () => {
        const toolbar = document.getElementById("toolbar-section");
        toolbar.innerHTML = "";
        for (let i = 0; i < magicHandler.managed_players.length; i++) {
            let initials = magicHandler.managed_players[i].name.match(/\b\w/g) || [];
            initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
            toolbar.insertAdjacentHTML("beforeend", `<div class="toolbar-hero"><span>${initials}</span><i class="fa fa-user-circle"></i><i class="fa fa-pencil" aria-hidden="true"></i><i class="fa fa-book"></i><i class="fa fa-sticky-note"></i><i class="fa fa-keyboard-o"></i><i class="fa fa-floppy-o"></i><i class="fa fa-cloud"></i><i class="fa fa-trash-o"></i></div>`);
            document.getElementsByClassName("toolbar-hero")[i].getElementsByClassName("fa-pencil")[0].addEventListener("click", (e) => {
                magicHandler.managed_players[i].render.editMode = (magicHandler.managed_players[i].render.editMode) ? false : true; // change edit mode
                if (magicHandler.managed_players[i].render.editMode == true) {
                    document.body.insertAdjacentHTML("beforeEnd", `<h2 id="alertPopUp">*EDIT MODE*</h2>`);
                    document.getElementsByClassName("toolbar-hero")[i].querySelector(".fa-pencil").classList.add("active"); // make it always gold
                } else {
                    document.querySelector("#alertPopUp").remove();
                    document.getElementsByClassName("toolbar-hero")[i].querySelector(".fa-pencil").classList.remove("active"); // remove that
                }
            });
            document.getElementsByClassName("toolbar-hero")[i].getElementsByClassName("fa-user-circle")[0].addEventListener("click", (e) => {
                magicHandler.managed_players[i].render.generate();
            });
            document.getElementsByClassName("toolbar-hero")[i].getElementsByClassName("fa-book")[0].addEventListener("click", (e) => {
                magicHandler.managed_players[i].render.spellbook.generate();
            });
            document.getElementsByClassName("toolbar-hero")[i].getElementsByClassName("fa-floppy-o")[0].addEventListener("click", (e) => {
                magicHandler.managed_players[i].saveToFile();
            });
            document.getElementsByClassName("toolbar-hero")[i].getElementsByClassName("fa-cloud")[0].addEventListener("click", (e) => {
                magicHandler.managed_players[i].save();
            });
            document.getElementsByClassName("toolbar-hero")[i].getElementsByClassName("fa-trash-o")[0].addEventListener("click", (e) => {
                magicHandler.managed_players.splice(i, 1);
                UI.mainMenu();
            });
            document.getElementsByClassName("toolbar-hero")[i].getElementsByClassName("fa-keyboard-o")[0].addEventListener("click", (e) => {
                magicHandler.managed_players[i].enableShortcuts();
            });
            document.getElementsByClassName("toolbar-hero")[i].getElementsByClassName("fa-sticky-note")[0].addEventListener("click", (e) => {
                magicHandler.managed_players[i].render.misc_notes.generate();
            });
        }
    };
    UI.mainMenu = () => {
        UI.resetDOM(() => {
            document.getElementById("main").innerHTML = `<div id="main-menu">
            <span class="menu-option" id="menu-rolldice">Roll Dice</span>
            <span class="menu-option" id="menu-load">Load</span>
            <span class="menu-option" id="menu-loadfile">External Load</span>
            <span class="menu-option" onclick="DM.battleBoard.create()">Battle Tracker</span>
            <span class="menu-option">Settings</span>
            <span class="menu-option" id="menu-help">Help</span></div>`;

            document.getElementById("menu-load").addEventListener("click", () => {
                const characters = JSON.parse(localStorage.getItem("charList"));
                if (!characters)
                    return alert("No characters exist in save!");
                document.getElementById("main").innerHTML = `<div id="load-menu"></div>`;
                const menu = document.getElementById("load-menu");
                for (property in characters) {
                    menu.innerHTML += `<div class="load-file" id="${property}" style="background: url(${characters[property].renderData.avatar}) center top; background-size: cover;">
                    <div class="tint select-hover">
                    <h3>${characters[property].name}</h3> <span class="lvl-caption">${characters[property].classData.name} lvl.${characters[property].lvl}</span>
                    </div>
                    </div>`
                };
                const loadFiles = Array.from(document.getElementsByClassName("load-file"));
                loadFiles.forEach((x) => {
                    x.addEventListener("click", (e) => {
                        let target = e.target;
                        while (target.classList[0] != "load-file")
                            target = target.parentNode;
                        const id = target.id;
                        Load.restore(id);
                    });
                });
            });

            document.getElementById("menu-help").addEventListener("click", (e) => {
                document.getElementById("main").innerHTML = "";
                const window = new richDice((document.body.clientWidth / 2) - 260, 120);
                window.setTitle("Welcome to Magic Dice!");
                window.setSize(520, 700);
                window.addField("Where is everything?", `So, you might have noticed there seems to be a lack of anything on the screen besides this box... and that's by design! Let me explain; This program was and still is designed around the JavaScript REPL present in most modern web browsers (I recommend Chrome or Chromium for Magic Dice). To perform more advanced functions, you may need to be familiar with said console.`)
                window.addField("How do I get started?", `To begin, first open your Dev Console; F12 on Google Chrome. Then the world is yours! (Hint: type ply to access the currently loaded players)`);
                window.addCustomHTML("Some Sample Commands", `<ul><li><strong>Load.restoreFromFile():</strong> You can restore a character from a save file (.json), there's some sample characters located in Magic Dice itself, in the examples directory.</li><li><strong>ply.enableShortcuts():</strong> Enables shortcuts for a character.</li><li><strong>Dice.r("d20"):</strong> This command rolls a d20! Substitute d20 for any dice combination like 6d8.</li><li><strong>Player Generation:</strong> A series of commands to create a default PC!<ol><li>let John = new Player({lvl: 3})</li><li>John.name = "John Smith"</li><li><i>Edit the object to your hearts content.</i> (Not a command)</li><li>John.enableShortcuts()</li><li><i>Click outside of the console and press shift X on your keyboard and watch.</i> (Not a command)</li></ol></li></ul>`);
                window.render();
            });
            document.getElementById("menu-loadfile").addEventListener("click", (e) => {
                Load.restoreFromFile();
                document.getElementById("out-wrap").addEventListener("char-loaded", (e) => {
                    e.detail.enableShortcuts();
                });
            });
            document.getElementById("menu-rolldice").addEventListener("click", (e) => {
                richDice.genPrompt("Roll Dice", "Enter the dice combination of the roll.", {
                    p_title: "Dice",
                    p_placeholder: "8d6",
                    x: e.clientX - 50,
                    y: e.clientY - 20
                }, (data) => {
                    Dice.gfx_dice(data, e.clientX - 50, e.clientY - 20);
                });
            });
        });
    };
    return UI;
})();


// start up banner
console.log("%cMagic Dice", "font-size: 30px; color: #c51b1b; text-shadow: 1px 1px black; font-family: Georgia, serif;");
console.log("%cA character manager built for Dungeons & Dragons 5e", "font-size: 14px; font-style: italic; font-weight: bold; font-family: 'Trebuchet MS', Helvetica, sans-serif;padding: 5px;");

// first time message for people new to the app.
window.addEventListener("load", () => {
    MagicUI.mainMenu();

    // make the toolbar fixed when the footer is not visible. Mobile only.
    window.addEventListener("scroll", (e) => {
        const el = document.querySelector("footer");
        const rect = el.getBoundingClientRect();
        const elemTop = rect.top;
        const elemBottom = rect.bottom;

        // Only completely visible elements return true:
        const isVisible = elemTop < window.innerHeight && elemBottom >= 0;
        if (!isVisible) {
            document.querySelector("#toolbar-section").classList.add("toolbar-fixed");
        } else {
            document.querySelector("#toolbar-section").classList.remove("toolbar-fixed");
        }
    });
});