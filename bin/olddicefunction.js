const die = (() => {
    const dief = {
        cvt: function (diceRoll) {
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
        },
        s: function (diceObj) {
            return `${(diceObj.negative) ? "-" : ""}${diceObj.iterator}d${diceObj.face}${(diceObj.foreach_modifier) ? "*" : ""}${(diceObj.bonus) ? "+"+diceObj.bonus : ""}`;
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
                let htmlList = "<div class='dice-table'>"; // start the custom html table
                for (let i = 1; i <= rollObj.iterator; i++) {
                    roll = Math.floor(Math.random() * rollObj.face) + 1;
                    if (rollObj.foreach_modifier) {
                        roll += rollObj.foreach_modifier;
                    }
                    // dice.addField(`Roll ${i}: `, roll);
                    htmlList += `<div class="gfx_dice">${roll}</div>${(i == rollObj.iterator) ? "" : "+"}`;
                    total += roll;
                }
                htmlList += "</div>";
                dice.addCustomHTML("Rolls:", htmlList);
            } else {
                total = Math.floor(Math.random() * rollObj.face) + 1;
            }
            if (rollObj.iterator == 0) {
                total = 0;
            }
            if (rollObj.bonus) {
                if (rollObj.iterator > 1)
                    dice.addField("Bonus:", `${rollObj.bonus}`);
                total = total + rollObj.bonus;
            }
            if (rollObj.negative)
                total = total * -1
            dice.addField(`Total: `, total);
            const sound = new Audio("./src/misc/diceroll.mp3");
            dice.render(() => {
                sound.play(); // play sound effect
            });
            return dice;
        }
    }
    return dief
})();