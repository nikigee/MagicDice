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
            dice.css.alignment = "left";
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
            const container = `<div class="richDice ${this.ID}" style="left: ${this.x}px; top: ${this.y}px; ${this.css.background}">
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
            if (callback) callback(this.dom);
        }
    }
    return richDice;
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

// start up banner
console.log("%cMagic Dice", "font-size: 30px; color: #c51b1b; text-shadow: 1px 1px black; font-family: Georgia, serif;");
console.log("%cA character manager built for Dungeons & Dragons 5e", "font-size: 14px; font-style: italic; font-weight: bold; font-family: 'Trebuchet MS', Helvetica, sans-serif;padding: 5px;");