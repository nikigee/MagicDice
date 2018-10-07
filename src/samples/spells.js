const Library_Of_Spells = (() => {
    const Library = {
        Firebolt: new Spell({
            name: "Fire Bolt",
            level: 0,
            school: "Evocation",
            components: ["V", "S"],
            range: 120,
            roll: "1d10",
            url: "http://engl393-dnd5th.wikia.com/wiki/Fire_Bolt"
        }),
        Light: new Spell({
            name: "Light",
            level: 0,
            school: "Evocation",
            url: "http://engl393-dnd5th.wikia.com/wiki/Light",
            components: ["V", "M"],
            range: 0
        }),
        Message: new Spell({
            name: "Message",
            level: 0,
            range: 120,
            school: "Transmutation",
            components: ["V", "S", "M"],
            url: "http://engl393-dnd5th.wikia.com/wiki/Message"
        }),
        Minor_Illusion: new Spell({
            name: "Minor Illusion",
            level: 0,
            range: 30,
            components: ["S", "M"],
            duration: 1,
            school: "Illusion",
            url: "http://engl393-dnd5th.wikia.com/wiki/Minor_Illusion"
        }),
        MagicMissle: new Spell({
            name: "Magic Missle",
            level: 1,
            school: "Evocation",
            components: ["V", "S"],
            range: 120,
            roll: "3d4+1",
            url: "http://engl393-dnd5th.wikia.com/wiki/Magic_Missile"
        }),
        Shield: new Spell({
            name: "Shield",
            level: 1,
            school: "Abjuration",
            range: 0,
            ctime: "1 reaction, which you take when you are hit by an attack or targeted by the magic missile spell",
            url: "http://engl393-dnd5th.wikia.com/wiki/Shield",
            components: ["V", "S"]
        }),
        Identify: new Spell({
            name: "Identify",
            level: 1,
            school: "Divination",
            ctime: "1 minute",
            range: 0,
            components: ["V", "S", "M"],
            duration: 0,
            url: "http://engl393-dnd5th.wikia.com/wiki/Identify"
        }),
        Mage_Armour: new Spell({
            name: "Mage Armour",
            level: 1,
            school: "Abjuration",
            range: 0,
            components: ["V", "S", "M"],
            duration: 480,
            url: "http://engl393-dnd5th.wikia.com/wiki/Mage_Armor"
        }),
        Detect_Magic: new Spell({
            name: "Detect Magic",
            level: 1,
            school: "Divination",
            range: 0,
            components: ["V", "S"],
            duration: 10,
            url: "http://engl393-dnd5th.wikia.com/wiki/Detect_Magic"
        }),
        Unseen_Servant: new Spell({
            name: "Unseen Servant",
            level: 1,
            school: "Conjuration",
            range: 60,
            components: ["V", "S", "M"],
            duration: 60,
            url: "http://engl393-dnd5th.wikia.com/wiki/Unseen_Servant"
        }),
        Grease: new Spell({
            name: "Grease",
            level: 1,
            school: "Conjuration",
            range: 60,
            components: ["V", "S", "M"],
            duration: 1,
            url: "http://engl393-dnd5th.wikia.com/wiki/Grease"
        }),
        FlamingSphere: new Spell({
            name: "Flaming Sphere",
            level: 2,
            school: "Conjuration",
            duration: 1,
            components: ["V", "S", "M"],
            range: 60,
            roll: "2d6",
            url: "http://engl393-dnd5th.wikia.com/wiki/Flaming_Sphere"
        }),
        Levitate: new Spell({
            name: "Levitate",
            level: 2,
            school: "Transmutation",
            duration: 10,
            components: ["V", "S", "M"],
            range: 60,
            url: "http://engl393-dnd5th.wikia.com/wiki/Levitate"
        }),
        Misty_Step: new Spell({
            name: "Misty Step",
            level: 2,
            ctime: "1 Bonus Action",
            school: "Conjuration",
            range: 30,
            components: ["V"],
            duration: 0,
            url: "http://engl393-dnd5th.wikia.com/wiki/Misty_Step"
        }),
        Pyrotechnics: new Spell({
            name: "Pyrotechnics",
            level: 2,
            school: "Transmutation",
            range: 60,
            components: ["V", "S"],
            duration: 0,
            url: "http://engl393-dnd5th.wikia.com/wiki/Pyrotechnics"
        }),
        Scorching_Ray: new Spell({
            name: "Scorching Ray",
            level: 2,
            school: "Evocation",
            range: 120,
            components: ["V", "S"],
            duration: 0,
            roll: "2d6",
            url: "http://engl393-dnd5th.wikia.com/wiki/Scorching_Ray"
        }),
        Shatter: new Spell({
            name: "Shatter",
            level: 2,
            school: "Evocation",
            range: 60,
            components: ["V", "S", "M"],
            duration: 0,
            roll: "3d8",
            url: "http://engl393-dnd5th.wikia.com/wiki/Shatter"
        }),
        Leos_Tiny_Hut: new Spell({
            name: "Leomund's Tiny Hut",
            level: 3,
            school: "Evocation",
            ctime: "1 Minute",
            range: 0,
            components: ["V", "S", "M"],
            duration: 480,
            url: "http://engl393-dnd5th.wikia.com/wiki/Leomund%27s_Tiny_Hut"
        }),
        Fireball: new Spell({
            name: "Fireball",
            level: 3,
            school: "Evocation",
            components: ["V", "S", "M"],
            range: 150,
            roll: "8d6",
            url: "http://engl393-dnd5th.wikia.com/wiki/Fireball"
        }),
        Counterspell: new Spell({
            name: "Counterspell",
            level: 3,
            school: "Abjuration",
            ctime: "1 reaction, which is taken when you see a creature within 60 feet of you casting a spell",
            range: 60,
            components: ["S"],
            duration: 0,
            url: "http://engl393-dnd5th.wikia.com/wiki/Counterspell"
        }),
        Fly: new Spell({
            name: "Fly",
            level: 3,
            school: "Transmutation",
            range: 0,
            components: ["V", "S", "M"],
            duration: 10,
            url: "http://engl393-dnd5th.wikia.com/wiki/Fly"
        }),
        Remove_Curse: new Spell({
            name: "Remove Curse",
            level: 3,
            school: "Abjuration",
            range: 0,
            components: ["V", "S"],
            duration: 0,
            url: "http://engl393-dnd5th.wikia.com/wiki/Remove_Curse"
        }),
        Polymorph: new Spell({
            name: "Polymorph",
            level: 4,
            school: "Transmutation",
            range: 60,
            components: ["V", "S", "M"],
            duration: 60,
            url: "http://engl393-dnd5th.wikia.com/wiki/Polymorph"
        }),
        Dimension_Door: new Spell({
            name: "Dimension Door",
            level: 4,
            school: "Conjuration",
            range: 500,
            components: ["V"],
            duration: 0,
            url: "http://engl393-dnd5th.wikia.com/wiki/Dimension_Door"
        }),
        Watery_Sphere: new Spell({
            name: "Watery Sphere",
            level: 4,
            school: "Conjuration",
            range: 90,
            components: ["V", "S", "M"],
            duration: 6,
            url: "http://engl393-dnd5th.wikia.com/wiki/Watery_Sphere"
        }),
        BlackTentacles: new Spell({
            name: "Evard's Black Tentacles",
            level: 4,
            school: "Conjuration",
            duration: 1,
            components: ["V", "S", "M"],
            range: 90,
            roll: "3d6",
            url: "http://engl393-dnd5th.wikia.com/wiki/Evard%27s_Black_Tentacles"
        }),
        Hand: new Spell({
            name: "Bigby's Hand",
            level: 5,
            school: "Evocation",
            duration: 1,
            components: ["V", "S", "M"],
            range: 120,
            roll: "4d8",
            url: "http://engl393-dnd5th.wikia.com/wiki/Bigby%27s_Hand"
        }),
    }
    return Library
})();