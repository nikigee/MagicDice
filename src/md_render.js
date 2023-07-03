/* 

Be warned. This section is an absolute mess. 

The class used to represent the GUI version of the player

*/
const Render = (() => {
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
                            this.parent.health.defaultAC = data; // set both    
                            this.parent.health.currentAC = data; // set both
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
            } else if (editID == "ed_speed") {
                richDice.genPrompt(`Edit Speed`, `Use the input below to enter a new movement speed for your character`, {
                    p_title: "Speed",
                    p_placeholder: this.parent.stats.speed,
                    x: this.event.pageX,
                    y: this.event.pageY
                }, (data) => {
                    try {
                        if (!data || !isFinite(data) || data < 0) {
                            throw new Error("Invalid value entered!");
                        } else {
                            this.parent.stats.speed = data; // speed
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
                            console.log(`Gold: ${this.parent.inv.gold - Number(data)} -> ${this.parent.inv.gold}`);
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
    /* 
    
    PlayerCard Section
    
    */
    const PlayerCard = (() => {
        const PlayerCard = new SubRender();
        PlayerCard.more_info = true;

        PlayerCard.generate = () => {
            document.getElementById("main").innerHTML = ""; // clear first
            document.getElementById("out-wrap").style.background = "rgba(0, 0, 0, 0.35)"; // make background dark
            let newHTML = `<div id="playerBox">
                <div id="playerAvatar">
                    <img src="${PlayerCard.master.avatar}" class="editable ed_avatar" alt="Avatar" onerror="MagicUI.imgError(this);">
                    <div id="avatarButtons">
                        
                    </div>
                </div>
                <div id="playerInfo"></div>
                <div id="column3">
                    <div id="playerExtra"></div>
                    <div id="showMore"><i class="fa fa-caret-down" aria-hidden="true"></i></div>
                </div>
            </div>`;
            document.getElementById("main").insertAdjacentHTML("beforeend", newHTML);
            PlayerCard.update();
            PlayerCard.displayMoreInfo(true); // loads the skills and saving throws

            // Handle the edit mode stuff
            document.querySelector(`#playerBox`).addEventListener("click", (e) => {
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
            document.querySelector(`#showMore`).addEventListener("click", () => {
                PlayerCard.displayMoreInfo()
            });
        }
        PlayerCard.update = () => {
            const percent = (PlayerCard.master.parent.health.currentHP / PlayerCard.master.parent.health.maxHP) * 100;
            const invCount = PlayerCard.master.parent.inv.backpack.size;
            const box = document.getElementById("playerInfo");
            box.innerHTML = `
                    <h3 class="editable ed_name">${PlayerCard.master.parent.name}</h3>
                    <span class="lvl-class"><span class="editable ed_level">Level ${PlayerCard.master.parent.lvl}</span> <span class="editable ed_class">${PlayerCard.master.parent.player_class.name}</span></span>
                    <div class="row editable ed_health_maxHP">
                        <span class="label">HP</span>
                        <div class="fill-bar health-bar"><span class="fill" style="width: ${percent}%; background: ${getColor(percent)}">${PlayerCard.master.parent.health.currentHP}/${PlayerCard.master.parent.health.maxHP}</span></div>
                    </div>
                    <div class="row" style="display: flex;align-items: center;justify-content: space-between;">
                        <div class="playerTools">
                            <i class="fa fa-bed" aria-hidden="true"></i><i class="fa fa-medkit editable ed_health_hitdice" aria-hidden="true"></i></i><i class="fa fa-address-book" aria-hidden="true"></i><i class="fa fa-keyboard"></i><i class="fa fa-qrcode" aria-hidden="true"></i><i class="fa fa-download"></i>
                        </div>
                        <div class="edit-wrap"><span>Edit Mode</span> <label class="switch"><input type="checkbox"><span class="slider round"></span></label> <i class="fa fa-cloud-download"></i></div>
                    </div>
                    <div class="playerExtra">
                            <div class="editable ed_health_currentAC caption"><label>AC </label><br><p>${PlayerCard.master.parent.health.currentAC}</p></div>
                            <div class="caption"><label>Initiative </label><br><p>${PlayerCard.master.parent.stats.ability_mod.dex}</p></div>
                            <div class="editable ed_speed caption"><label>Speed </label><br><p>${PlayerCard.master.parent.stats.speed}</p></div>
                            <div class="caption"><label>Passive Perception </label><br><p>${PlayerCard.master.parent.stats.passive_perception}</p></div>
                            <div class="editable ed_exp caption"><label>Experience </label><br><p>${PlayerCard.master.parent.exp} XP</p></div>
                            <div class="caption"><label>Proficiency Bonus </label><br><p>${PlayerCard.master.parent.stats.prof}</p></div>
                            <div class="editable ed_inv_gold caption"><label>Gold </label><br><p>${PlayerCard.master.parent.inv.gold} GP</p></div>
                            <div class="caption"><label>Inventory </label><br><p>${invCount} Items</p></div>
                            <div class="caption"><label>Hitdie </label><br><p>${PlayerCard.master.parent.health.hitdie}</p></div>
                    </div>
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

            box.getElementsByClassName("health-bar")[0].addEventListener("click", (e) => {
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
                                PlayerCard.master.parent.health.add(Dice.x(String(num)).total);
                            }
                            PlayerCard.update();
                            d.remove();
                        }
                    });
                });
            });
            box.querySelector(".fa-keyboard").addEventListener("click", (e) => {
                PlayerCard.master.parent.enableShortcuts();
            });
            box.querySelector(".fa-cloud-download").addEventListener("click", (e) => {
                PlayerCard.master.parent.save();
            });
            if (PlayerCard.master.parent.render.editMode) {
                document.querySelector(".edit-wrap").querySelector("input").checked = true;
            }
            document.querySelector(".edit-wrap").querySelector("input").addEventListener("change", (e) => {
                PlayerCard.master.parent.render.toggleEditMode();
            });
            box.querySelector(".fa-qrcode").addEventListener("click", (e) => {
                const data = new Save(PlayerCard.master.parent); // convert to JSON
                MagicUI.alert("Connecting to server...", {
                    type: "info"
                });
                fetch("https://nikgo.me/weave/upload", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }).then(res => {
                    MagicUI.alert("Upload Success!");
                    var id = res.json(); // get id
                    id.then((data) => {
                        const window = new richDice(e.pageX, e.pageY);
                        window.setTitle("Plane Shift");
                        window.setDescription(`Use either the QRCode or link to access this character on any device within the next 15 minutes.`);
                        window.setBackground("./src/img/e45f4a3274db844be192cd1ef0105a0c.jpg");
                        window.setSize(300);
                        //window.css.alignment = "left";
                        window.addField("Link", `<a href='${data.value}' target='_blank'>${data.value.replace("https://magic.nikgo.me", "")}</a>`);
                        window.addField("QRCode", "<div class='empty'></div>");

                        window.render((dom) => {
                            new QRCode(dom.querySelector(".empty"), data.value);

                        });
                    });
                }, err => {
                    MagicUI.alert(`${err}`, {
                        type: "error"
                    });
                });
            });
            box.querySelector(".fa-bed").addEventListener("click", (e) => {
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
            box.querySelector(".fa-download").addEventListener("click", (e) => {
                PlayerCard.master.parent.saveToFile();
            });
            box.querySelector(".fa-address-book").addEventListener("click", (e) => {
                const window = new richDice(e.pageX, e.pageY);
                window.setTitle("Proficiencies");
                window.setBackground("./src/img/tj-foo-grand-library.jpg");
                window.css.alignment = "left";
                window.setSize(380);
                window.setDescription("A list of the different things your character is proficent in, as well as any languages they know.");

                window.addCustomHTML("Languages", `
                    <div class="pill-list langs">
                    ${(() => {
                        let html = ``;
                        PlayerCard.master.parent.stats.misc_prof.lang.forEach(v => html += `<span>${v}</span>`);
                        html += `<span class='add-more'><i class="fa fa-plus" aria-hidden="true"></i></span>`;
                        return html;
                    })()}
                    </div>
                `);
                window.addCustomHTML("Weapons", `
                    <div class="pill-list wpns">
                    ${(() => {
                        let html = "";
                        PlayerCard.master.parent.stats.misc_prof.wpn.forEach(v => html += `<span>${v}</span>`);
                        html += `<span class='add-more'><i class="fa fa-plus" aria-hidden="true"></i></span>`;
                        return html;
                    })()}
                    </div>
                `);
                window.addCustomHTML("Tools", `
                    <div class="pill-list tools">
                    ${(() => {
                        let html = "";
                        PlayerCard.master.parent.stats.misc_prof.tool.forEach(v => html += `<span>${v}</span>`);
                        html += `<span class='add-more'><i class="fa fa-plus" aria-hidden="true"></i></span>`;
                        return html;
                    })()}
                    </div>
                `);
                window.addCustomHTML("Armor", `
                    <div class="pill-list armrs">
                    ${(() => {
                        let html = "";
                        PlayerCard.master.parent.stats.misc_prof.armr.forEach(v => html += `<span>${v}</span>`);
                        html += `<span class='add-more'><i class="fa fa-plus" aria-hidden="true"></i></span>`;
                        return html;
                    })()}
                    </div>
                `);
                window.render((dom) => {
                    dom.querySelector(".langs").querySelector(".add-more").addEventListener("click", (e) => {
                        richDice.genPrompt("Add a Language", "Type in the name of the language here.", {
                            p_title: "Name",
                            p_placeholder: "Common",
                            x: e.pageX,
                            y: e.pageY
                        }, (data) => {
                            if (!data || PlayerCard.master.parent.stats.misc_prof.lang.includes(data)) {
                                MagicUI.alert("The data you entered is invalid!", {
                                    type: "error"
                                });
                                return false;
                            }
                            PlayerCard.master.parent.stats.misc_prof.lang.push(data);
                            dom.querySelector(".langs").querySelector(".add-more").insertAdjacentHTML("beforebegin", `<span>${data}</span>`);
                        });
                    });
                    dom.querySelector(".wpns").querySelector(".add-more").addEventListener("click", (e) => {
                        richDice.genPrompt("Add a Weapon", "Type in the name of the weapon here.", {
                            p_title: "Name",
                            p_placeholder: "Simple Weapons",
                            x: e.pageX,
                            y: e.pageY
                        }, (data) => {
                            if (!data || PlayerCard.master.parent.stats.misc_prof.wpn.includes(data)) {
                                MagicUI.alert("The data you entered is invalid!", {
                                    type: "error"
                                });
                                return false;
                            }
                            PlayerCard.master.parent.stats.misc_prof.wpn.push(data);
                            dom.querySelector(".wpns").querySelector(".add-more").insertAdjacentHTML("beforebegin", `<span>${data}</span>`);
                        });
                    });
                    dom.querySelector(".tools").querySelector(".add-more").addEventListener("click", (e) => {
                        richDice.genPrompt("Add a Tool", "Type in the name of the tool here.", {
                            p_title: "Name",
                            p_placeholder: "Thieves Tools",
                            x: e.pageX,
                            y: e.pageY
                        }, (data) => {
                            if (!data || PlayerCard.master.parent.stats.misc_prof.tool.includes(data)) {
                                MagicUI.alert("The data you entered is invalid!", {
                                    type: "error"
                                });
                                return false;
                            }
                            PlayerCard.master.parent.stats.misc_prof.tool.push(data);
                            dom.querySelector(".tools").querySelector(".add-more").insertAdjacentHTML("beforebegin", `<span>${data}</span>`);
                        });
                    });
                    dom.querySelector(".armrs").querySelector(".add-more").addEventListener("click", (e) => {
                        richDice.genPrompt("Add an Armor", "Type in the name of the armor here.", {
                            p_title: "Name",
                            p_placeholder: "Light Armor",
                            x: e.pageX,
                            y: e.pageY
                        }, (data) => {
                            if (!data || PlayerCard.master.parent.stats.misc_prof.armr.includes(data)) {
                                MagicUI.alert("The data you entered is invalid!", {
                                    type: "error"
                                });
                                return false;
                            }
                            PlayerCard.master.parent.stats.misc_prof.armr.push(data);
                            dom.querySelector(".armrs").querySelector(".add-more").insertAdjacentHTML("beforebegin", `<span>${data}</span>`);
                        });
                    });
                });
            });
            box.getElementsByClassName("ed_health_hitdice")[0].addEventListener("click", (e) => {
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
                        ${(() => {
                        let html = "";
                        let hitdie = Dice.diceObj(PlayerCard.master.parent.health.hitdie);
                        for (let i = 1; i <= hitdie.stats.iterator; i++) {
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
            const list_of_skills = box.getElementsByClassName("mod_pill");
            for (let i = 0; i < list_of_skills.length; i++) {
                list_of_skills[i].addEventListener("click", (e) => {
                    if (PlayerCard.master.editMode) {
                        return false
                    }
                    let rd = new richDice(e.pageX, e.pageY);
                    const roll = Dice.x("d20", true).total;
                    rd.setTitle(`${list_of_skills[i].getElementsByClassName("mod_title")[0].textContent} Check`);
                    rd.css.alignment = "left";
                    rd.setSize(280);
                    rd.setBackground("./src/img/tavern.png");
                    rd.setDescription(`With a raw roll of <strong>${roll}</strong> and a ${list_of_skills[i].getElementsByClassName("mod_title")[0].textContent} bonus of <strong>${list_of_skills[i].getElementsByClassName("mod_score")[0].textContent}</strong>, it looks like your overall result is...`);
                    rd.addField("Result", roll + Number(list_of_skills[i].getElementsByClassName("mod_score")[0].textContent));
                    rd.render();
                });
            };
        };

        PlayerCard.displayMoreInfo = (dontToggle = false) => {
            const player_extra = document.getElementById("playerExtra");
            if ((!PlayerCard.more_info && !dontToggle) || PlayerCard.more_info && dontToggle) {
                player_extra.innerHTML = `
                        <div class="ply_moreinfo">
                            <div class="skl_savethrows skl_tab">
                                <h4 class="moreinfo_header">Saving Throws</h4>
                                ${(() => {
                        let text = "";
                        PlayerCard.master.parent.stats.sthrows.forEach((v, k) => {
                            text += `<span class="skl_row editable ed_sthrow_${k}"><span class="skl_caption">${PlayerCard.master.parent.stats.save_throws.includes(k) ? '<i class="fa fa-star" aria-hidden="true"></i>' : '<i class="fa fa-star-o" aria-hidden="true"></i>'} ${convertText(k)}</span>
                                        <span class="skl_point">${v}</span></span>`
                        });
                        return text;
                    })()}
                            </div>
                            <div class="skl_skills skl_tab">
                                <h4 class="moreinfo_header">Skills</h4>
                                ${(() => {
                        let text = "";
                        for (var property in PlayerCard.master.parent.stats.skills)
                            if (PlayerCard.master.parent.stats.skills.hasOwnProperty(property)) {
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
                        rd.setDescription(`With a raw roll of <strong>${roll.verboseList[0]}</strong> and a ${target.querySelector(".skl_caption").innerText} bonus of <strong>${value}</strong>, it looks like your overall result is...`);
                        rd.addField("Result", roll.total);
                        rd.render();
                    });
                });
                if (!dontToggle) {
                    PlayerCard.more_info = true;
                }
                document.getElementById("showMore").getElementsByTagName("i")[0].className = "fa fa-caret-up";
            } else {
                player_extra.innerHTML = "";
                if (!dontToggle) {
                    PlayerCard.more_info = false;
                    document.getElementById("showMore").getElementsByTagName("i")[0].className = "fa fa-caret-down";
                }
            }
        };
        return PlayerCard;
    });

    /* 
    
    Spellbook Section
    
    */
    const SpellBook = (() => {
        const spellbook = new SubRender();
        /* Creates the spellbook on screen */
        spellbook.generate = () => {
            const main = document.getElementById("main");
            const device_width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
            main.innerHTML = `
                <div class="spellbook">
                    <div class="spell-list" style="display: ${device_width <= 436 ? "none" : "inline-block"}">
                        <div id="spell-toolbar"><i class="fa fa-plus" aria-hidden="true"></i> <input type="text" placeholder="Fireball" id="spell-search">        <input type="checkbox" id="library-toggle"><label for="library-toggle">Search Library</label></div>
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
            document.getElementById("spell-toolbar").querySelector(".fa-plus").addEventListener("click", (e) => {
                const form = new richDice(e.clientX - 150, e.clientY);
                form.setTitle("Import Custom Spell");
                form.setDescription("Fill out this form to add a spell to your spellbook.");
                form.setBackground("./src/img/tj-foo-grand-library.jpg");
                form.css.alignment = "left"; // set text align left
                form.addPrompt("Name", "Fireball");
                form.addPrompt("Level", "3rd");
                form.addPrompt("School", "Evocation");
                form.addPrompt("Casting Time", "1 Action");
                form.addPrompt("Range", "150 ft (20ft)");
                form.addPrompt("Components", "V, S, M");
                form.addPrompt("Duration", "Instantaneous");
                form.addCustomHTML("Description", `<textarea placeholder="Description of spell goes here..." class="${form.ID}Description standardText"></textarea>`);
                form.render((dom) => {
                    const inputs = dom.getElementsByTagName("input");
                    for (let i = 0; i < inputs.length; i++) {
                        inputs[i].addEventListener("keydown", (e) => {
                            if (e.key == "Enter") {
                                const magic = spellbook.master.parent.magic;
                                const newSpell = new Spell({
                                    name: dom.getElementsByClassName(`${form.ID}Name`)[0].value,
                                    level: dom.getElementsByClassName(`${form.ID}Level`)[0].value,
                                    school: dom.getElementsByClassName(`${form.ID}School`)[0].value,
                                    ctime: dom.getElementsByClassName(`${form.ID}Casting Time`)[0].value,
                                    range: dom.getElementsByClassName(`${form.ID}Range`)[0].value,
                                    components: dom.getElementsByClassName(`${form.ID}Components`)[0].value,
                                    duration: dom.getElementsByClassName(`${form.ID}Duration`)[0].value,
                                    description: dom.getElementsByClassName(`${form.ID}Description`)[0].value
                                }); // create new spell from options
                                magic.add(newSpell); // add it into spellbook


                                const opts = {};
                                opts.name = document.getElementById("spell-search").value;
                                opts.library = document.getElementById("library-toggle").checked;
                                spellbook.populate(opts); // populate spells
                                dom.remove(); // remove form
                            }
                        });
                    }
                });
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

        function generateButtons(spell, element) {
            const magic = spellbook.master.parent.magic;
            let html = `<div id="spellButtons">`;
            // if spellbook contains spell
            if (!magic.spells.has(spell.name)) {
                html += `<button class="spellButton addSpell"><i class="fa fa-plus-circle" aria-hidden="true"></i><div class="spellButtonCap">Add Spell</div></button>`;
            } else {
                html += `<button class="spellButton removeSpell"><i class="fa fa-minus-circle" aria-hidden="true"></i><div class="spellButtonCap">Remove Spell</div></button>`;
                // make sure the spell isn't a cantrip
                if (spell.intLvl > 0) {
                    // check if prepared, if so display button
                    if (magic.preparedSpells.indexOf(spell.name) != -1) {
                        html += `<button class="spellButton unprepareSpell"><i class="fa fa-flask" aria-hidden="true"></i><div class="spellButtonCap">Unprepare Spell</div></button>`;
                    } else {
                        html += `<button class="spellButton prepareSpell"><i class="fa fa-flask" aria-hidden="true"></i><div class="spellButtonCap">Prepare Spell</div></button>`;
                    }
                }
            }
            html += "</div>";
            element.insertAdjacentHTML("beforeend", html); // add to the end of element
            const new_element = document.querySelector("#spellButtons");
            try {
                // we could combine this listener into one function but we want to avoid situations where 'Add Spell' instead removes a spell
                if (new_element.querySelector(".addSpell"))
                    new_element.querySelector(".addSpell").addEventListener("click", (e) => {
                        magic.add(spell); // add spell
                        MagicUI.alert("Spell Added!");
                    });
                if (new_element.querySelector(".removeSpell"))
                    new_element.querySelector(".removeSpell").addEventListener("click", (e) => {
                        magic.prepare_remove(spell); // unprepare spell first
                        magic.spells.delete(spell.name); // remove spell
                        MagicUI.alert("Spell Removed", {
                            type: "info"
                        });
                    });
                if (new_element.querySelector(".prepareSpell"))
                    new_element.querySelector(".prepareSpell").addEventListener("click", (e) => {
                        if (magic.prepare(spell)) {
                            MagicUI.alert(`Spell Prepared! (${magic.preparedSpells.length} / ${magic.Mod + spellbook.master.parent.lvl})`);
                        }
                    });
                if (new_element.querySelector(".unprepareSpell"))
                    new_element.querySelector(".unprepareSpell").addEventListener("click", (e) => {
                        if (magic.prepare_remove(spell)) {
                            MagicUI.alert(`Spell Unprepared! (${magic.preparedSpells.length} / ${magic.Mod + spellbook.master.parent.lvl})`, {
                                type: "info"
                            });
                        }
                    });
            } catch (err) {
                MagicUI.alert(err, {
                    type: "error"
                });
            }
            new_element.querySelectorAll(".spellButton").forEach((x) => {
                x.addEventListener("click", () => {
                    document.querySelector("#spellButtons").remove(); // remove old;
                    if (document.querySelector("#spells")) {
                        const opts = {};
                        opts.name = document.getElementById("spell-search").value;
                        opts.library = document.getElementById("library-toggle").checked;
                        spellbook.populate(opts); // populate if spell list exists
                    }
                    generateButtons(spell, element);
                });
            });
        }
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
                });
            }
            generateButtons(spell, document.querySelector(".spellbody"));
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

    /*
        Misc Notes Section
    */
    const MiscNotes = (() => {
        const misc_notes = new SubRender();
        if (!misc_notes.width || !misc_notes.height) {
            misc_notes.width = 500;
            misc_notes.height = 400;
        }
        misc_notes.generate = () => {
            const window = new richDice((document.body.clientWidth / 2) - 225, 150);
            window.setTitle("Features and Notes");
            window.setSize(1500);
            window.setDescription("Use this to list your class features or any miscellaneous notes.");
            window.addCustomHTML("", `<textarea class='window-big_box'>${misc_notes.master.parent.stats.misc_notes}</textarea>`);
            window.css.alignment = "left";
            window.render((dom) => {
                dom.getElementsByClassName("window-big_box")[0].style.width = misc_notes.width;
                dom.getElementsByClassName("window-big_box")[0].style.height = misc_notes.height;
                dom.getElementsByClassName("window-big_box")[0].addEventListener("change", (e) => {
                    misc_notes.master.parent.stats.misc_notes = e.target.value;
                    misc_notes.width = e.target.style.width;
                    misc_notes.height = e.target.style.height;
                });
            });
        };
        return misc_notes;
    });

    const MiscNotesMobile = (() => {
        const misc_notes = new SubRender();
        if (!misc_notes.width || !misc_notes.height) {
            misc_notes.width = 500;
            misc_notes.height = 400;
        }
        misc_notes.generate = () => {
            const window = new richDice((document.body.clientWidth / 2) - 225, 150);
            window.setTitle("Features and Notes");
            window.setSize(1500);
            window.setDescription("Use this to list your class features or any miscellaneous notes.");
            window.addCustomHTML("", `<textarea class='window-big_box'>${misc_notes.master.parent.stats.misc_notes}</textarea>`);
            window.css.alignment = "left";
            window.render((dom) => {
                dom.getElementsByClassName("window-big_box")[0].style.width = misc_notes.width;
                dom.getElementsByClassName("window-big_box")[0].style.height = misc_notes.height;
                dom.getElementsByClassName("window-big_box")[0].addEventListener("change", (e) => {
                    misc_notes.master.parent.stats.misc_notes = e.target.value;
                    misc_notes.width = e.target.style.width;
                    misc_notes.height = e.target.style.height;
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
            this.misc_notes_mobile = MiscNotesMobile();
            this.misc_notes.setMaster(this);
        }
        generate(clear = true) {
            this.playerCard.generate(clear);
        }
        toggleEditMode() {
            this.editMode = (this.editMode) ? false : true; // change edit mode
            const edit = document.querySelector(".edit-wrap");
            if (this.editMode == true) {
                document.body.insertAdjacentHTML("beforeEnd", `<h2 id="alertPopUp">*EDIT MODE*</h2>`);
                if (MagicUI.toolbars.get(this.ID))
                    MagicUI.toolbars.get(this.ID).querySelector(".fa-pencil").classList.add("active"); // make it always gold
                if (edit) {
                    edit.querySelector("input").checked = true;
                }
            } else {
                document.querySelector("#alertPopUp").remove();
                if (MagicUI.toolbars.get(this.ID))
                    MagicUI.toolbars.get(this.ID).querySelector(".fa-pencil").classList.remove("active"); // remove that
                if (edit) {
                    edit.querySelector("input").checked = false;
                }
            }
        }
    };
    return Render;
})();