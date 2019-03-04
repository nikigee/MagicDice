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
            if(this.managed_players.length == 0){
                return console.log("Currently no characters are loaded! You can load from a save file using the command 'Load.restoreFromFile()'");
            }
            else if (this.managed_players.length == 1) {
                return this.managed_players[0];
            } else {
                return this.managed_players;
            }
        }
    }
    return new magicHandler();
})();
Object.defineProperty(self, 'ply', {
    get: function () {
        return magicHandler.ply;
    }
});
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
            const characters = JSON.parse(localStorage.getItem("charList"));
            if (!character || !characters[character]) {
                console.log("Invalid identifier specified!");
                return false;
            }
            magicHandler.managed_players.push(this.deSer(characters[character]));
            console.log(magicHandler.last);
            magicHandler.last.render.generate();
        },
        ls: function () {
            console.log("---LIST OF CHARACTERS---");
            if (localStorage.getItem("charList")) {
                var charArray = JSON.parse(localStorage.getItem("charList"));
                let i = 0;
                for (property in charArray) {
                    console.log("[" + (i++) + "] " + property);
                }
            } else {
                console.log("No characters saved!");
            }
        },
        restoreFromFile: function () {
            const window = new richDice(50, 50);
            window.setTitle("Upload a Savefile");
            window.setDescription("Upload your character's .json file here.");
            window.addCustomHTML("", `<input type="file" class="upload" name="file">`);
            window.render((dom) => {
                dom.getElementsByClassName("upload")[0].addEventListener("change", (e) => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    reader.onload = (e) => {
                        magicHandler.managed_players.push(this.deSer(JSON.parse(e.target.result)));
                        console.log("File has been processed!");
                        dom.remove();
                        magicHandler.last.render.generate();
                        console.log("You can now access this character by simply typing 'ply' into this console.");
                    }
                });
            })
        }
    }
    return Loadf
})();

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
        addFromPrompt() {
            const objSpell = new Spell(JSON.parse(prompt("Please enter the object string.")));
            this.spells.set(objSpell.name, objSpell);
            this.sort();
            objSpell.x;
            return console.log("%cNew Spell Added!", "color: limegreen");
        }
        add(spell) {
            if (typeof (spell) != "object")
                return false
            this.spells.set(spell.name, spell);
            this.sort();
            spell.x;
            return console.log("%cNew Spell Added!", "color: limegreen");
        }
        sort() {
            const spellArray = Array.from(this.spells);
            spellArray.sort((a, b) => {
                return a[1].intLvl - b[1].intLvl;
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
        prepare_remove(spell) {
            if (!spell && this.preparedSpells.indexOf(spell.name) == -1) {
                console.log("You didn't specify a valid spell");
                return;
            }
            const index = this.preparedSpells.indexOf(spell.name);
            return this.preparedSpells.splice(index, 1);
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
                if ((args.lvl == undefined || args.lvl == v.intLvl) && (spellName.includes(args.name) || !args.name)) {
                    // if spell is prepared, change color
                    let prep_clr = "auto";
                    if (this.preparedSpells.indexOf(v.name) != -1) {
                        prep_clr = "#c451d8";
                    }
                    console.log("- %c" + v.name + " %c(" + v.level + " Level)", "color: " + prep_clr, "color: #03a9f4");
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
            const window = document.getElementsByClassName("spellwindow")[0];
            window.innerHTML = `
            <h2><a href="${spell.url}" target="_blank">${spell.name}</a></h2>
            <span class="spellscription">${spell.level + "-level " + spell.school}</span>
            <span class="spellrow"><strong>Casting Time:</strong> ${spell.ctime}</span>
            <span class="spellrow"><strong>Range:</strong> ${spell.range}</span>
            <span class="spellrow"><strong>Components:</strong> ${spell.components}</span>
            <span class="spellrow"><strong>Duration:</strong> ${spell.duration}</span>
            <span class="spellrow"><strong>Damage:</strong> ${spell.roll}</span>
            <div class="descwrap"><p class="spelldesc">${spell.description.replace(/\n\n/g, "</p><p class='spelldesc'>")}</p></div>
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
                list.insertAdjacentHTML('beforeend', `<span class="lvl">${(isNaN(Number(x.level[0]))) ? 0 : Number(x.level[0])}</span><span class="spell" ${(this.parent.magic.preparedSpells.indexOf(x.name) != -1) ? `style=color:${"#e658ff"}` : ""}>${x.name}</span>`);
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
                    <div class="fill-bar health-bar" style="width: 500px;"><span class="fill" style="width: ${percent}%; background: ${getColor(percent)}">${this.parent.health.currentHP}/${this.parent.health.maxHP}</span></div>
                </div>
                <p><strong>AC: </strong>${this.parent.health.currentAC}</p>
                <p><strong>Proficiency Bonus: </strong>${this.parent.stats.prof}</p>
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
            document.getElementsByClassName(`${this.ID}`)[0].getElementsByClassName("health-bar")[0].addEventListener("mousedown", (e) => {
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
                                this.parent.health.add(Number(num));
                            } else if (new RegExp(/[0-9]{0,9}d[0-9]{1,9}/).test(num)) {
                                this.parent.health.add(die.r(String(num)));
                            }
                            this.update();
                            d.remove();
                        }
                    });
                });
            });
            const list_of_skills = document.getElementsByClassName(`${this.ID}`)[0].getElementsByClassName("mod_pill");
            for (let i = 0; i < list_of_skills.length; i++) {
                list_of_skills[i].addEventListener("mousedown", (e) => {
                    let rd = new richDice(e.clientX, e.clientY);
                    const roll = die.r("d20", true);
                    rd.setTitle(`${list_of_skills[i].getElementsByClassName("mod_title")[0].textContent} Check`);
                    rd.css.alignment = "left";
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
                    expert = [],
                    ability = genABS(27),
                    inspiration = "",
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
            this.expert = expert;
            this.ability = ability;
            this.inspiration = inspiration;
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
                    for (var i = 0; i < this.expert.length; i++) {
                        if (property == this.expert[i]) {
                            this.skills[property] += this.prof;
                        }
                    }
                }
            };
            this.passive_perception = 10 + this.skills.perception;
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
            skill = skill.toLowerCase();
            if (this.skills[skill] && !this.marks.includes(skill)) {
                this.skills[skill] += this.prof;
                this.marks.push(skill);
                return this.skills[skill];
            } else {
                console.log("You didn't input a valid skill! Either skill not found or already proficent.");
                return;
            }
        }
        expertCheck(skill) {
            skill = skill.toLowerCase();
            if (this.skills[skill] && !this.expert.includes(skill)) {
                this.skills[skill] += this.prof;
                this.expert.push(skill);
                return this.skills[skill];
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
                if (localStorage["charList"])
                    var charArray = JSON.parse(localStorage["charList"]);
                else
                    var charArray = {};
                // the actual saving
                charArray[id] = new Save(this);
                localStorage["charList"] = JSON.stringify(charArray);
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
                    gfx_magic = "M",
                    roll = "R"
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
                } else if (e.key == roll) {
                    die.gfx_dice("d20", 20, 20);
                }
            });
        }
    }
    return Player;
})();