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

class Save {
    constructor(parent) {
        this.name = parent.name;
        this.classData = parent.player_class;
        this.lvl = parent.lvl;
        this.inspiration = parent.inspiration;
        //this.statsData = parent.stats;
        this.statsData = {
            save_throws: parent.stats.save_throws,
            ability: parent.stats.ability,
            inspiration: parent.stats.inspiration,
            misc_prof: parent.stats.misc_prof,
            misc_notes: parent.stats.misc_notes,
            skill_modifiers: parent.stats.skill_modifiers
        }
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
        /*
        this.invData = parent.inv;
        this.invData.backpack = MapToObj(parent.inv.backpack); // convert back to object for saving
        */
        // we have to do it like this because otherwise we'll change the parent object too
        this.invData = {
            gold: parent.inv.gold,
            backpack: MapToObj(parent.inv.backpack)
        };

        this.renderData = {
            avatar: parent.render.avatar
        };
    }
};

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
        restoreFromObj: function (characterData) {
            try {
                magicHandler.managed_players.push(this.deSer(characterData));
                const device_width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                if (device_width > 436) {
                    magicHandler.last.enableShortcuts();
                } else {
                    magicHandler.last.render.generate();
                }

                // emit event for other parts of Magic Dice to use.
                const loaded = new CustomEvent("char-loaded", {
                    detail: magicHandler.last
                });
                document.getElementById("out-wrap").dispatchEvent(loaded);
                console.log("You can now access this character by simply typing 'ply' into this console.");
            } catch (err) {
                MagicUI.alert(err, {
                    type: "error"
                });
            }
        },
        // restore from local storage
        restore: function (character) {
            const characters = JSON.parse(localStorage.getItem("charList"));
            if (!character || !characters[character]) {
                console.log("Invalid identifier specified!");
                return false;
            }
            magicHandler.managed_players.push(this.deSer(characters[character]));
            const device_width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
            if (device_width > 436) {
                magicHandler.last.enableShortcuts();
            } else {
                magicHandler.last.render.generate();
            }

            // emit event for other parts of Magic Dice to use.
            const loaded = new CustomEvent("char-loaded", {
                detail: magicHandler.last
            });
            document.getElementById("out-wrap").dispatchEvent(loaded);
            console.log("You can now access this character by simply typing 'ply' into this console.");
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
            document.getElementById("main").innerHTML = `
                <div class="menu-generic">
                    <div class="upload-btn-wrapper">
                        <div class="upload-header">Upload a File</div>
                        <span class="upload-caption">Drag or Select a character .json file</span>
                        <input type="file" id="upload" name="file">
                    </div>
                </div>
            `;
            // window.addCustomHTML("", ``);
            document.getElementById("upload").addEventListener("change", (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = (e) => {
                    // load the character once loaded.
                    magicHandler.managed_players.push(this.deSer(JSON.parse(e.target.result)));
                    console.log("File has been processed!");
                    magicHandler.last.render.generate(); // generate GUI display
                    console.log("You can now access this character by simply typing 'ply' into this console.");

                    // emit event for other parts of Magic Dice to use.
                    const loaded = new CustomEvent("char-loaded", {
                        detail: magicHandler.last
                    });
                    document.getElementById("out-wrap").dispatchEvent(loaded);
                }
            });
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
            try {
                if (!spell && this.preparedSpells.indexOf(spell.name) == -1) {
                    throw new Error("You didn't specify a valid spell");
                }
                const index = this.preparedSpells.indexOf(spell.name);
                return this.preparedSpells.splice(index, 1);
            } catch (err) {
                MagicUI.alert(err, {
                    type: "error"
                }); // log error
            }
        }
        prepare(spell) {
            try {
                if (!spell) {
                    throw new Error("You didn't specify a valid spell");
                } else if (this.preparedSpells.indexOf(spell.name) > -1) {
                    throw new Error("You already prepared this spell!");
                }
                const maxPrepared = this.Mod + this.parent.lvl;
                if (maxPrepared > this.preparedSpells.length) {
                    this.preparedSpells.push(spell.name);
                    console.log(`'${spell.name}' has been prepared successfuly! (${this.preparedSpells.length} / ${maxPrepared})`);
                    return true;
                } else {
                    throw new Error("You can't prepare any more spells!");
                }
            } catch (err) {
                MagicUI.alert(err, {
                    type: "error"
                }); // log error
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
    class Inventory {
        constructor(props = {}) {
            const {
                gold = Math.floor(Math.random() * 100) + 1,
                    backpack = {}
            } = props;
            this.gold = gold;
            this.backpack = objToMap(backpack);
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
            if (this.backpack.get(item.name)) {
                this.backpack.get(item.name).qnty += item.qnty;
            } else {
                this.backpack.set(item.name, item);
            }
            console.log("Added " + item.qnty + " '" + item.name + "' to backpack!");
            return this.backpack.get(item.name);
        }
        get total_weight() {
            var total = 0;
            this.backpack.forEach((v) => {
                for (var i = 0; i < v.qnty; i++) {
                    total += v.weight;
                }
            });
            return total;
        }
        list(term) {
            if (term) {
                term = term.toLowerCase();
            }
            var sp_array = [];
            console.log("\nINVENTORY RESULTS: ");
            this.backpack.forEach((v) => {
                var item = v.name.toLowerCase();
                if ((item.includes(term) || !term)) {
                    console.log("- " + v.name + ((v.qnty != 1) ? " x" + v.qnty + "" : ""));
                    sp_array.push(v);
                }
            });
            if (sp_array.length <= 5) {
                return (sp_array.length == 1) ? sp_array[0] : sp_array;
            }
        }
        use(item_name) {
            if (!this.backpack.get(item_name)) {
                console.log(`You don't have a ${item_name}!`);
                return false;
            }
            var result;
            if (this.backpack.get(item_name).dmg) {
                console.log("You use the " + this.backpack.get(item_name).name + " (Rolling " + this.backpack.get(item_name).dmg + ")!");
                var result = Dice.r(this.backpack.get(item_name).dmg);
            }
            if (this.backpack.get(item_name).singleUse) {
                this.backpack.get(item_name).qnty -= 1;
                console.log("After you use the object, what remains becomes useless to you. (" + this.backpack.get(item_name).qnty + " Remaining)");
                if (this.backpack.get(item_name).qnty <= 0) {
                    this.backpack.delete(item_name);
                }
            }
            return result;
        }
        drop(item_name) {
            if (!this.backpack.get(item_name)) {
                console.log(`You don't have a ${item_name}!`);
                return false;
            }
            this.backpack.get(item_name).qnty -= 1;
            console.log("You drop your '" + this.backpack.get(item_name).name + "' (" + this.backpack.get(item_name).qnty + " Remaining)");
            if (this.backpack.get(item_name).qnty <= 0) {
                this.backpack.delete(item_name);
            }
        }
    }
    class Health {
        constructor(props = {}) {
            const {
                parent = undefined,
                    hitdie = parent.lvl + parent.player_class.hitdie,
                    maxHP = new Dice(`${new Dice(parent.player_class.hitdie).max} + ${(parent.lvl - 1) + parent.player_class.hitdie}->${parent.stats.ability_mod.cnst}`).total,
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
            /* i love it when javascript changes my numbers to strings for no reason :) */
            this.currentHP = Number(this.currentHP);
            this.maxHP = Number(this.maxHP);
            this.currentHP += Number(amt); // the modding itself

            if (this.currentHP > this.maxHP) {
                this.currentHP = this.maxHP;
            }
            var status = (amt < 0) ? "Damaged" : "Healed"; // did it heal or damage?
            console.log(status + " by " + amt + " points! %c(HP: " + this.currentHP + " / " + this.maxHP + ")", "color:" + getColor(this.currentHP / this.maxHP * 100));
            MagicUI.alert(`${status} by ${amt} points! (${(this.currentHP / this.maxHP * 100).toFixed(0)}%)`, {
                type: "info"
            });
            return this.currentHP;
        }
        useHitDie(numDice) {
            let constitution = (!this.parent.stats) ? 0 : this.parent.stats.ability_mod.cnst;
            const dice = new Dice(`${this.hitdie}->${constitution}`);
            if (numDice > dice.list[0].stats.iterator) {
                console.log("You don't have enough hit die!");
                MagicUI.alert("You don't have enough hit die!", {
                    type: "error"
                });
                return;
            } else if (this.maxHP == this.currentHP) {
                console.log("You already have max health!");
                MagicUI.alert("You already have max health!", {
                    type: "error"
                });
                return;
            }
            dice.addDice(numDice * -1); // take from remaining hitdie
            // const pointsHealed = Dice.r(String(numDice + "d" + dice.face + "+" + constitution));
            const pointsHealed = die.x(`${numDice}d${dice.list[0].stats.face}->${constitution}`).total;
            this.add(pointsHealed);
            this.hitdie = `${dice.list[0].stats.iterator}d${dice.list[0].stats.face}`;
            console.log(this.hitdie + " remaining");
            MagicUI.alert(this.hitdie + " remaining", {
                type: "alert"
            });
            return pointsHealed;
        }
    }
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
                    misc_notes = "",
                    skill_modifiers = {
                        acrobatics: {
                            name: "Acrobatics",
                            raw: "dex",
                            expert: false,
                            proficent: false
                        },
                        animal_handling: {
                            name: "Animal Handling",
                            raw: "wis",
                            expert: false,
                            proficent: false
                        },
                        arcana: {
                            name: "Arcana",
                            raw: "int",
                            expert: false,
                            proficent: false
                        },
                        athletics: {
                            name: "Athletics",
                            raw: "str",
                            expert: false,
                            proficent: false
                        },
                        deception: {
                            name: "Deception",
                            raw: "chr",
                            expert: false,
                            proficent: false
                        },
                        history: {
                            name: "History",
                            raw: "int",
                            expert: false,
                            proficent: false
                        },
                        insight: {
                            name: "Insight",
                            raw: "wis",
                            expert: false,
                            proficent: false
                        },
                        intimidation: {
                            name: "Intimidation",
                            raw: "chr",
                            expert: false,
                            proficent: false
                        },
                        investigation: {
                            name: "Investigation",
                            raw: "int",
                            expert: false,
                            proficent: false
                        },
                        medicine: {
                            name: "Medicine",
                            raw: "wis",
                            expert: false,
                            proficent: false
                        },
                        nature: {
                            name: "Nature",
                            raw: "int",
                            expert: false,
                            proficent: false
                        },
                        perception: {
                            name: "Perception",
                            raw: "wis",
                            expert: false,
                            proficent: false
                        },
                        performance: {
                            name: "Performance",
                            raw: "chr",
                            expert: false,
                            proficent: false
                        },
                        persuasion: {
                            name: "Persuasion",
                            raw: "chr",
                            expert: false,
                            proficent: false
                        },
                        religon: {
                            name: "Religon",
                            raw: "int",
                            expert: false,
                            proficent: false
                        },
                        sleight_of_hand: {
                            name: "Sleight of Hand",
                            raw: "dex",
                            expert: false,
                            proficent: false
                        },
                        stealth: {
                            name: "Stealth",
                            raw: "dex",
                            expert: false,
                            proficent: false
                        },
                        survival: {
                            name: "Survival",
                            raw: "wis",
                            expert: false,
                            proficent: false
                        }
                    }
            } = props;
            this.parent = parent;
            this.save_throws = save_throws;
            this.marks = marks;
            this.expert = expert;
            this.ability = ability;
            this.inspiration = inspiration;
            this.misc_prof = misc_prof;
            this.misc_notes = misc_notes;
            this.skill_modifiers = skill_modifiers;
        }
        get prof() {
            return serProf(this.parent.lvl);
        }
        get initiative() {
            return this.ability_mod.dex;
        };
        get passive_perception() {
            return 10 + this.skills.perception;
        }

        get ability_mod() {
            const obj = {
                str: serAbility(this.ability.str),
                dex: serAbility(this.ability.dex),
                cnst: serAbility(this.ability.cnst),
                int: serAbility(this.ability.int),
                wis: serAbility(this.ability.wis),
                chr: serAbility(this.ability.chr)
            };
            return obj;
        };

        get skills() {
            const skills = {};
            // check if skills have been marked for proficency and update to match
            for (var property in this.skill_modifiers) {
                if (this.skill_modifiers.hasOwnProperty(property)) {
                    /*
                        this bit is for old versions, will convert to new system for managing proficency and expertise
                    */
                    if (this.marks.length > 0 || this.expert.length > 0) {
                        if (this.marks.includes(property)) {
                            this.skill_modifiers[property].proficent = true;
                            const index = this.marks.indexOf(property);
                            this.marks.splice(index, 1);
                            // expertise
                            if (this.expert.includes(property)) {
                                this.skill_modifiers[property].expert = true;
                                const index = this.expert.indexOf(property);
                                this.expert.splice(index, 1);
                            }
                        }
                    }
                    /*
                        New System below
                    */
                    // add raw amount
                    skills[property] = this.ability_mod[this.skill_modifiers[property].raw];
                    // if proficent, add the proficency bonus
                    if (this.skill_modifiers[property].proficent) {
                        skills[property] += this.prof;
                    };
                    // if they have expertise
                    if (this.skill_modifiers[property].expert && this.skill_modifiers[property].proficent) {
                        skills[property] += this.prof;
                    };
                }
            };
            return skills;
        }
        list_skills() {
            console.log("\nSkill Scores: ");
            if (!(Object.keys(this.skills).length === 0 && this.skills.constructor === Object)) {
                for (var property in this.skills) {
                    if (this.skills.hasOwnProperty(property)) {
                        var skill = this.skills[property];
                        var clr = "auto";
                        if (this.skill_modifiers[property].expert) {
                            clr = "#9c27b0";
                        } else if (this.skill_modifiers[property].proficent) {
                            clr = "#00bcd4";
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
                        if (this.save_throws.includes(property)) {
                            clr = "#00bcd4";
                            skill += this.prof;
                        }
                        console.log("%c" + property + ": " + skill, "color:" + clr);
                    }
                }
            }
        }
        // manual marking of skills for proficency
        makeProficent(skill) {
            skill = skill.toLowerCase();
            if (this.skill_modifiers[skill]) {
                if (!this.skill_modifiers[skill].proficent) {
                    this.skill_modifiers[skill].proficent = true;
                    console.log(`${this.skill_modifiers[skill].name} is now proficent!`);
                } else {
                    this.skill_modifiers[skill].proficent = false;
                    console.log(`${this.skill_modifiers[skill].name} is now no longer proficent!`);
                }
                return this.skills[skill];
            } else {
                console.log("You didn't input a valid skill!");
                return;
            }
        }
        expertCheck(skill) {
            skill = skill.toLowerCase();
            if (this.skill_modifiers[skill]) {
                if (!this.skill_modifiers[skill].expert) {
                    this.skill_modifiers[skill].expert = true;
                    console.log(`You are now an expert at ${this.skill_modifiers[skill].name}! (Need to be proficent for this to apply)`);
                } else {
                    this.skill_modifiers[skill].expert = false;
                    console.log(`You are now no longer an expert at ${this.skill_modifiers[skill].name}!`);
                }
                return this.skills[skill];
            } else {
                console.log("You didn't input a valid skill!");
                return;
            }
        }
        get sthrows() {
            const sthrows = new Map();
            if (!(Object.keys(this.ability_mod).length === 0 && this.ability_mod.constructor === Object)) {
                for (var property in this.ability_mod) {
                    if (this.ability_mod.hasOwnProperty(property)) {
                        let skill = this.ability_mod[property];
                        if (this.save_throws.includes(property)) {
                            skill += this.prof;
                        }
                        sthrows.set(property, skill);
                    }
                }
            }
            return sthrows;
        }
        roll_sthrow(selector) {
            selector = selector.toLowerCase();
            var result = Dice.r("d20", true);
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
            this.lvl = Number(lvl);
            this.stats = new Stats(statsData);
            this.health = new Health(healthData);
            this.exp = exp;
            this.magic = new Magic(magicData);
            this.inv = new Inventory(invData);
            this.render = new Render(renderData);
        }
        get d20() {
            return Dice.r("d20", true);
        }
        setLevel(lvl) {
            this.lvl = lvl;
            this.longrest();
            this.render.generate();
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
            const invCount = this.inv.backpack.size;
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
                MagicUI.alert(`Saved as '${id}'!`);
                return true
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
            MagicUI.alert("Downloading to external file.", {
                type: "info"
            });
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
                    notes = "J",
                    roll = "R"
            } = keybinds;
            // clear event listeners
            MagicUI.resetDOM(() => {
                console.log("Cleared previous shortcuts...");
                document.getElementById("out-wrap").addEventListener("keypress", (e) => {
                    // don't mistake keypress while typing for a keyboard shortcut
                    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
                        return false;
                    }
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
                        this.render.spellbook.generate();
                    } else if (e.key == roll) {
                        e.preventDefault();
                        richDice.genPrompt("Roll Dice", "Enter any RPG style dice combination.", {
                            p_title: "Dice",
                            p_placeholder: "8d6",
                            x: (document.body.clientWidth / 2) - 140,
                            y: 150
                        }, (data) => {
                            Dice.gfx_dice(data, (document.body.clientWidth / 2) - 140, 150);
                        });
                    } else if (e.key == notes) {
                        this.render.misc_notes.generate();
                    }
                });
            });
            console.log("Shortcuts enabled!");
            MagicUI.alert("Shortcuts enabled!");
            document.body.style.removeProperty("background");
            // print commands
            const window = new richDice((document.body.clientWidth / 2) - 170, 150);
            window.setSize();
            window.setTitle("Magic Dice Shortcuts");
            window.setDescription("A complete list of keyboard shortcuts.");
            window.css.alignment = "left";
            window.addCustomHTML("", `<ul>
                <li><strong>${self} -</strong> Lists all character information.</li>
                <li><strong>${gfx_self} -</strong> Generates character information in GUI format.</li>
                <li><strong>${skills} -</strong> Lists all character skills plus saving throws.</li>
                <li><strong>${inv} -</strong> Lists a character's inventory.</li>
                <li><strong>${magic} -</strong> Lists character spells.</li>
                <li><strong>${gfx_magic} -</strong> Generates character GUI spellbook.</li>
                <li><strong>${roll} -</strong> Rolls a d20 quickly.</li>
                <li><strong>${notes} -</strong> Opens the notebook for tracking character notes.</li>
            </ul>`);
            window.render();
        }
    }
    return Player;
})();