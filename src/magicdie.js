const die = (() => {
    const dief = {
        cvt: function (diceRoll) {
            let diceObj = {};
            if (diceRoll.includes("+")) {
                diceObj.foreach_modifier = parseInt(diceRoll.split("+")[1]);
            }
            diceRoll = diceRoll.split("d");
            diceObj.iterator = (diceRoll[0] != "") ? parseInt(diceRoll[0]) : 1;
            diceObj.face = parseInt(diceRoll[1]);
            return diceObj;
        },
        r: function (arg, mute) {
            const rCvrt = this.cvt(arg);
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
                if (rCvrt.foreach_modifier) {
                    roll += rCvrt.foreach_modifier;
                }
                if (!mute) {
                    console.log("Roll " + i + ": " + roll);
                }
                total += roll;
            }
            if (!mute) {
                console.log("Total roll: " + total);
            }
            return total;
        },
        s: function (diceObj) {
            let roll = `${diceObj.iterator}d${diceObj.face}`;
            if (diceObj.foreach_modifier) {
                roll += `+${diceObj.foreach_modifier}`
            }
            return roll;
        },
        gfx_dice: function (arg, x, y) {
            const rollObj = this.cvt(arg);
            const dice = new richDice(x, y);
            dice.setTitle(`Dice Roll (${arg})`);
            dice.setDescription(`You raise your hand and throw the dice across the table.`);
            dice.setSize(250, 750);
            dice.setLeftAlign(true);
            let roll;
            let total = 0;
            if (rollObj.iterator > 1) {
                for (let i = 1; i <= rollObj.iterator; i++) {
                    roll = Math.floor(Math.random() * rollObj.face) + 1;
                    if (rollObj.foreach_modifier) {
                        roll += rollObj.foreach_modifier;
                    }
                    dice.addField(`Roll ${i}: `, roll);
                    total += roll;
                }
            } else {
                total = Math.floor(Math.random() * rollObj.face) + 1;
            }
            if (rollObj.iterator == 0) {
                total = 0;
            }
            dice.addField(`Total: `, total);
            dice.render();
            return dice;
        }
    }
    return dief
})();

const richDice = (() => {
    class richDice {
        constructor(x = 0, y = 0) {
            this.x = x,
                this.y = y,
                this.css = "",
                this.alignment = "center",
                this.title = "Untitled Window",
                this.fields = new Map(),
                this.image = "",
                this.background = "",
                this.ID = Math.floor(Math.random() * 100000);
        }
        setTitle(title) {
            this.title = title;
        }
        setSize(width, height) {
            if (width) {
                this.css += `max-width: ${width}px;`;
                this.width = width;
            }
            if (height) {
                this.height = height;
                this.css += `max-height: ${height}px;`
            }
        }
        setBackground(url) {
            this.background = `background: url('${url}') center center;`;
        }
        setDescription(desc) {
            this.desc = desc;
        }
        setImage(url) {
            this.image = `<img src="${url}" alt="Image">`;
        }
        setLeftAlign(boolean) {
            if (boolean === true) {
                this.alignment = "left"
            } else {
                this.alignment = "center"
            }
        }
        addField(title, content) {
            this.fields.set(title, content);
        }
        get dom() {
            return document.getElementsByClassName(this.ID)[0];
        }
        render() {
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
                content += `
                <h4>${k}</h4>
                <span>${v}</span>`;
            });

            /* The richDice Container */
            const container = `<div class="richDice ${this.ID}" style="left: ${this.x}px; top: ${this.y}px; ${this.background}">
            <div class="richBar"><span class="richClose"></span></div>
            <div class="richContent" style="text-align: ${this.alignment}; ${this.css}">
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
        }
    }
    return richDice;
})();


const Load = (() => {
    const Loadf = {
        deSer: function (objData) {
            var restored = objData;
            // looks a bit ugly copying the code but it's gotta be since JSON don't save methods
            for (var property in restored.magicData.spells) {
                if (restored.magicData.spells.hasOwnProperty(property)) {
                    var spell = restored.magicData.spells[property]
                    restored.magicData.spells[property] = new Spell(spell);
                }
            }
            for (var property in restored.invData.backpack) {
                if (restored.invData.backpack.hasOwnProperty(property)) {
                    var item = restored.invData.backpack[property]
                    restored.invData.backpack[property] = new Item(item);
                }
            }
            return new Player(restored);
        },
        // restore from local storage
        restore: function (character) {
            if (!character || !localStorage.getItem(character)) {
                console.log("Invalid identifier specified!");
                return;
            }
            return this.deSer(JSON.parse(localStorage.getItem(character)));
        },
        ls: function () {
            console.log("---LIST OF CHARACTERS---");
            if (localStorage.getItem("charList")) {
                var charArray = JSON.parse(localStorage.getItem("charList"));
                for (var i = 0; i < charArray.length; i++) {
                    console.log("[" + (i + 1) + "] " + charArray[i]);
                }
            } else {
                console.log("No characters saved!");
            }
        },
        restoreFromPrompt: function () {
            return this.deSer(JSON.parse(prompt("Please copy paste the contents of your character's JSON file.")));
        }
    }
    return Loadf
})();

const Spell = (() => {
    class Spell {
        constructor(props = {}) {
            const {
                name = "Unkown Spell",
                    level = 1,
                    school = "Spell",
                    components = "V S",
                    ctime = "1 Action",
                    duration = 0,
                    range = 10,
                    roll = "0d4",
                    url = ""
            } = props;
            this.name = name;
            this.level = level;
            this.ctime = ctime;
            this.school = school;
            this.components = (typeof (components) != "string") ? components.join(" ") : components;
            this.duration = duration;
            this.range = range;
            this.roll = roll;
            this.url = url;
        }
        cast(lvl) {
            let attck = this.roll;
            if (lvl > this.level) {
                attck = die.cvt(attck);
                attck.iterator += (lvl - this.level); // add x dice per level
                attck = attck.iterator + "d" + attck.face + ((attck.modifier) ? "+" + attck.modifier : ""); // convert back to xdx+m format
            }
            console.log("Rolling (" + attck + ")");
            return die.r(attck);
        };
        get wiki() {
            window.open(this.url);
        };
        get x() {
            var getGetOrdinal = function (n) {
                var s = ["th", "st", "nd", "rd"],
                    v = n % 100;
                return (n != 0) ? n + (s[(v - 20) % 10] || s[v] || s[0]) : "Cantrip";
            }
            console.log("\n" + this.name.toUpperCase());
            console.log(getGetOrdinal(this.level) + "-level " + this.school);
            console.log("Casting Time: " + this.ctime);
            console.log("Range: " + this.range + " feet");
            console.log("Components: " + this.components);
            console.log("Duration: " + ((this.duration !== 0) ? this.duration + " minutes" : "Instantaneous"));
            console.log(`Roll: ${this.roll}`);
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

const Player = (() => {
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

    function genABS(points) {
        var dpoints = points;
        var ability = {
            str: 8,
            dex: 8,
            cnst: 8,
            int: 8,
            wis: 8,
            chr: 8
        }
        var amt;
        // go through each property and add 0-9 points
        for (var property in ability) {
            if (ability.hasOwnProperty(property)) {
                if (points <= 9) {
                    amt = points;
                } else {
                    amt = Math.floor(Math.random() * 10);
                }
                ability[property] += amt;
                points -= amt;
            }
        }
        // makes sure all points are spent, pretty inefficent solution right now
        if (!points <= 0) {
            ability = genABS(dpoints);
        }
        return ability
    }

    // get ability score modifier from ability score
    function serAbility(value) {
        var modifier = -5;
        for (var i = 1; i <= 31; i += 2) {
            if (i >= value) {
                return modifier
            } else {
                modifier++;
            }
        }
    };
    // get proficiency from level
    function serProf(lvl) {
        var modifier = 2;
        for (var i = 4; i <= 21; i += 4) {
            if (i >= lvl) {
                return modifier
            } else {
                modifier++;
            }
        }
    }

    function MapToObj(strMap) {
        let obj = {};
        for (let [k, v] of strMap) {
            obj[k] = v;
        }
        return obj;
    }

    function objToMap(obj) {
        let map = new Map();
        for (let k of Object.keys(obj)) {
            map.set(k, obj[k]);
        }
        return map;
    }

    class playerClass {
        constructor(props = {}) {
            const {
                name = "Fighter",
                    url = "https://roll20.net/compendium/dnd5e/" + name,
                    misc = {},
                    hitdie = "d10",
                    spcMod = undefined,
                    start_prof = {
                        wpn: [],
                        tool: [],
                        armr: []
                    },
                    save_throws = ["str", "cnst"]
            } = props;
            this.name = name;
            this.misc = misc;
            this.url = url;
            this.start_prof = start_prof;
            this.spcMod = spcMod;
            this.save_throws = save_throws;
            this.hitdie = hitdie;
        }
        get wiki() {
            window.open(this.url);
        }
    }
    class Magic {
        constructor(props = {}) {
            const {
                parent = undefined,
                    spells = {},
                    preparedSpells = []
            } = props;
            this.spells = objToMap(spells);
            this.parent = parent;
            this.preparedSpells = preparedSpells;
        }
        get spcMod() {
            return this.parent.player_class.spcMod;
        }
        get DC() {
            return 8 + this.parent.stats.prof + this.parent.stats.ability_mod[this.spcMod];
        }
        get SPAttack() {
            return this.parent.stats.ability_mod[this.spcMod] + this.parent.stats.prof
        };
        get Mod() {
            return this.parent.stats.ability_mod[this.spcMod];
        }
        add() {
            const objSpell = new Spell(JSON.parse(prompt("Please enter the object string.")));
            this.spells.set(objSpell.name, objSpell);
            this.sort();
            objSpell.x;
            return console.log("%cNew Spell Added!", "color: limegreen");
        }
        sort() {
            const spellArray = Array.from(this.spells);
            spellArray.sort((a, b) => {
                return a[1].level - b[1].level;
            });
            this.spells = new Map(spellArray);
        }
        qCast(spell) {
            if (!spell || !this.spells.get(spell)) {
                console.log("You didn't specify a valid spell");
                return;
            } else {
                return this.spells.get(spell).cast();
            }
        }
        prepare(spell) {
            if (!spell) {
                console.log("You didn't specify a valid spell");
                return;
            } else if (this.preparedSpells.indexOf(spell.name) > -1) {
                console.log("You already prepared this spell!");
                return;
            }
            const maxPrepared = this.Mod + this.parent.lvl;
            if (maxPrepared > this.preparedSpells.length) {
                this.preparedSpells.push(spell.name);
                console.log("'" + spell.name + "' has been prepared successfuly! (" + this.preparedSpells.length + "/" + maxPrepared + ")");
            } else {
                console.log("You can't prepare any more spells!");
            }
        }
        list(args = {}) {
            const {
                name = undefined,
                    lvl = undefined
            } = args;
            if (args.name) {
                args.name = args.name.toLowerCase();
            }
            console.log("\nSPELL RESULTS: ");
            this.spells.forEach((v) => {
                const spellName = v.name.toLowerCase();
                if ((args.lvl == undefined || args.lvl == v.level) && (spellName.includes(args.name) || !args.name)) {
                    // if spell is prepared, change color
                    let prep_clr = "auto";
                    if (this.preparedSpells.indexOf(v.name) != -1) {
                        prep_clr = "#c451d8";
                    }
                    console.log("- %c" + v.name + " %c(Level " + v.level + ")", "color: " + prep_clr, "color: #03a9f4");
                }
            })
        }
    }
    class Render {
        constructor(props = {}) {
            const {
                parent = undefined,
                    avatar = "https://i.pinimg.com/originals/9c/60/e9/9c60e9f811ba8203d35f2da1746c6d04.jpg"
            } = props;
            this.avatar = avatar;
            this.ID = Math.floor(Math.random() * 999999);
            this.parent = parent;
        }
        display_spell(spell) {
            const getGetOrdinal = function (n) {
                const s = ["th", "st", "nd", "rd"],
                    v = n % 100;
                return (n != 0) ? n + (s[(v - 20) % 10] || s[v] || s[0]) : "Cantrip";
            }
            const window = document.getElementsByClassName("spellwindow")[0];
            window.innerHTML = `
            <h2>${spell.name}</h2>
            <span class="spellscription">${getGetOrdinal(spell.level) + "-level " + spell.school}</span>
            <span class="spellrow"><strong>Casting Time:</strong> ${spell.ctime}</span>
            <span class="spellrow"><strong>Range:</strong> ${spell.range} feet</span>
            <span class="spellrow"><strong>Components:</strong> ${spell.components}</span>
            <span class="spellrow"><strong>Duration:</strong> ${(spell.duration !== 0) ? spell.duration + " minutes" : "Instantaneous"}</span>
            <span class="spellrow"><strong>Damage:</strong> ${spell.roll}</span>
            <iframe src="https://roll20.net/compendium/dnd5e/${encodeURIComponent(spell.name)}#toc_1"></iframe>
            `;
            document.getElementsByClassName("spellrow")[4].addEventListener("mousedown", (e) => {
                die.gfx_dice(spell.roll, e.clientX, e.clientY);
            });
            return spell.x;
        };
        spellbook() {
            const main = document.getElementById("main");
            main.innerHTML = `
            <div class="spellbook">
                <div class="spellwindow">
                </div>
                <div class="spell-list">
                </div>
            </div>
            `;
            const list = document.getElementsByClassName("spell-list")[0];
            this.parent.magic.spells.forEach((x) => {
                list.insertAdjacentHTML('beforeend', `<span class="lvl">${x.level}</span><span class="spell" ${(this.parent.magic.preparedSpells.indexOf(x.name) != -1) ? `style=color:${"#e658ff"}` : ""}>${x.name}</span>`);
                list.lastChild.addEventListener("click", () => {
                    this.display_spell(x);
                });
            });
        }
        update() {
            const percent = (this.parent.health.currentHP / this.parent.health.maxHP) * 100;
            let invCount = 0;
            if (!(Object.keys(this.parent.inv.backpack).length === 0 && this.parent.inv.backpack.constructor === Object)) {
                for (var property in this.parent.inv.backpack) {
                    if (this.parent.inv.backpack.hasOwnProperty(property)) {
                        invCount++;
                    }
                }
            };
            const box = document.getElementsByClassName(`${this.ID}`)[0];
            box.innerHTML = `
                <h3>${this.parent.name}</h3>
                <span class="lvl-class">Level ${this.parent.lvl} ${this.parent.player_class.name}</span>
                <div class="row">
                    <span class="label">HP</span>
                    <div class="fill-bar"><span class="fill" style="width: ${percent}%; background: ${getColor(percent)}">${this.parent.health.currentHP}/${this.parent.health.maxHP}</span></div>
                </div>
                <p><strong>AC: </strong>${this.parent.health.currentAC}</p>
                <p><strong>Gold: </strong>${this.parent.inv.gold} GP</p>
                <p><strong>Inventory: </strong>${invCount} Items</p>
                <div class="ability_scores">
                    <div class="mod_pill">
                        <span class="mod_title">Strength</span>
                        <span class="mod_score">${this.parent.stats.ability_mod.str}</span>
                        <span class="mod_raw">${this.parent.stats.ability.str}</span>
                    </div>
                    <div class="mod_pill">
                        <span class="mod_title">Dexterity</span>
                        <span class="mod_score">${this.parent.stats.ability_mod.dex}</span>
                        <span class="mod_raw">${this.parent.stats.ability.dex}</span>
                    </div>
                    <div class="mod_pill">
                        <span class="mod_title">Constitution</span>
                        <span class="mod_score">${this.parent.stats.ability_mod.cnst}</span>
                        <span class="mod_raw">${this.parent.stats.ability.cnst}</span>
                    </div>
                    <div class="mod_pill">
                        <span class="mod_title">Intelligence</span>
                        <span class="mod_score">${this.parent.stats.ability_mod.int}</span>
                        <span class="mod_raw">${this.parent.stats.ability.int}</span>
                    </div>
                    <div class="mod_pill">
                        <span class="mod_title">Wisdom</span>
                        <span class="mod_score">${this.parent.stats.ability_mod.wis}</span>
                        <span class="mod_raw">${this.parent.stats.ability.wis}</span>
                    </div>
                    <div class="mod_pill">
                        <span class="mod_title">Charisma</span>
                        <span class="mod_score">${this.parent.stats.ability_mod.chr}</span>
                        <span class="mod_raw">${this.parent.stats.ability.chr}</span>
                    </div>
                    ${(this.parent.player_class.spcMod) ? `
                    <div class="magic_stats">
                        <div class="magic_pill">
                            <span class="magic_score">${this.parent.magic.Mod}</span>
                            <span class="magic_title">Spellcasting Ability</span>
                        </div>
                        <div class="magic_pill">
                            <span class="magic_score">${this.parent.magic.DC}</span>
                            <span class="magic_title">Spellsave DC</span>
                        </div>
                        <div class="magic_pill">
                            <span class="magic_score">${this.parent.magic.SPAttack}</span>
                            <span class="magic_title">Spellattack Bonus</span>
                        </div>
                    </div>` : ""}
                </div>
            `;
            const list_of_skills = document.getElementsByClassName(`${this.ID}`)[0].parentElement.getElementsByClassName("mod_pill");
            for (let i = 0; i < list_of_skills.length; i++) {
                list_of_skills[i].addEventListener("mousedown", (e) => {
                    let rd = new richDice(e.clientX, e.clientY);
                    const roll = die.r("d20", true);
                    rd.setTitle(`${list_of_skills[i].getElementsByClassName("mod_title")[0].textContent} Check`);
                    rd.setLeftAlign(true);
                    rd.setSize(280);
                    rd.setBackground("./src/img/tavern.png");
                    rd.setDescription(`With a raw roll of <strong>${roll}</strong> and a ${list_of_skills[i].getElementsByClassName("mod_title")[0].textContent} bonus of <strong>${list_of_skills[i].getElementsByClassName("mod_score")[0].textContent}</strong>, it looks like your overall result is...`);
                    rd.addField("Result", roll + Number(list_of_skills[i].getElementsByClassName("mod_score")[0].textContent));
                    rd.render();
                });
            }
        }
        generate(clear) {
            const list = document.getElementById("main");
            if (clear !== false) {
                list.innerHTML = "";
            }
            const percent = (this.parent.health.currentHP / this.parent.health.maxHP) * 100;
            let invCount = 0;
            if (!(Object.keys(this.parent.inv.backpack).length === 0 && this.parent.inv.backpack.constructor === Object)) {
                for (var property in this.parent.inv.backpack) {
                    if (this.parent.inv.backpack.hasOwnProperty(property)) {
                        invCount++;
                    }
                }
            }
            let newHTML = `
            <div class="playerBox">
            <img src="${this.avatar}" alt="Avatar">
            <div class="playerInfo ${this.ID}">
                
            </div>
            </div>
            `;
            list.insertAdjacentHTML('beforeend', newHTML);
            console.log("Rendered!");
            document.getElementsByClassName(`${this.ID}`)[0].parentElement.addEventListener("mousedown", () => {
                console.log("Render updated!");
                this.update();
            });
            this.update();
        }
    };
    class Inventory {
        constructor(props = {}) {
            const {
                gold = Math.floor(Math.random() * 100) + 1,
                    backpack = {}
            } = props;
            this.gold = gold;
            this.backpack = backpack;
        }
        add(item, sUse) {
            if (!sUse) {
                sUse = false;
            }
            if (item === String(item)) {
                item = new Item({
                    name: String(item),
                    singleUse: sUse
                });
            }
            if (this.backpack[item.name]) {
                this.backpack[item.name].qnty += item.qnty;
            } else {
                this.backpack[item.name] = item;
            }
            console.log("Added " + item.qnty + " '" + item.name + "' to backpack!");
            return this.backpack[item.name];
        }
        get total_weight() {
            var total = 0;
            for (var property in this.backpack) {
                if (this.backpack.hasOwnProperty(property)) {
                    for (var i = 0; i < this.backpack[property].qnty; i++) {
                        total += this.backpack[property].weight;
                    }
                }
            }
            return total;
        }
        list(term) {
            if (term) {
                term = term.toLowerCase();
            }
            var sp_array = [];
            console.log("\nINVENTORY RESULTS: ");
            for (var property in this.backpack) {
                if (this.backpack.hasOwnProperty(property)) {
                    var item = this.backpack[property].name.toLowerCase();
                    if ((item.includes(term) || !term)) {
                        console.log("- " + this.backpack[property].name + ((this.backpack[property].qnty != 1) ? " x" + this.backpack[property].qnty + "" : ""));
                        sp_array.push(this.backpack[property]);
                    }
                }
            }
            if (sp_array.length <= 5) {
                return (sp_array.length == 1) ? sp_array[0] : sp_array;
            }
        }
        use(item_name) {
            var result;
            if (this.backpack[item_name].dmg) {
                console.log("You use the " + this.backpack[item_name].name + " (Rolling " + this.backpack[item_name].dmg + ")!");
                var result = die.r(this.backpack[item_name].dmg);
            }
            if (this.backpack[item_name].singleUse) {
                this.backpack[item_name].qnty -= 1;
                console.log("After you use the object, what remains becomes useless to you. (" + this.backpack[item_name].qnty + " Remaining)");
                if (this.backpack[item_name].qnty <= 0) {
                    delete this.backpack[item_name];
                }
            }
            return result;
        }
        drop(item_name) {
            var item = this.backpack[item_name];
            this.backpack[item_name].qnty -= 1;
            console.log("You drop your '" + this.backpack[item_name].name + "' (" + this.backpack[item_name].qnty + " Remaining)");
            if (this.backpack[item_name].qnty <= 0) {
                delete this.backpack[item_name];
            }
        }
    }
    class Health {
        constructor(props = {}) {
            const {
                parent = undefined,
                    hitdie = parent.lvl + parent.player_class.hitdie,
                    maxHP = die.cvt(hitdie).face + die.r([die.cvt(hitdie).iterator - 1, die.cvt(hitdie).face].join("d") + "+" + String(parent.stats.ability_mod.cnst), true),
                    currentHP = maxHP,
                    defaultAC = 10 + parent.stats.ability_mod.dex,
                    currentAC = defaultAC
            } = props;
            this.maxHP = maxHP;
            this.currentHP = currentHP;
            this.defaultAC = defaultAC;
            this.currentAC = currentAC;
            this.hitdie = hitdie;
            this.parent = parent;
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
        useHitDie(numDice) {
            let constitution = (!this.parent.stats) ? 0 : this.parent.stats.ability_mod.cnst;
            let dice = die.cvt(this.hitdie);
            if (numDice > dice.iterator) {
                console.log("You don't have enough hit die!");
                return;
            } else if (this.maxHP == this.currentHP) {
                console.log("You already have max health!");
                return;
            }
            dice.iterator -= numDice; // take from remaining hitdie
            const pointsHealed = die.r(String(numDice + "d" + dice.face + "+" + constitution));
            this.add(pointsHealed);
            dice = `${dice.iterator}d${dice.face}`;
            this.hitdie = dice;
            console.log(dice + " remaining");
            return pointsHealed;
        }
    }
    class Save {
        constructor(parent) {
            this.name = parent.name;
            this.classData = parent.player_class;
            this.lvl = parent.lvl;
            this.inspiration = parent.inspiration;
            this.statsData = parent.stats;
            this.healthData = {
                maxHP: parent.health.maxHP,
                currentHP: parent.health.currentHP,
                defaultAC: parent.health.defaultAC,
                currentAC: parent.health.currentAC,
                hitdie: parent.health.hitdie
            };
            this.exp = parent.exp;
            this.magicData = {
                spells: MapToObj(parent.magic.spells),
                spcMod: parent.magic.spcMod,
                preparedSpells: parent.magic.preparedSpells
            };
            this.invData = parent.inv;
            this.renderData = {
                avatar: parent.render.avatar
            };
        }
    };
    class Stats {
        constructor(props = {}) {
            const {
                parent = undefined,
                    save_throws = parent.player_class.save_throws,
                    marks = [],
                    ability = genABS(27),
                    inspiration = "",
                    passive_perception = 10 + serAbility(ability.wis),
                    misc_prof = {
                        lang: ["Common"],
                        wpn: parent.player_class.start_prof.wpn,
                        tool: parent.player_class.start_prof.tool,
                        armr: parent.player_class.start_prof.armr
                    },
            } = props;
            this.prof = serProf(parent.lvl);
            this.save_throws = save_throws;
            this.marks = marks;
            this.ability = ability;
            this.inspiration = inspiration;
            this.passive_perception = passive_perception;
            this.misc_prof = misc_prof;
            this.ability_mod = {
                str: serAbility(this.ability.str),
                dex: serAbility(this.ability.dex),
                cnst: serAbility(this.ability.cnst),
                int: serAbility(this.ability.int),
                wis: serAbility(this.ability.wis),
                chr: serAbility(this.ability.chr)
            }
            this.skills = {
                acrobatics: this.ability_mod.dex,
                animal_handling: this.ability_mod.wis,
                arcana: this.ability_mod.int,
                athletics: this.ability_mod.str,
                deception: this.ability_mod.chr,
                history: this.ability_mod.int,
                insight: this.ability_mod.wis,
                intimidation: this.ability_mod.chr,
                investigation: this.ability_mod.int,
                medicine: this.ability_mod.wis,
                nature: this.ability_mod.int,
                perception: this.ability_mod.wis,
                performance: this.ability_mod.chr,
                persuasion: this.ability_mod.chr,
                religon: this.ability_mod.int,
                sleight_of_hand: this.ability_mod.dex,
                stealth: this.ability_mod.dex,
                survival: this.ability_mod.wis
            };
            // check if skills have been marked for proficency and update to match
            for (var property in this.skills) {
                if (this.skills.hasOwnProperty(property)) {
                    for (var i = 0; i < this.marks.length; i++) {
                        if (property == this.marks[i]) {
                            this.skills[property] += this.prof;
                        }
                    }
                }
            }
        }
        get initiative() {
            return this.ability_mod.dex;
        };
        list_skills() {
            console.log("\nSkill Scores: ");
            if (!(Object.keys(this.skills).length === 0 && this.skills.constructor === Object)) {
                for (var property in this.skills) {
                    if (this.skills.hasOwnProperty(property)) {
                        var skill = this.skills[property];
                        var clr = "auto";
                        for (var i = 0; i < this.marks.length; i++) {
                            if (property == this.marks[i]) {
                                clr = "#00bcd4";
                            }
                        }
                        console.log("%c" + property + ": " + skill, "color:" + clr);
                    }
                }
            }
        }
        list_sthrows() {
            console.log("\nSaving Throws:");
            if (!(Object.keys(this.ability_mod).length === 0 && this.ability_mod.constructor === Object)) {
                for (var property in this.ability_mod) {
                    if (this.ability_mod.hasOwnProperty(property)) {
                        var skill = this.ability_mod[property];
                        var clr = "auto";
                        for (var i = 0; i < this.save_throws.length; i++) {
                            if (property == this.save_throws[i]) {
                                clr = "#00bcd4";
                                skill += this.prof;
                            }
                        }
                        console.log("%c" + property + ": " + skill, "color:" + clr);
                    }
                }
            }
        }
        // manual marking of skills for proficency
        manMark(skill) {
            if (this.skills[skill.toLowerCase()] && !this.marks.includes(skill)) {
                this.skills[skill.toLowerCase()] += this.prof;
                this.marks.push(skill.toLowerCase());
                return this.skills[skill.toLowerCase()];
            } else {
                console.log("You didn't input a valid skill! Either skill not found or already proficent.");
                return;
            }
        }
        sthrows(selector) {
            selector = selector.toLowerCase();
            var result = die.r("d20", true);
            var modifier = this.ability_mod[selector];
            for (var i = 0; i < this.save_throws.length; i++) {
                if (this.save_throws[i] == selector) {
                    modifier += this.prof;
                }
            }
            console.log("Roll: " + result + ", Modifier: " + modifier + ", Total Roll: " + (result + modifier));
            return result + modifier;
        }
    };

    class Player {
        constructor(props = {}) {
            const {
                name = "John Doe",
                    classData = {},
                    lvl = 1,
                    healthData = {},
                    exp = 0,
                    magicData = {},
                    statsData = {},
                    invData = {},
                    renderData = {}
            } = props;
            statsData.parent = this;
            healthData.parent = this;
            magicData.parent = this;
            renderData.parent = this;
            this.name = name;
            this.player_class = new playerClass(classData);
            this.lvl = lvl;
            this.stats = new Stats(statsData);
            this.health = new Health(healthData);
            this.exp = exp;
            this.magic = new Magic(magicData);
            this.inv = new Inventory(invData);
            this.render = new Render(renderData);
        }
        get d20() {
            return die.r("d20", true);
        }
        longrest() {
            this.health.currentHP = this.health.maxHP;
            console.log("[LONG REST] Reset to max HP (HP: " + this.health.maxHP + ")");
            this.health.currentAC = this.health.defaultAC;
            console.log("[LONG REST] Assuming any previous temp AC has been reset. (AC: " + this.health.currentAC + ")");
            const cvt = die.cvt(this.health.hitdie);
            cvt.iterator = (cvt.iterator + (this.lvl / 2) >= this.lvl) ? this.lvl : cvt.iterator + Math.round(this.lvl / 2);
            this.health.hitdie = `${cvt.iterator}d${cvt.face}`;
            console.log("[LONG REST] You also regain spent Hit Dice, up to a number of dice equal to half of your total number of dice  (" + this.health.hitdie + ")");

            console.log("%cYou awaken feeling well rested!", "font-style: italic");
        }
        get self() {
            console.log("\n%c" + this.name.toUpperCase(), "font-family: Georgia, serif; font-size: 16px;");
            console.log("Level " + this.lvl + " " + this.player_class.name);
            console.log("Proficiency Bonus: " + this.stats.prof);
            const HPP = ((this.health.currentHP / this.health.maxHP) * 100).toFixed(1);
            console.log("HP: %c" + this.health.currentHP + "/" + this.health.maxHP + " (" + HPP + "%)", "color: " + getColor(HPP));
            console.log("AC: " + this.health.currentAC);
            console.log("Gold: " + this.inv.gold + " GP");
            let invCount = 0;
            if (!(Object.keys(this.inv.backpack).length === 0 && this.inv.backpack.constructor === Object)) {
                for (var property in this.inv.backpack) {
                    if (this.inv.backpack.hasOwnProperty(property)) {
                        invCount++;
                    }
                }
            }
            console.log("Inventory: " + ((invCount) ? invCount : "No") + " Items");

            if (this.magic.spcMod) {
                console.log("\nMagic Stats:");
                console.log("Spell Modifier: " + this.magic.Mod + " | Spell Save DC: " + this.magic.DC + " | Spell Attack Bonus: " + this.magic.SPAttack);
            }
            console.log("\nAbility Scores: ");
            const aScore = this.stats.ability_mod;
            console.log("STR: " + aScore.str + " | DEX: " + aScore.dex + " | CNST: " + aScore.cnst + " | INT: " + aScore.int + " | WIS: " + aScore.wis + " | CHR: " + aScore.chr);

        }
        save(id) {
            if (typeof (Storage) !== "undefined") {
                // if user doesn't specify id or uses "charList"
                if (!id || id == "charList") {
                    id = this.name;
                }
                // add to list of character ids
                if (localStorage["charList"]) {
                    var charArray = JSON.parse(localStorage["charList"]);
                    if (!charArray.includes(id)) {
                        charArray.push(id);
                        localStorage["charList"] = JSON.stringify(charArray);
                    }
                } else {
                    localStorage["charList"] = '["' + id + '"]';
                }

                // the actual saving
                var savefile = JSON.stringify(new Save(this));
                localStorage[id] = savefile;
                console.log("Saved as '" + id + "'");
                return Load.restore(id);
            }
        }
        reload() {
            var charData = new Save(this);
            console.log("Character reloaded successfuly!");
            return Load.deSer(charData);
        }
        saveToFile(exportName) {
            if (!exportName) {
                exportName = this.name;
            }
            console.log("[WARNING] This will not save to HTML5 Local Storage, this will save externally only!");
            // thanks to stack overflow for this code
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(new Save(this)));
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", exportName + ".json");
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
        enableShortcuts(keybinds = {}) {
            // default keybinds
            const {
                self = "x",
                    gfx_self = "X",
                    skills = "c",
                    inv = "i",
                    magic = "m",
                    gfx_magic = "M"
            } = keybinds;
            console.log("Shortcuts enabled!");
            document.addEventListener("keypress", (e) => {
                if (e.key == self) {
                    this.self;
                } else if (e.key == gfx_self) {
                    this.render.generate();
                } else if (e.key == skills) {
                    this.stats.list_sthrows();
                    this.stats.list_skills();
                } else if (e.key == inv) {
                    this.inv.list();
                } else if (e.key == magic) {
                    this.magic.list();
                } else if (e.key == gfx_magic) {
                    this.render.spellbook();
                }
            });
        }
    }
    return Player;
})();

// start up banner
console.log("%cMagic Dice", "font-size: 30px; color: #c51b1b; text-shadow: 1px 1px black; font-family: Georgia, serif;");
console.log("%cA character manager built for Dungeons & Dragons 5e", "font-size: 14px; font-style: italic; font-weight: bold; font-family: 'Trebuchet MS', Helvetica, sans-serif;padding: 5px;");