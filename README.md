# MagicDice
This is a personal project of mine I embarked on to create an extensive and flexable character manager for D&D 5e to handle tracking all the stats that can slow down a regular session of D&D. I've implemented automation where possible to maxmise efficency and to hopefully cut down on the 'on-the-spot' math most have to do when playing 5e.

In particular it's also useful for level ups as it handles the majority of the tedious updating of a character sheet.

## Website
You can now run this tool in your browser at https://nikgo.me/MagicDice

## Features
- HP tracking (character.health.add(x))
- Simulated Dice (die.r("2d10"))
- Defaults (Automatically set arguments when creating new objects for maximum ease)
- Hit dice automation
- Inventory
- Magic/Spells
- Save/Load system to pick up easily from last session. (Either localstorage options or save-to-file options)
- Keyboard shortcuts (Just do <yourcharacter>.enableShortcuts())
- Limited GUI under the Render Class. (Keep track of base information in an eye pleasing way)
- And many more.
  
## Getting Started
1. Open magicdie.html in your web browser of choice. (I'd recommend chromeium for this one)
1. Open the dev console.
1. Create a new Player `let James = new Player({name:"James", lvl: 5})`
1. Edit as nessecery (Use `James.enableShortcuts()` and then the relevent keys `x - x self; X - render GUI character display; c - list stats/save throws; i - inventory; m - spell list; M - GUI Spellbook` to examine relevent information)
1. Render character display (`James.render.generate()`).
1. Save your character! (`James.save()` or `James.saveToFile()` for a .json copy)
