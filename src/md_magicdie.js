const Dice = (() => {
    class SingleDice {
        constructor(string = "d20") {
            this.string = string.toLowerCase(); // the string value of the dice roll
            this.list = []; // list of dice rolls
            this.stats = SingleDice.cvt(string.toLowerCase()); // the iterator, face, etc.
            this.roll(); // roll numbers
        }
        static cvt(diceRoll) {
            diceRoll = diceRoll.toLowerCase();
            let diceObj = {};
            if (diceRoll.includes("->")) {
                diceObj.foreach_modifier = parseInt(diceRoll.split("->")[1]);
            }
            diceRoll = diceRoll.split("d");
            diceObj.iterator = diceRoll[0] != "" ? parseInt(diceRoll[0]) : 1;
            diceObj.face = parseInt(diceRoll[1]);
            if (isNaN(diceObj.iterator) || isNaN(diceObj.face)) {
                throw Error("Invalid dice roll!");
            }
            return diceObj;
        }
        serialise() {
            return `${this.stats.iterator}d${this.stats.face}${this.stats.foreach_modifier ? "->" + this.stats.foreach_modifier : ""
                }`;
        }
        roll() {
            let num;
            this.list = [];
            for (let i = 0; i < this.stats.iterator; i++) {
                num = Math.floor(Math.random() * this.stats.face) + 1;
                if (this.stats.foreach_modifier) num += this.stats.foreach_modifier; // add modifier to each roll
                this.list.push(num); // populate list with random numbers
            }
            return this.total; // return result
        }
        addDice(number) {
            this.stats.iterator += number; // add x dice
            this.string = this.serialise(this.stats); // convert and set
            this.roll(); // reset
            return this;
        }
        reRoll(value) {
            const index = this.list.indexOf(value);
            if (index != -1) {
                this.list[index] = Math.floor(Math.random() * this.stats.face) + 1;
                return this.list[index];
            }
            return false;
        }
        get total() {
            if (this.stats.iterator <= 0) return 0;
            else return this.list.reduce((a, b) => a + b);
        }
        get max() {
            return this.stats.face * this.stats.iterator; // 8d6 -> 6 * 8
        }
    }

    class diceRoll {
        constructor(dice = "d20", opts = {}) {
            const { x = document.body.clientWidth / 2 - 225, y = 150 } = opts;
            this.pos = {
                x,
                y,
            };
            this.dice = dice.toLowerCase();
            this.roll();
        }
        generateList() {
            const regexp = /\d*d\d+(?:->\-*\d+)*/g; // used to detect dice rolls
            const list = []; // list of dice rolls
            let val;
            do {
                val = regexp.exec(this.dice); // extract all dice
                if (val) list.push(new SingleDice(val[0])); // put them in the list
            } while (val);
            this.list = list; // set
        }
        get verboseList() {
            const newList = [];
            this.list.forEach((x) => {
                x.list.forEach((v) => {
                    newList.push(v);
                });
            });
            return newList; // return an array of every dice roll from every set of dice
        }
        get max() {
            let text = this.dice;
            this.list.forEach((x) => {
                text = text.replace(x.string, x.max); // replace all dice rolls with the rolled equivelent
            });
            return Number(eval(text));
        }
        get compText() {
            let text = this.dice;
            this.list.forEach((x) => {
                text = text.replace(x.string, x.total); // replace all dice rolls with the rolled equivelent
            });
            return text;
        }
        get total() {
            try {
                return Number(eval(this.compText));
            } catch (err) {
                MagicUI.alert(err, {
                    type: "error",
                });
            }
        }
        roll() {
            try {
                // roll each set of dice
                this.generateList();
                return this.total; // return total
            } catch (err) {
                return console.error(
                    `Something went wrong while rolling the dice! (${err})`
                );
            }
        }
        show() {
            this.list.forEach((x) => {
                console.log(`Dice Roll (${x.string})`);
                if (x.stats.foreach_modifier) {
                    console.log("Modifier (+" + x.stats.foreach_modifier + ")");
                }
                x.list.forEach((x, i) => {
                    console.log(`Roll ${i + 1}: ${x}`);
                });
            });
            console.log(`Total = ${this.compText}`);
            console.log("Total roll: " + this.total);
        }
        render() {
            const dice = new richDice(this.pos.x, this.pos.y);
            //const rollObj = this.diceObj;

            dice.setTitle(`Dice Roll`);
            dice.setDescription(
                `You raise your hand and throw the dice across the table.`
            );
            dice.setSize(250, 750);
            dice.css.alignment = "left";

            if (this.list.length > 1) dice.addField("Input: ", this.dice);
            this.list.forEach((x, i) => {
                /* List of rolls */
                let htmlList = "<div class='dice-table'>"; // start the custom html table

                x.list.forEach((v, i) => {
                    htmlList += `<div class="gfx_dice">${v}</div>${i + 1 == x.stats.iterator ? "" : "+"
                        }`;
                });

                htmlList += "</div>";
                dice.addCustomHTML(`${i ? i + ". " : ""}Roll (${x.string}):`, htmlList);
            });
            if (Number(this.compText) != this.total)
                dice.addField("Evaluation: ", `Total = ${this.compText}`);
            dice.addField(`Total: `, this.total); // display total
            const sound = new Audio("./src/misc/diceroll.mp3");
            dice.render(() => {
                sound.play(); // play sound effect
            });
            return dice;
        }
        static r(arg, mute = false) {
            return diceRoll.x(arg, mute).total; // return total of the dice roll only
        }
        static x(arg, mute = false) {
            try {
                const dice = new diceRoll(arg);
                if (!mute) dice.show();
                return dice;
            } catch (err) {
                console.error(err);
            }
        }
        static cvt(roll) {
            return SingleDice.cvt(roll);
        }
        static diceObj(string) {
            return new SingleDice(string);
        }
        static gfx_dice(arg, x, y) {
            try {
                const magicRoll = new diceRoll(arg, {
                    x: x,
                    y: y,
                }); // the dice roll
                return magicRoll.render();
            } catch (err) {
                return console.error(
                    `Something went wrong while rolling the dice! (${err})`
                );
            }
        }
    }
    return diceRoll;
})();

const die = {
    r: Dice.r,
    cvt: Dice.cvt,
    x: Dice.x,
    gfx_dice: Dice.gfx_dice,
}; // alternate name for static functions

// Player character handler to make things easier, rather than forcing the user to assign their characters to variables.
const magicHandler = (() => {
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
                return console.log(
                    "Currently no characters are loaded! You can load from a save file using the command 'Load.restoreFromFile()'"
                );
            } else if (this.managed_players.length == 1) {
                return this.managed_players[0];
            } else {
                return this.managed_players;
            }
        }
        randomPlayer(name = `NPC ${this.managed_players.length}`, lvl = 3) {
            let ran_class = Array.from(Library.player_classes);
            ran_class = ran_class[Math.floor(Math.random() * ran_class.length)][1]; // get a random class
            this.managed_players.push(
                new Player({
                    name: name,
                    lvl: lvl,
                    classData: ran_class,
                })
            );
            this.last.render.generate();
            MagicUI.populateToolbar();
        }
        loadPlayer(player) {
            try {
                this.managed_players = []; // clear players
                this.managed_players.push(player);
                this.last.render.generate();

                // emit event for other parts of Magic Dice to use.
                const loaded = new CustomEvent("char-loaded", {
                    detail: magicHandler.last
                });
                document.getElementById("out-wrap").dispatchEvent(loaded);
            } catch (err) {
                MagicUI.alert(err, {
                    type: "error",
                });
            }
        }
    }
    return new magicHandler();
})();
Object.defineProperty(self, "ply", {
    get: function () {
        return magicHandler.ply;
    },
});

const richDice = (() => {
    class richDice {
        constructor(x = 0, y = 0) {
            (this.x = x),
                (this.y = y),
                (this.css = {
                    size: "",
                    alignment: "center",
                    footer_padding: 20,
                    background: "",
                }),
                (this.title = "Untitled Window"),
                (this.fields = new Map()),
                (this.buttons = new Map()),
                (this.image = ""),
                (this.ID = Math.floor(Math.random() * 100000));
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
                this.css.size += `max-height: ${height}px;`;
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
                content: text,
            });
        }
        addPrompt(title, placeholder) {
            this.fields.set(title, {
                type: 1,
                content: placeholder,
            });
        }
        addButton(id, value) {
            try {
                this.buttons.set(id, value);
            } catch (err) {
                console.error(err);
            }
        }
        addCustomHTML(title, text) {
            this.fields.set(title, {
                type: 2,
                content: text,
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
                content += `<p class="richCaption">${this.desc}</p>`;
            }
            content += this.image;
            this.fields.forEach((v, k) => {
                if (v.type == 0) {
                    content += `
                    <h4>${k}</h4>
                    <span>${v.content}</span>`;
                } else if (v.type == 1) {
                    content += `
                    <label for="${this.ID + k}">${k}</label>
                    <input type="text" placeholder="${v.content}" class="${this.ID + k
                        }">`;
                } else if (v.type == 2) {
                    content += `
                        <h4>${k}</h4>
                        ${v.content}`;
                }
            });
            content += `<div class='buttons'>
                ${(() => {
                    let text = "";
                    this.buttons.forEach((v, k) => {
                        text += `<button class=${k}>${v}</button>`;
                    });
                    return text;
                })()}
            </div>`;
            /* The richDice Container */
            const container = `<div class="richDice ${this.ID}" id="richDice${this.ID}"style="left: ${this.x}; top: ${this.y}; ${this.css.background}">
            <div class="richBar"><span class="richClose"></span></div>
            <div class="richContent" style="text-align: ${this.css.alignment}; padding-bottom: ${this.css.footer_padding}px; ${this.css.size}">
                ${content}
            </div>
            </div>`;
            document
                .getElementById("main")
                .insertAdjacentHTML("beforeend", container);
            this.dom.firstElementChild
                .getElementsByClassName("richClose")[0]
                .addEventListener("click", () => {
                    this.dom.remove();
                });

            const device_width =
                window.innerWidth > 0 ? window.innerWidth : screen.width;
            if (device_width <= 436) {
                document.querySelector(`#richDice${this.ID}`).scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                }); // scroll it into view
            }
            /* you know javascript is the best language when this ugly mess is the only way of getting this to work. kill me.*/
            var obj = this;

            function mouseMove(e) {
                if (!obj.clicks) {
                    obj.clicks = {
                        x: e.clientX,
                        y: e.clientY,
                    };
                }
                // if box is removed but mousemove event is still ongoing
                if (!obj.dom) {
                    this.clicks = "";
                    window.removeEventListener("mousemove", mouseMove);
                    return false;
                }
                obj.dom.style.left = obj.x += e.clientX - obj.clicks.x;
                obj.dom.style.top = obj.y += e.clientY - obj.clicks.y;

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
            }
            if (callback) callback(this.dom);
        }
        static genPrompt(
            title,
            desc,
            opts = {
                p_title: "",
                p_placeholder: "",
                x: 0,
                y: 0,
            },
            callback
        ) {
            const {
                p_title = p_title,
                p_placeholder = p_placeholder,
                x = x,
                y = y,
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
                        if (window.dom) window.dom.remove();
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
        return n != 0 ? n + (s[(v - 20) % 10] || s[v] || s[0]) : "Cantrip";
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
            this.components =
                typeof components != "string" ? components.join(" ") : components;
            if (!isNaN(duration)) {
                this.duration =
                    duration !== 0 ? duration + " minutes" : "Instantaneous";
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
            return isNaN(Number(this.level[0])) ? 0 : Number(this.level[0]);
        }
        cast(lvl) {
            let attck = this.roll;
            const roll = new Dice(attck);
            if (lvl > this.intLvl) {
                roll.addDice(lvl - this.intLvl); // add x dice per level
            }
            return roll.show();
        }
        get wiki() {
            window.open(this.url);
        }
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
    }
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
            singleUse = false,
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
    // Magic Dice Notifications
    function alert(msg, opts = {}) {
        let {
            type = "none",
            background = "rgba(43, 154, 47, 0.85)",
            color = "white",
            icon = "fa-check",
        } = opts;
        if (type == "info") {
            background = "rgba(40, 56, 146, 0.85)";
            icon = "fa-info-circle";
        } else if (type == "alert") {
            icon = "fa-exclamation-triangle";
            background = "rgba(181, 136, 0, 0.85)";
        } else if (type == "error") {
            background = "rgba(142, 29, 20, 0.85)";
            icon = "fa-times";
        }
        const element = document.createElement("span");
        element.classList.add("magic-notification");
        element.style.background = background;
        element.style.color = color;
        element.innerHTML = `<i class="fa ${icon}" aria-hidden="true"></i> ${msg}`;
        document
            .querySelector("#notif-section")
            .insertAdjacentElement("beforeend", element); // insert into page
        window.setTimeout(() => {
            element.classList.add("fade");
            element.addEventListener("animationend", () => {
                element.remove();
            });
        }, 5000);
    }

    function imgError(img){
        img.onerror = "";
        img.style.display = "none";
        return true;
    }

    const UI = {};

    UI.alert = alert;
    UI.imgError = imgError;

    // default keybinds
    UI.shortcuts = {
        self: "x",
        gfx_self: "X",
        edit_mode: "E",
        skills: "c",
        inv: "i",
        magic: "m",
        gfx_magic: "M",
        notes: "J",
        roll: "R",
        shortcuts: "K",
        save: "S",
    };

    UI.resetDOM = (callback) => {
        document.body.innerHTML = `<div id="out-wrap" tabindex="0"><div id="banner" style="visibility: hidden"><img src="src/img/Magic-Dice-Logo-Banner-Transparent.png" alt="Magic Dice" onclick="MagicUI.mainMenu()"></div><div id="main"></div></div><div id="notif-section"></div><div id="toolbar-section" class="toolbar-fixed"></div><footer><span>&#169;Magic Dice 2020</span><span>Created by <a href="https://nikgo.me" target="_blank">Nikita Golev</a></span><span><a href="mailto:ngolev.bus@gmail.com">Contact Me</a></span><span><a href="https://github.com/AdmiralSoviet/MagicDice/" target="_blank">Github Repository</a></span><span id="menu-credits"><a>Credits</a></span></footer>`;
        //UI.populateToolbar();

        document
            .getElementById("out-wrap")
            .addEventListener("char-loaded", (e) => UI.populateToolbar());

        // shortcuts
        document.getElementById("out-wrap").addEventListener("keypress", (e) => {
            // don't mistake keypress while typing for a keyboard shortcut
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
                return false;
            }
            if (e.key == UI.shortcuts.self) {
                magicHandler.last.self;
            } else if (e.key == UI.shortcuts.gfx_self) {
                magicHandler.last.render.generate();
            } else if (e.key == UI.shortcuts.edit_mode) {
                magicHandler.last.render.toggleEditMode();
            } else if (e.key == UI.shortcuts.skills) {
                magicHandler.last.stats.list_sthrows();
                magicHandler.last.stats.list_skills();
            } else if (e.key == UI.shortcuts.inv) {
                magicHandler.last.inv.list();
            } else if (e.key == UI.shortcuts.magic) {
                magicHandler.last.magic.list();
            } else if (e.key == UI.shortcuts.gfx_magic) {
                magicHandler.last.render.spellbook.generate();
            } else if (e.key == UI.shortcuts.roll) {
                e.preventDefault();
                richDice.genPrompt(
                    "Roll Dice",
                    "Enter any RPG style dice combination.",
                    {
                        p_title: "Dice",
                        p_placeholder: "8d6",
                        x: document.body.clientWidth / 2 - 140,
                        y: 150,
                    },
                    (data) => {
                        Dice.gfx_dice(data, document.body.clientWidth / 2 - 140, 150);
                    }
                );
            } else if (e.key == UI.shortcuts.notes) {
                magicHandler.last.render.misc_notes.generate();
            } else if (e.key == UI.shortcuts.shortcuts) {
                magicHandler.last.enableShortcuts();
            } else if (e.key == UI.shortcuts.save) {
                magicHandler.last.save();
            }
        });

        x.observe(document.getElementById("main"), {
            childList: true,
        });
        if (callback) callback();
    };

    UI.toolbars = new Map();
    UI.populateToolbar = () => {
        const device_width =
            window.innerWidth > 0 ? window.innerWidth : screen.width;

        // Transform the Banner into a navigation bar.
        if (magicHandler.managed_players.length && device_width > 436) {
            const banner = document.querySelector("#banner");
            banner.style =
                "display: flex;flex-flow: row;justify-content: space-around;align-items: center;flex-direction: row;";
            if (!banner.querySelector(".navbar-wrap")) {
                //banner.insertAdjacentHTML("beforeend", `<div class="edit-wrap"><span>Edit Mode</span> <label class="switch"><input type="checkbox"><span class="slider round"></span></label></div>`)
                banner.insertAdjacentHTML(
                    "beforeend",
                    `<div class="navbar-wrap"><i class="fa fa-user-circle"></i><i class="fa fa-hat-wizard"></i><i class="fa fa-scroll"></i><i class="fa fa-dice"></i></div>`
                );
                const nav = document.querySelector(".navbar-wrap");
                nav.querySelector(".fa-dice").addEventListener("click", (e) => {
                    richDice.genPrompt(
                        "Roll Dice",
                        "Enter the dice combination of the roll.",
                        {
                            p_title: "Dice",
                            p_placeholder: "8d6",
                            x: e.pageX - 100,
                            y: e.pageY + 30,
                        },
                        (data) => {
                            Dice.gfx_dice(data, e.pageX - 100, e.pageY + 31);
                        }
                    );
                });
                nav.querySelector(".fa-user-circle").addEventListener("click", (e) => {
                    magicHandler.last.render.generate();
                });
                nav.querySelector(".fa-hat-wizard").addEventListener("click", (e) => {
                    magicHandler.last.render.spellbook.generate();
                });
                nav.querySelector(".fa-scroll").addEventListener("click", (e) => {
                    magicHandler.last.render.misc_notes.generate();
                });
            }
            // we want magic dice to only use one character at a time on desktop
            magicHandler.managed_players = [magicHandler.last];
            UI.alert(
                `You can view shortcuts with SHIFT + ${UI.shortcuts.shortcuts}`,
                { type: "info" }
            );
        } else if (magicHandler.managed_players.length) {
            const toolbar = document.getElementById("toolbar-section");
            toolbar.innerHTML = "";
            for (let i = 0; i < magicHandler.managed_players.length; i++) {
                let initials =
                    magicHandler.managed_players[i].name.match(/\b\w/g) || [];
                initials = (
                    (initials.shift() || "") + (initials.pop() || "")
                ).toUpperCase();
                toolbar.insertAdjacentHTML(
                    "beforeend",
                    `<div class="toolbar-hero"><span>${initials}</span><i class="fa fa-user-circle"></i><i class="fa fa-hat-wizard"></i><i class="fa fa-sticky-note"></i><i class="fa fa-dice"></i></div>`
                );
                document
                    .getElementsByClassName("toolbar-hero")
                [i].getElementsByClassName("fa-user-circle")[0]
                    .addEventListener("click", (e) => {
                        magicHandler.managed_players[i].render.generate();
                    });
                document
                    .getElementsByClassName("toolbar-hero")
                [i].getElementsByClassName("fa-hat-wizard")[0]
                    .addEventListener("click", (e) => {
                        magicHandler.managed_players[i].render.spellbook.generate();
                    });
                document
                    .getElementsByClassName("toolbar-hero")
                [i].getElementsByClassName("fa-sticky-note")[0]
                    .addEventListener("click", (e) => {
                        magicHandler.managed_players[i].render.misc_notes_mobile.generate();
                    });
                    document
                    .getElementsByClassName("toolbar-hero")
                [i].getElementsByClassName("fa-dice")[0].addEventListener("click", (e) => {
                    richDice.genPrompt(
                        "Roll Dice",
                        "Enter the dice combination of the roll.",
                        {
                            p_title: "Dice",
                            p_placeholder: "8d6",
                            x: 0,
                            y: 0,
                        },
                        (data) => {
                            Dice.gfx_dice(data, 0, 0);
                        }
                    );
                });
                UI.toolbars.set(
                    magicHandler.managed_players[i].render.ID,
                    document.getElementsByClassName("toolbar-hero")[i]
                ); // link every toolbar to a player
            }
        }
    };
    UI.detectMob = (tablet = false) => {
        // stub
        if (tablet) return window.innerWidth <= 797;
        else return window.innerWidth <= 414;
    };
    // config for UI
    UI.settings = {
        videoBackground: true,
    };
    const x = new MutationObserver(function (e) {
        // when main menu is removed, do this
        if (e[0].removedNodes) {
            if (!document.querySelector("#main-wrap")) {
                // we decide whether to disable video outside of main menu or not
                if (!UI.settings.videoBackground) {
                    if (
                        !document.querySelector("#load-menu") &&
                        !document.querySelector("#create-menu") &&
                        !document.querySelector(".upload-btn-wrapper")
                    ) {
                        if (document.querySelector(".fullscreen-bg")) {
                            document.body.style.removeProperty("background");
                            document.querySelector(".fullscreen-bg").remove(); // delete video
                        }
                    }
                }
                document.querySelector("#banner").style.visibility = "visible";
            } else {
                document.querySelector("#banner").style.visibility = "hidden";
            }
            if (
                !document.querySelector("#create-menu") &&
                !document.querySelector("#playerBox")
            ) {
                document.getElementById("out-wrap").style.removeProperty("background");
            }
        }
    });

    UI.createCharacter = () => {
        let playerList = "";
        Library.player_classes.forEach((v, k) => {
            playerList += `<option value="${k}">${v.name}</option>`;
        });
        document.getElementById("out-wrap").style.background =
            "rgba(0, 0, 0, 0.35)";
        document.getElementById("main").innerHTML = `
            <div id="create-menu"><div id="create-wrap"><h2>Create a Character</h2>
            <p>This page will take you through the basics needed to generate a character, edit any stats missed by this page using the Edit Mode and make sure to save your character. Magic Dice assumes you have access to the PHB and any supplemental materials needed to make your character. If you need help with making a character, I recommend <a href="https://www.nerdolopedia.com/articles/2018/4/12/a-step-by-step-guide-to-dd-5e-character-creation" target="_blank">this guide</a>.</p>
            <form><label for="mName">Character Name</label><br>
            <input type="text" id="mName"><br>
            <label for="mLevel">Level</label><br>
            <input type="text" id="mLevel"><br>
            <label for="mRace">Race</label><br>
            <input type="text" id="mRace"><br>
            <label for="mBackground">Background</label><br>
            <input type="text" id="mBackground"><br>
            <label for="mClass">Class</label><br>
            <input type="text" id="mClass" list="player_classes">
            <datalist id="player_classes">${playerList}</datalist><br>
            <label for="mImage">Image</label><br>
            <input type="text" id="mImage" placeholder="url"><br><button id="mSubmit">Create</button></form></div></div>
        `;
        const pattern = new RegExp(
            "^(https?:\\/\\/)?" + // protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
            "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
            "(\\#[-a-z\\d_]*)?$",
            "i"
        );
        // add image in if they specify image
        document.getElementById("mImage").addEventListener("focusout", (e) => {
            // make sure its a valid url
            if (pattern.test(document.getElementById("mImage").value)) {
                if (document.getElementById("mImageReal"))
                    document.getElementById("mImageReal").remove(); // delete old
                document
                    .getElementById("create-wrap")
                    .insertAdjacentHTML(
                        "beforeend",
                        `<img id="mImageReal" src="${document.getElementById("mImage").value
                        }" alt="${document.getElementById("mName").innerText}">`
                    );
            }
        });
        //actual creating the character
        document.getElementById("mSubmit").addEventListener("click", (e) => {
            try {
                e.preventDefault(); // stop page being reset

                // format data into something the playerClass understands
                // we don't need to do any form validation because the playerClass takes care of that for us
                const data = {
                    name: document.getElementById("mName").value,
                    classData: Library.player_classes.get(
                        document.getElementById("mClass").value
                    ),
                    lvl: document.getElementById("mLevel").value,
                    renderData: {
                        avatar: document.getElementById("mImage").value,
                    },
                };
                // format notes
                const notes = `====================
    ${data.name}
====================
Background: ${document.getElementById("mBackground").value}
Race: ${document.getElementById("mRace").value}

~Class/Race Features Go Here~
`;
                data.statsData = {
                    misc_notes: notes,
                }; // add notes
                magicHandler.loadPlayer(new Player(data)); // load player into the handler
            } catch (err) {
                MagicUI.alert(err, {
                    type: "error",
                }); // print error
            }
        });
    };

    /* 
    The Main Menu and its options go here
    */
    UI.mainMenu = () => {
        if (!document.querySelector("#magic-BG")) {
            document.body.style.removeProperty("background");
            document.querySelector("#banner").style.visibility = "hidden";
        }
        document.getElementById(
            "main"
        ).innerHTML = `<div id="main-wrap"><img src="./src/img/MagicLogo.png" id="MagicDiceLogo" alt="Magic Dice Logo"><div id="main-menu">
            <span class="menu-option" id="menu-rolldice">Roll Dice</span>
            <span class="menu-option" onclick="MagicUI.createCharacter()">Create Character</span>
            <span class="menu-option" id="menu-load">Load Character</span>
            <span class="menu-option" id="menu-loadfile">Upload File</span></div></div>`;

        if (!UI.detectMob(true)) {
            if (!document.querySelector("#magic-BG")) {
                document
                    .querySelector("#out-wrap")
                    .insertAdjacentHTML(
                        "beforeend",
                        `<div class="fullscreen-bg" style="visibility: visible;"><video autoplay muted loop id="magic-BG"><source src="./src/img/bg/bg.mp4" type="video/mp4"></video></div>`
                    );
                document
                    .querySelector("#magic-BG")
                    .addEventListener("canplaythrough", () => {
                        console.log("[Video] Start playing...");
                    });
                document.querySelector("#magic-BG").addEventListener("play", () => {
                    document.body.style.background = "none";
                });
            }
        }
        document.getElementById("menu-load").addEventListener("click", () => {
            const characters = JSON.parse(localStorage.getItem("charList"));
            if (!characters) return alert("No characters exist in save!");
            document.getElementById("main").innerHTML = `<div id="load-menu"></div>`;
            const menu = document.getElementById("load-menu");
            for (property in characters) {
                menu.innerHTML += `<div class="load-file" id="${property}" style="background: url(${characters[property].renderData.avatar}) center top; background-size: cover;">
                    <div class="tint select-hover">
                    <h3>${characters[property].name}</h3> <span class="lvl-caption">${characters[property].classData.name} lvl.${characters[property].lvl}</span>
                    </div>
                    <i class="fa fa-times" style="position: absolute;top: 5;right: 7px; visibility: hidden;"></i>
                    </div>`;
            }
            const loadFiles = Array.from(
                document.getElementsByClassName("load-file")
            );
            loadFiles.forEach((x) => {
                x.addEventListener("mouseover", (e) => {
                    x.querySelector(".fa-times").style.visibility = "visible";
                });
                x.addEventListener("mouseleave", (e) => {
                    x.querySelector(".fa-times").style.visibility = "hidden";
                });
                x.addEventListener("click", (e) => {
                    let target = e.target;
                    if (target == x.querySelector(".fa-times")) {
                        Load.deleteCharacter(target.parentNode.id);
                        UI.mainMenu(); // refresh
                    } else {
                        while (target.classList[0] != "load-file")
                            target = target.parentNode;
                        const id = target.id;
                        Load.restore(id);
                    }
                });
            });
        });
        document.querySelector("#menu-credits").addEventListener("click", () => {
            //document.getElementById("main").innerHTML = "";
            const window = new richDice(document.body.clientWidth / 2 - 300, 120);
            window.setSize(600, 700);
            window.setImage("./src/img/banner.png");
            window.setTitle("Credits");
            window.setDescription(
                "All the wonderful people that made this application possible."
            );

            window.addField("Created By:", "Nikita Golev");
            window.addField(
                "Art:",
                `<span>Alex Marshall - Logo Design</span>
            <span>Liam H. Ditty - Background Animation</span>
            <span>Adreas Rocha - <a href='https://www.deviantart.com/andreasrocha/art/Safe-Haven-727116218' target='_blank'>Background Art</a></span>
            <span>TJ Foo - <a href='https://www.artstation.com/artwork/nEVwO' target='_blank'>Grand Library</a></span>
            <span>Brett Johnson - <a href='https://www.unrealengine.com/marketplace/en-US/product/medieval-tavern' target='_blank'>Medieval Tavern</a></span>
            <span>Monica Antonie Meineche - <a href='https://monsiearts.artstation.com/projects/w8EoJ6' target='_blank'>Don't look down</a></span>
            <span>sinakasra - <a href='https://www.deviantart.com/sinakasra/art/Monster-Out-of-the-Woods-648678868' target='_blank'>Monster Out of the Woods</a></span>`
            );
            window.addField(
                "Information & Data:",
                `<span>Wizards of The Coast - Spells</span>
            <span>Wizards of The Coast - Monsters</span>`
            );

            window.render();
        });
        document.getElementById("menu-loadfile").addEventListener("click", (e) => {
            Load.restoreFromFile();
            document
                .getElementById("out-wrap")
                .addEventListener("char-loaded", (e) => {
                    e.detail.render.generate();
                });
        });
        document.getElementById("menu-rolldice").addEventListener("click", (e) => {
            richDice.genPrompt(
                "Roll Dice",
                "Enter the dice combination of the roll.",
                {
                    p_title: "Dice",
                    p_placeholder: "8d6",
                    x: e.clientX - 50,
                    y: e.clientY - 20,
                },
                (data) => {
                    Dice.gfx_dice(data, e.clientX - 50, e.clientY - 20);
                }
            );
        });
    };
    return UI;
})();

// start up banner
console.log(
    "%cMagic Dice",
    "font-size: 30px; color: #c51b1b; text-shadow: 1px 1px black; font-family: Georgia, serif;"
);
console.log(
    "%cA character manager built for Dungeons & Dragons 5e",
    "font-size: 14px; font-style: italic; font-weight: bold; font-family: 'Trebuchet MS', Helvetica, sans-serif;padding: 5px;"
);

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// first time message for people new to the app.
window.addEventListener("load", () => {
    MagicUI.resetDOM(() => {
        MagicUI.mainMenu();
    });

    let claim = getParameterByName("claim");
    if (claim) {
        fetch(`http://nikgo.me/weave/claim/?id=${claim}`)
            .then(
                (response) => {
                    if (!response.ok)
                        throw MagicUI.alert(`Link is either dead or expired!`, {
                            type: "error",
                        });
                    return response.json();
                },
                (err) =>
                    MagicUI.alert(`Error: ${err}`, {
                        type: "error",
                    })
            )
            .then((data) => {
                try {
                    if (!data) {
                        throw new Error("Data is empty!");
                    }
                    const obj = data;
                    Load.restoreFromObj(obj);
                    if (window.document.domain != "")
                        window.history.pushState("index", "Title", "/"); // get rid of the getter paramater for proper refreshing/sharing
                } catch (err) {
                    MagicUI.alert(`Error: ${err}`, {
                        type: "error",
                    });
                }
            });
    }

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
            if (
                window.getComputedStyle(document.querySelector("#toolbar-section"))
                    .position == "fixed"
            ) {
                document.querySelector("footer").style.marginTop =
                    38 * magicHandler.managed_players.length + 1;
            }
        } else {
            document
                .querySelector("#toolbar-section")
                .classList.remove("toolbar-fixed");
            document.querySelector("footer").style.marginTop = 0;
        }
    });
});
