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
        // restore from local storage
        restore: function (character) {
            const characters = JSON.parse(localStorage.getItem("charList"));
            if (!character || !characters[character]) {
                console.log("Invalid identifier specified!");
                return false;
            }
            magicHandler.managed_players.push(this.deSer(characters[character]));
            MagicUI.resetDOM(() => {
                const device_width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                if (device_width > 436) {
                    magicHandler.last.enableShortcuts();
                } else{
                    magicHandler.last.render.generate();
                }
                console.log("You can now access this character by simply typing 'ply' into this console.");
            });
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

    function convertText(arg) {
        var text;
        switch (arg) {
            case "str":
                text = "Strength";
                break;
            case "dex":
                text = "Dexterity";
                break;
            case "cnst":
                text = "Constitution";
                break;
            case "int":
                text = "Intelligence";
                break;
            case "wis":
                text = "Wisdom";
                break;
            case "chr":
                text = "Charisma";
                break;
            default:
                text = arg;
                break;
        }
        return text;
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
    /* Be warned. This section is an absolute mess. */
    const Render = (() => {
        class statEditor {
            constructor(parent, event) {
                this.parent = parent;
                this.event = event;
            }
            edit(dom, callback) {
                let editID;
                dom.classList.forEach((x) => {
                    if (x.startsWith("ed_")) {
                        editID = x; // get the class that starts with the 'ed_'
                    }
                });
                // we've got our edit id (i.e. ed_ability_dex). 
                // now we have to find out what it means and what to do with it
                if (editID.startsWith("ed_ability_")) {
                    editID = editID.replace("ed_ability_", "");
                    richDice.genPrompt(`Edit ${convertText(editID)} Score`, `Use the input below to enter a new ${convertText(editID)} score.`, {
                        p_title: "New Score",
                        p_placeholder: this.parent.stats.ability[editID],
                        x: this.event.pageX,
                        y: this.event.pageY
                    }, (data) => {
                        try {
                            if (!data || !isFinite(data) || data < 0 || data > 30) {
                                throw new Error("Invalid value entered!");
                            } else {
                                this.parent.stats.ability[editID] = data;
                                if (callback)
                                    callback();
                            }
                        } catch (err) {
                            console.error(err.message);
                            MagicUI.alert(err.message, {
                                type: "error"
                            });
                        }
                    });
                } else if (editID == "ed_health_maxHP") {
                    richDice.genPrompt(`Edit Max Health`, `Use the input below to enter a new maxHP.`, {
                        p_title: "New Health",
                        p_placeholder: this.parent.health.maxHP,
                        x: this.event.pageX,
                        y: this.event.pageY
                    }, (data) => {
                        try {
                            if (!data || !isFinite(data) || data < 0) {
                                throw new Error("Invalid value entered!");
                            } else {
                                this.parent.health.maxHP = data;
                                if (callback)
                                    callback();
                            }
                        } catch (err) {
                            console.error(err.message);
                            MagicUI.alert(err.message, {
                                type: "error"
                            });
                        }
                    });
                } else if (editID == "ed_health_currentAC") {
                    richDice.genPrompt(`Edit Current AC`, `Use the input below to enter a new Current Armor Class.`, {
                        p_title: "New AC",
                        p_placeholder: this.parent.health.currentAC,
                        x: this.event.pageX,
                        y: this.event.pageY
                    }, (data) => {
                        try {
                            if (!data || !isFinite(data) || data < 0) {
                                throw new Error("Invalid value entered!");
                            } else {
                                this.parent.health.currentAC = data;
                                if (callback)
                                    callback();
                            }
                        } catch (err) {
                            console.error(err.message);
                            MagicUI.alert(err.message, {
                                type: "error"
                            });
                        }
                    });
                } else if (editID == "ed_inv_gold") {
                    richDice.genPrompt(`Edit Gold`, `Use the input below to add or take away gold`, {
                        p_title: "Gold Modifier",
                        p_placeholder: "30",
                        x: this.event.pageX,
                        y: this.event.pageY
                    }, (data) => {
                        try {
                            if (!data || !isFinite(data)) {
                                throw new Error("Invalid value entered!");
                            } else {
                                this.parent.inv.gold += Number(data);
                                console.log(`Gold: ${this.parent.inv.gold-Number(data)} -> ${this.parent.inv.gold}`);
                                if (Number(this.parent.inv.gold) < 0) {
                                    this.parent.inv.gold = 0;
                                }
                                if (callback)
                                    callback();
                            }
                        } catch (err) {
                            console.error(err.message);
                            MagicUI.alert(err.message, {
                                type: "error"
                            });
                        }
                    });
                } else if (editID == "ed_avatar") {
                    richDice.genPrompt(`Edit Avatar`, `Enter a new URL for the character's avatar.`, {
                        p_title: "URL",
                        p_placeholder: this.parent.render.avatar,
                        x: this.event.pageX,
                        y: this.event.pageY
                    }, (data) => {
                        try {
                            if (!data) {
                                throw new Error("Invalid value entered!");
                            } else {
                                this.parent.render.avatar = data;
                                if (callback)
                                    callback();
                            }
                        } catch (err) {
                            console.error(err.message);
                            MagicUI.alert(err.message, {
                                type: "error"
                            });
                        }
                    });
                } else if (editID.startsWith("ed_sthrow_")) {
                    try {
                        editID = editID.replace("ed_sthrow_", "");
                        if (this.parent.stats.save_throws.includes(editID)) {
                            const index = this.parent.stats.save_throws.indexOf(editID);
                            if (index > -1) {
                                this.parent.stats.save_throws.splice(index, 1);
                                if (callback)
                                    callback();
                            }
                        } else if (this.parent.stats.sthrows.get(editID) !== undefined) {
                            this.parent.stats.save_throws.push(editID);
                            if (callback)
                                callback();
                        } else {
                            throw new Error("Something went wrong!");
                        }
                    } catch (err) {
                        console.error(err.message);
                        MagicUI.alert(err.message, {
                            type: "error"
                        });
                    }
                } else if (editID.startsWith("ed_skl_")) {
                    try {
                        editID = editID.replace("ed_skl_", "");
                        if (this.parent.stats.skill_modifiers[editID]) {
                            let skill = this.parent.stats.skill_modifiers[editID];
                            skill.proficent = (skill.proficent) ? false : true; // toggle proficency
                            if (callback)
                                callback();
                        } else {
                            throw new Error("Cannot find skill!");
                        }
                    } catch (err) {
                        console.error(err.message);
                        MagicUI.alert(err.message, {
                            type: "error"
                        });
                    }
                } else if (editID == "ed_name") {
                    richDice.genPrompt(`Edit Name`, `Enter a new name for your character`, {
                        p_title: "Name",
                        p_placeholder: this.parent.name,
                        x: this.event.pageX,
                        y: this.event.pageY
                    }, (data) => {
                        try {
                            if (!data) {
                                throw new Error("Invalid value entered!");
                            } else {
                                this.parent.name = data;
                                if (callback)
                                    callback();
                            }
                        } catch (err) {
                            console.error(err.message);
                            MagicUI.alert(err.message, {
                                type: "error"
                            });
                        }
                    });
                } else if (editID == "ed_level") {
                    richDice.genPrompt(`Edit Level`, `Enter a new level for your character`, {
                        p_title: "Level",
                        p_placeholder: this.parent.lvl,
                        x: this.event.pageX,
                        y: this.event.pageY
                    }, (data) => {
                        try {
                            data = Math.round(data);
                            if (!data || !isFinite(data) || data < 0 || data > 20) {
                                throw new Error("Invalid value entered!");
                            } else {
                                this.parent.lvl = data;
                                MagicUI.alert(`Updating level...`, {
                                    type: "info"
                                });
                                if (callback)
                                    callback();
                            }
                        } catch (err) {
                            console.error(err.message);
                            MagicUI.alert(err.message, {
                                type: "error"
                            });
                        }
                    });
                } else if (editID == "ed_health_hitdice") {
                    richDice.genPrompt(`Edit Hitdice`, `Change the value of the hitdice`, {
                        p_title: "Hitdice",
                        p_placeholder: this.parent.health.hitdie,
                        x: this.event.pageX,
                        y: this.event.pageY
                    }, (data) => {
                        try {
                            if (!(/(^\d+d\d+$)/.test(data))) {
                                throw new Error("Invalid value entered!");
                            } else {
                                this.parent.health.hitdie = data;
                                if (callback)
                                    callback();
                            }
                        } catch (err) {
                            console.error(err.message);
                            MagicUI.alert(err.message, {
                                type: "error"
                            });
                        }
                    });
                } else if (editID == "ed_exp") {
                    richDice.genPrompt(`Edit EXP`, `Change your character's experience points (Doesn't affect level).`, {
                        p_title: "EXP",
                        p_placeholder: this.parent.exp,
                        x: this.event.pageX,
                        y: this.event.pageY
                    }, (data) => {
                        try {
                            data = Math.round(data);
                            if (!data || !isFinite(data) || data < 0) {
                                throw new Error("Invalid value entered!");
                            } else {
                                this.parent.exp = data;
                                if (callback)
                                    callback();
                            }
                        } catch (err) {
                            console.error(err.message);
                            MagicUI.alert(err.message, {
                                type: "error"
                            });
                        }
                    });
                }
            }
        }
        /* Base template for all sections of the player GUI */
        class SubRender {
            constructor(props = {}) {
                const {
                    master = undefined
                } = props;
                this.master = master;
            }
            setMaster(x) {
                this.master = x;
            }
        }
        /* The main player card */
        const PlayerCard = (() => {
            const PlayerCard = new SubRender();
            PlayerCard.more_info = false;

            PlayerCard.generate = (clear = true) => {
                const list = document.getElementById("main");
                if (clear !== false) {
                    list.innerHTML = "";
                }
                let newHTML = `
                    <div class="playerBox" id="box${PlayerCard.master.ID}">
                    <img src="${PlayerCard.master.avatar}" class="editable ed_avatar" alt="Avatar">
                    <div class="playerInfo ${PlayerCard.master.ID}">
                        
                    </div>
                    <div class="playerExtra ${PlayerCard.master.ID}"></div>
                    <div class="show_more ${PlayerCard.master.ID}"><i class="fa fa-caret-down" aria-hidden="true"></i></div>
                    </div>
                    `;
                list.insertAdjacentHTML('beforeend', newHTML);
                console.log("Rendered!");
                PlayerCard.update();
                PlayerCard.displayMoreInfo(true); // loads the skills and saving throws

                // Handle the edit mode stuff
                document.querySelector(`#box${PlayerCard.master.ID}`).addEventListener("click", (e) => {
                    if (!PlayerCard.master.editMode) {
                        return;
                    }
                    // code below will only execute if edit mode is on
                    let foundresult = false;
                    let dom = e.target;
                    while (!foundresult) {
                        if (dom.classList.contains("playerBox")) {
                            return false
                        }
                        if (dom.classList.contains("editable")) {
                            foundresult = true;
                        } else {
                            dom = dom.parentNode;
                        }
                    }
                    // try to edit the value, being careful not to screw up the player class
                    try {
                        new statEditor(PlayerCard.master.parent, e).edit(dom, () => {
                            PlayerCard.generate();
                        }); // edit the player class based on the thing clicked
                    } catch (err) {
                        console.log(err.message); // something went wrong
                    }
                });
                document.getElementsByClassName(`${PlayerCard.master.ID}`)[2].addEventListener("click", () => {
                    PlayerCard.displayMoreInfo()
                });
            };

            PlayerCard.update = () => {
                const percent = (PlayerCard.master.parent.health.currentHP / PlayerCard.master.parent.health.maxHP) * 100;
                const invCount = PlayerCard.master.parent.inv.backpack.size;
                const box = document.getElementsByClassName(`${PlayerCard.master.ID}`)[0];
                box.innerHTML = `
                        <h3 class="editable ed_name">${PlayerCard.master.parent.name}</h3>
                        <span class="lvl-class"><span class="editable ed_level">Level ${PlayerCard.master.parent.lvl}</span> <span class="editable ed_class">${PlayerCard.master.parent.player_class.name}</span></span>
                        <div class="row editable ed_health_maxHP">
                            <span class="label">HP</span>
                            <div class="fill-bar health-bar" style="max-width: 500px;"><span class="fill" style="width: ${percent}%; background: ${getColor(percent)}">${PlayerCard.master.parent.health.currentHP}/${PlayerCard.master.parent.health.maxHP}</span></div>
                        </div>
                        <div class="row">
                            <div class="playerTools">
                                <i class="fa fa-bed" aria-hidden="true"></i><i class="fa fa-medkit editable ed_health_hitdice" aria-hidden="true"></i></i><i class="fa fa-magic" aria-hidden="true"></i><i class="fa fa-address-book" aria-hidden="true"></i>
                            </div>
                        </div>
                        <p class="editable ed_health_currentAC"><strong>AC: </strong>${PlayerCard.master.parent.health.currentAC}</p>
                        <p class="editable ed_exp"><strong>Experience: </strong>${PlayerCard.master.parent.exp} XP</p>
                        <p><strong>Proficiency Bonus: </strong>${PlayerCard.master.parent.stats.prof}</p>
                        <p class="editable ed_inv_gold"><strong>Gold: </strong>${PlayerCard.master.parent.inv.gold} GP</p>
                        <p><strong>Inventory: </strong>${invCount} Items</p>
                        <div class="ability_scores">
                            <div class="mod_pill editable ed_ability_str">
                                <span class="mod_title">Strength</span>
                                <span class="mod_score">${PlayerCard.master.parent.stats.ability_mod.str}</span>
                                <span class="mod_raw">${PlayerCard.master.parent.stats.ability.str}</span>
                            </div>
                            <div class="mod_pill editable ed_ability_dex">
                                <span class="mod_title">Dexterity</span>
                                <span class="mod_score">${PlayerCard.master.parent.stats.ability_mod.dex}</span>
                                <span class="mod_raw">${PlayerCard.master.parent.stats.ability.dex}</span>
                            </div>
                            <div class="mod_pill editable ed_ability_cnst">
                                <span class="mod_title">Constitution</span>
                                <span class="mod_score">${PlayerCard.master.parent.stats.ability_mod.cnst}</span>
                                <span class="mod_raw">${PlayerCard.master.parent.stats.ability.cnst}</span>
                            </div>
                            <div class="mod_pill editable ed_ability_int">
                                <span class="mod_title">Intelligence</span>
                                <span class="mod_score">${PlayerCard.master.parent.stats.ability_mod.int}</span>
                                <span class="mod_raw">${PlayerCard.master.parent.stats.ability.int}</span>
                            </div>
                            <div class="mod_pill editable ed_ability_wis">
                                <span class="mod_title">Wisdom</span>
                                <span class="mod_score">${PlayerCard.master.parent.stats.ability_mod.wis}</span>
                                <span class="mod_raw">${PlayerCard.master.parent.stats.ability.wis}</span>
                            </div>
                            <div class="mod_pill editable ed_ability_chr">
                                <span class="mod_title">Charisma</span>
                                <span class="mod_score">${PlayerCard.master.parent.stats.ability_mod.chr}</span>
                                <span class="mod_raw">${PlayerCard.master.parent.stats.ability.chr}</span>
                            </div>
                            ${(PlayerCard.master.parent.player_class.spcMod) ? `
                            <div class="magic_stats">
                                <div class="magic_pill">
                                    <span class="magic_score">${PlayerCard.master.parent.magic.Mod}</span>
                                    <span class="magic_title">Spellcasting Ability</span>
                                </div>
                                <div class="magic_pill">
                                    <span class="magic_score">${PlayerCard.master.parent.magic.DC}</span>
                                    <span class="magic_title">Spellsave DC</span>
                                </div>
                                <div class="magic_pill">
                                    <span class="magic_score">${PlayerCard.master.parent.magic.SPAttack}</span>
                                    <span class="magic_title">Spellattack Bonus</span>
                                </div>
                            </div>` : ""}
                        </div>
                    `;

                document.getElementsByClassName(`${PlayerCard.master.ID}`)[0].getElementsByClassName("health-bar")[0].addEventListener("click", (e) => {
                    if (PlayerCard.master.editMode) {
                        return false
                    }
                    const health_window = new richDice(e.pageX, e.pageY);
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
                                    PlayerCard.master.parent.health.add(Number(num));
                                } else if (new RegExp(/[0-9]{0,9}d[0-9]{1,9}/).test(num)) {
                                    PlayerCard.master.parent.health.add(Dice.r(String(num)));
                                }
                                PlayerCard.update();
                                d.remove();
                            }
                        });
                    });
                });
                document.getElementsByClassName(`${PlayerCard.master.ID}`)[0].querySelector(".fa-bed").addEventListener("click", (e) => {
                    PlayerCard.master.parent.longrest();
                    const window = new richDice(e.pageX, e.pageY);
                    window.setTitle("Longrest");
                    window.setBackground("./src/img/monsters.jpg");
                    window.setDescription("You awaken feeling well rested!");
                    window.setSize(280);
                    window.css.alignment = "left";
                    window.addField(`Health (${PlayerCard.master.parent.health.currentHP})`, `Reset to max HP`);
                    window.addField(`AC (${PlayerCard.master.parent.health.currentAC})`, `Assuming any previous temp AC has been reset.`);
                    window.addField(`Hitdice (${PlayerCard.master.parent.health.hitdie})`, `You also regain spent Hit Dice, up to a number of dice equal to half of your total number of dice.`);
                    PlayerCard.update();
                    window.render();
                });
                document.getElementsByClassName(`${PlayerCard.master.ID}`)[0].querySelector(".fa-magic").addEventListener("click", (e) => {
                    richDice.genPrompt("Roll Dice", "Enter the dice combination of the roll.", {
                        p_title: "Dice",
                        p_placeholder: "8d6",
                        x: e.pageX - 50,
                        y: e.pageY - 20
                    }, (data) => {
                        Dice.gfx_dice(data, e.pageX - 50, e.pageY - 20);
                    });
                });
                document.getElementsByClassName(`${PlayerCard.master.ID}`)[0].querySelector(".fa-address-book").addEventListener("click", (e) => {
                    const window = new richDice(e.pageX, e.pageY);
                    window.setTitle("Proficiencies");
                    window.setBackground("./src/img/tj-foo-grand-library.jpg");
                    window.css.alignment = "left";
                    window.setSize(380);
                    window.setDescription("A list of the different things your character is proficent in, as well as any languages they know.");
                    window.addCustomHTML("Languages", `
                        <div class="pill-list">
                        ${(()=>{
                            let html = ``;
                            PlayerCard.master.parent.stats.misc_prof.lang.forEach(v=> html += `<span>${v}</span>`);
                            html += `<span class='add-more'><i class="fa fa-plus" aria-hidden="true"></i></span>`;
                            return html;
                        })()}
                        </div>
                    `);
                    window.addCustomHTML("Weapons", `
                        <div class="pill-list">
                        ${(()=>{
                            let html = "";
                            PlayerCard.master.parent.stats.misc_prof.wpn.forEach(v=> html += `<span>${v}</span>`);
                            html += `<span class='add-more'><i class="fa fa-plus" aria-hidden="true"></i></span>`;
                            return html;
                        })()}
                        </div>
                    `);
                    window.addCustomHTML("Tools", `
                        <div class="pill-list">
                        ${(()=>{
                            let html = "";
                            PlayerCard.master.parent.stats.misc_prof.tool.forEach(v=> html += `<span>${v}</span>`);
                            html += `<span class='add-more'><i class="fa fa-plus" aria-hidden="true"></i></span>`;
                            return html;
                        })()}
                        </div>
                    `);
                    window.addCustomHTML("Armor", `
                        <div class="pill-list">
                        ${(()=>{
                            let html = "";
                            PlayerCard.master.parent.stats.misc_prof.armr.forEach(v=> html += `<span>${v}</span>`);
                            html += `<span class='add-more'><i class="fa fa-plus" aria-hidden="true"></i></span>`;
                            return html;
                        })()}
                        </div>
                    `);
                    window.render();
                });
                document.getElementsByClassName(`${PlayerCard.master.ID}`)[0].getElementsByClassName("ed_health_hitdice")[0].addEventListener("click", (e) => {
                    if (PlayerCard.master.editMode) {
                        return false
                    }
                    const window = new richDice(e.pageX, e.pageY);
                    window.setTitle("Shortrest Healing");
                    window.setSize(280);
                    window.setDescription("You sit by the campfire, trying your best to mend your wounds. Select how many hitdice you wish to use.");
                    window.css.alignment = "left";
                    window.setBackground("./src/img/tavern.png");
                    window.addField("Current Hitdice", PlayerCard.master.parent.health.hitdie);
                    window.addCustomHTML("Hitdice", `
                        <select>
                            ${(()=>{
                                let html = "";
                                let hitdie = new Dice(PlayerCard.master.parent.health.hitdie);
                                for(let i = 1; i <= hitdie.diceObj.iterator; i++){
                                    html += `<option value=${i}>${i}</option>`;
                                }
                                return html;
                            })()}
                        </select>
                    `);
                    window.addButton("submit", `<i class="fa fa-check" aria-hidden="true"></i> Submit`);
                    window.render((dom) => {
                        dom.querySelector(".submit").addEventListener("click", () => {
                            let hitdie = dom.querySelector("select").value;
                            PlayerCard.master.parent.health.useHitDie(hitdie);
                            PlayerCard.update();
                            dom.remove();
                        });
                    });
                });
                const list_of_skills = document.getElementsByClassName(`${PlayerCard.master.ID}`)[0].getElementsByClassName("mod_pill");
                for (let i = 0; i < list_of_skills.length; i++) {
                    list_of_skills[i].addEventListener("click", (e) => {
                        if (PlayerCard.master.editMode) {
                            return false
                        }
                        let rd = new richDice(e.pageX, e.pageY);
                        const roll = Dice.r("d20", true);
                        rd.setTitle(`${list_of_skills[i].getElementsByClassName("mod_title")[0].textContent} Check`);
                        rd.css.alignment = "left";
                        rd.setSize(280);
                        rd.setBackground("./src/img/tavern.png");
                        rd.setDescription(`With a raw roll of <strong>${roll}</strong> and a ${list_of_skills[i].getElementsByClassName("mod_title")[0].textContent} bonus of <strong>${list_of_skills[i].getElementsByClassName("mod_score")[0].textContent}</strong>, it looks like your overall result is...`);
                        rd.addField("Result", roll + Number(list_of_skills[i].getElementsByClassName("mod_score")[0].textContent));
                        rd.render();
                    });
                }
            };

            PlayerCard.displayMoreInfo = (dontToggle = false) => {
                const player_extra = document.getElementsByClassName(PlayerCard.master.ID)[1];
                if ((!PlayerCard.more_info && !dontToggle) || PlayerCard.more_info && dontToggle) {
                    player_extra.innerHTML = `
                            <div class="ply_moreinfo">
                                <div class="skl_savethrows skl_tab">
                                    <h4 class="moreinfo_header">Saving Throws</h4>
                                    ${(()=>{
                                        let text = "";
                                        PlayerCard.master.parent.stats.sthrows.forEach((v, k)=>{
                                            text += `<span class="skl_row editable ed_sthrow_${k}"><span class="skl_caption">${PlayerCard.master.parent.stats.save_throws.includes(k) ? '<i class="fa fa-star" aria-hidden="true"></i>' : '<i class="fa fa-star-o" aria-hidden="true"></i>'} ${convertText(k)}</span>
                                            <span class="skl_point">${v}</span></span>`
                                        });
                                        return text;
                                    })()}
                                </div>
                                <div class="skl_skills skl_tab">
                                    <h4 class="moreinfo_header">Skills</h4>
                                    ${(()=>{
                                        let text = "";
                                        for(var property in PlayerCard.master.parent.stats.skills)
                                            if(PlayerCard.master.parent.stats.skills.hasOwnProperty(property)){
                                                const skill = PlayerCard.master.parent.stats.skills[property];
                                                const skill_info = PlayerCard.master.parent.stats.skill_modifiers[property];
                                                text += `<span class="skl_row skl_smaller editable ed_skl_${property}"><span class="skl_caption">${skill_info.proficent ? '<i class="fa fa-star" aria-hidden="true"></i>' : '<i class="fa fa-star-o" aria-hidden="true"></i>'} ${skill_info.name}</span>
                                                <span class="skl_point">${skill}</span></span>`
                                            }
                                        return text;
                                    })()}
                                </div>
                            </div>
                            `;
                    document.querySelectorAll(".skl_row").forEach((e) => {
                        e.addEventListener("click", (e) => {
                            let target = e.target;
                            while (!target.className.includes("skl_row")) {
                                target = target.parentNode;
                                if (target == "")
                                    return false;
                            }
                            const value = target.querySelector(".skl_point").innerText;
                            let rd = new richDice(e.pageX, e.pageY);
                            const roll = Dice.x(`d20+${value}`, true);
                            rd.setTitle(`${target.querySelector(".skl_caption").innerText} Check`);
                            rd.css.alignment = "left";
                            rd.setSize(280);
                            rd.setBackground("./src/img/tavern.png");
                            rd.setDescription(`With a raw roll of <strong>${roll.list[0]}</strong> and a ${target.querySelector(".skl_caption").innerText} bonus of <strong>${value}</strong>, it looks like your overall result is...`);
                            rd.addField("Result", roll.total);
                            rd.render();
                        });
                    });
                    if (!dontToggle) {
                        PlayerCard.more_info = true;
                    }
                    document.getElementsByClassName(`${PlayerCard.master.ID}`)[2].getElementsByTagName("i")[0].className = "fa fa-caret-up";
                } else {
                    player_extra.innerHTML = "";
                    if (!dontToggle) {
                        PlayerCard.more_info = false;
                        document.getElementsByClassName(`${PlayerCard.master.ID}`)[2].getElementsByTagName("i")[0].className = "fa fa-caret-down";
                    }
                }
            };
            return PlayerCard;
        });

        /* Spellbook */
        const SpellBook = (() => {
            const spellbook = new SubRender();
            /* Creates the spellbook on screen */
            spellbook.generate = () => {
                const main = document.getElementById("main");
                const device_width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                main.innerHTML = `
                    <div class="spellbook">
                        <div class="spell-list" style="display: ${device_width <= 436 ? "none" : "inline-block"}">
                            <div id="spell-toolbar"><input type="text" placeholder="Fireball" id="spell-search">        <input type="checkbox" id="library-toggle"><label for="library-toggle">Search Library</label></div>
                            <div id="spells">
                            </div>
                        </div>
                    </div>
                    `;
                if (device_width <= 436) {
                    document.getElementById("main").insertAdjacentHTML("beforeend", `<div id="hamburger-icon"><i class="fa fa-bars"></i></div>`);
                    document.getElementById("hamburger-icon").addEventListener("click", () => {
                        spellbook.toggleSpelllist();
                    });
                }
                if (device_width <= 436) {
                    document.getElementsByClassName("spellbook")[0].insertAdjacentHTML("beforeend", `<div class="spellwindow"></div>`);
                } else {
                    document.getElementsByClassName("spellbook")[0].insertAdjacentHTML("afterbegin", `<div class="spellwindow"></div>`);
                }
                if (spellbook.master.parent.magic.spells.size > 0)
                    spellbook.display_spell(spellbook.master.parent.magic.spells.get(spellbook.master.parent.magic.spells.keys().next().value));
                spellbook.populate();
                document.getElementById("spell-toolbar").addEventListener("input", (e) => {
                    const opts = {};
                    opts.name = document.getElementById("spell-search").value;
                    opts.library = document.getElementById("library-toggle").checked;
                    spellbook.populate(opts); // populate with options
                });
            };
            /* Adds all spells into the list */
            spellbook.populate = (opt = {}) => {
                const {
                    library = false,
                        name = ""
                } = opt;
                if (opt.name)
                    opt.name = opt.name.toLowerCase();
                // for adding spells to spell list
                const list = document.getElementById("spells");
                list.innerHTML = ""; // clear list
                const device_width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                let currentLevel = "";
                if (!opt.library) {
                    spellbook.master.parent.magic.spells.forEach((x) => {
                        if (x.name.toLowerCase().includes(opt.name) || !opt.name || x.ctime.toLowerCase() == opt.name) {
                            if (x.level != currentLevel) {
                                currentLevel = x.level;
                                list.insertAdjacentHTML('beforeend', `<h4 class="spellLevel">${x.level + " Level"}</h4>`);
                            }
                            list.insertAdjacentHTML('beforeend', `<span class="spell" >${(spellbook.master.parent.magic.preparedSpells.indexOf(x.name) != -1) ? `<i class="fa fa-flask" aria-hidden="true"></i>` : ""} ${x.name}</span>`);
                            list.lastChild.addEventListener("click", () => {
                                if (device_width <= 436)
                                    spellbook.toggleSpelllist();
                                spellbook.display_spell(x);
                            });
                        }
                    });
                } else {
                    Library.spells.forEach((x) => {
                        if (x.name.toLowerCase().includes(opt.name) || !opt.name || x.ctime.toLowerCase() == opt.name) {
                            list.insertAdjacentHTML('beforeend', `<span class="spell" >${(spellbook.master.parent.magic.preparedSpells.indexOf(x.name) != -1) ? `<i class="fa fa-flask" aria-hidden="true"></i>` : ""} ${x.name}</span>`);
                            list.lastChild.addEventListener("click", () => {
                                if (device_width <= 436)
                                    spellbook.toggleSpelllist();
                                spellbook.display_spell(x);
                            });
                        }
                    });
                }
            };
            /* Display the spell on the left plane */
            spellbook.display_spell = (spell) => {
                const window = document.getElementsByClassName("spellwindow")[0];
                window.innerHTML = `
                <div class="spellbanner"><h2><a href="${spell.url}" target="_blank">${spell.name}</a></h2>
                <span class="spellscription">${spell.level + "-level " + spell.school}</span></div>
                <div class="spellbody"><span class="spellrow"><strong>Casting Time:</strong> ${spell.ctime}</span>
                <span class="spellrow"><strong>Range:</strong> ${spell.range}</span>
                <span class="spellrow"><strong>Components:</strong> ${spell.components}</span>
                <span class="spellrow"><strong>Duration:</strong> ${spell.duration}</span>
                <div class="descwrap"><p class="spelldesc">${spell.description.replace(/\n\n/g, "</p><p class='spelldesc'>")}</p></div>
                </div>`;
                // Make every dice mention a clickable roll.
                document.getElementsByClassName("descwrap")[0].innerHTML = document.getElementsByClassName("descwrap")[0].innerHTML.replace(/\d+d\d+(?:\s*\++\s*\d+)*/gi, (x) => {
                    return `<a class="diceClick">${x}</a>`
                })
                const diceRolls = document.getElementsByClassName("diceClick");
                for (let i = 0; i < diceRolls.length; i++) {
                    diceRolls[i].addEventListener("click", (e) => {
                        Dice.gfx_dice(e.target.innerHTML, e.pageX, e.pageY);
                    })
                }
                return window;
            };
            spellbook.toggleSpelllist = () => {
                const spellList = document.querySelector(".spell-list");
                if (spellList.style.display == "none") {
                    //document.getElementById("main").classList.add("mobile-fullscreen");
                    document.querySelector(".spellwindow").style.display = "none";
                    spellList.style.display = "inline-block";
                } else {
                    spellList.style.display = "none";
                    //document.getElementById("main").classList.remove("mobile-fullscreen");
                    document.querySelector(".spellwindow").style.display = "inline-block";
                }
            };
            return spellbook;
        });

        const MiscNotes = (() => {
            const misc_notes = new SubRender();
            misc_notes.generate = () => {
                const window = new richDice((document.body.clientWidth / 2) - 225, 150);
                window.setTitle("Features and Notes");
                window.setSize(1000);
                window.setDescription("Use this to list your class features or any miscellaneous notes.");
                window.addCustomHTML("", `<textarea class='window-big_box'>${misc_notes.master.parent.stats.misc_notes}</textarea>`);
                window.css.alignment = "left";
                window.render((dom) => {
                    dom.getElementsByClassName("window-big_box")[0].addEventListener("change", (e) => {
                        misc_notes.master.parent.stats.misc_notes = e.target.value;
                    });
                });
            };
            return misc_notes;
        });

        /*
        ======================================
            The Handler for the Render GUI
        ======================================
        */
        class Render {
            constructor(props = {}) {
                const {
                    parent = undefined,
                        avatar = "./src/img/render_default.jpg"
                } = props;
                this.avatar = avatar;
                this.ID = Math.floor(Math.random() * 999999);
                this.editMode = false;
                this.parent = parent;

                // sub sections
                this.playerCard = PlayerCard();
                this.playerCard.setMaster(this);
                this.spellbook = SpellBook();
                this.spellbook.setMaster(this);
                this.misc_notes = MiscNotes();
                this.misc_notes.setMaster(this);
            }
            generate(clear = true) {
                this.playerCard.generate(clear);
            }
        };
        return Render;
    })();
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
                    maxHP = die.x(hitdie).diceObj.face + die.x(`${hitdie}+${parent.stats.ability_mod.cnst}`).addDice(-1).total,
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
            const dice = new Dice(`${this.hitdie}*${constitution}`);
            if (numDice > dice.diceObj.iterator) {
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
            const pointsHealed = die.r(`${numDice}d${dice.diceObj.face}*${constitution}`);
            this.add(pointsHealed);
            this.hitdie = `${dice.diceObj.iterator}d${dice.diceObj.face}`;
            console.log(this.hitdie + " remaining");
            MagicUI.alert(this.hitdie + " remaining", {
                type: "alert"
            });
            return pointsHealed;
        }
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
            this.lvl = lvl;
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