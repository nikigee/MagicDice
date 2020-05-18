# MagicDice
This is a personal project of mine I embarked on to create an extensive and flexible character manager for D&D 5e to handle tracking all the stats that can slow down a regular session of D&D. I've implemented automation where possible to maximise efficiency and to hopefully cut down on the 'on-the-spot' math most have to do when playing 5e. This originally started as a simple JS Script to handle rolling dice for me, but over the last two years, it has ballooned into this project as I've constantly found new things to add and improve as I've been playing DnD.

## Philosophy
My hope is that Magic Dice will be the tool that is fast, robust, and more enjoyable than even a pen and paper experience without dealing with the restrictions of other character managers. I created this tool for my own personal use originally and its become the main way I play, so I hope you have as much luck with it as me.

A lot of Character Managers I have seen for Dungeons and Dragons seem to focus on codifying the entire dnd experience, or at least going beyond a character sheet in the attempts to make the PHB redundant. I like the idea, but it seems all too often this turns out to be more of a hindrance than a feature.

For example, if my character's strength score is calculated like this:
```
15 (base) + 1 (racial) + 2 (ABS) + 1 (Feat) = 19
```
In order to get that final score I don't want to have to create a custom race, manually do the ABS and create a custom feat just to reach 19, I'd rather just enter 19 as my strength score.

Sure, this way I could screw up the calculation and end up running an illegal character and if the tool has a large database to work with, it could be robust enough to eliminate the need for a PHB altogether but more often than not these tools are limited to the SRD because of legal issues anyway.

On a regular paper and pen character sheet, you don't face this issue at all. You can just enter 19 and trust in your own ability to do basic addition. That is sort of the philosophy my application strives for. I want to make playing dnd the most enjoyable experience possible and to do that I'm interested in automating the tedium out of the game without hampering the player's ability to do stuff. It shouldn't take two million years to create a character of a level higher than five. Ideally, I'd like it to be faster than on paper.

- No more having to write down all your spells as a wizard before a session.
- No more having to rewrite all your skills when you increase your strength.
- No more having to create online accounts with shady websites.
- No more having to rely on Wi-Fi in a game (you can simply download the application off the GitHub since its all client side).
- No more having to roll large amounts of dice for a given spell (looking at you, Fireball).
- No more having to import custom races/feats just to increase a skill modifier.

## Website
You can now run this tool in your browser at https://nikgo.me/MagicDice

## Features
- tbd
  
## Getting Started
I have an example character loaded by default and the character creator is pretty quick and easy so I recommend just getting on and experimenting a bit.

## Creating a Character
1. Use the new character creator and simply input all the basic options.
1. Use the Edit Mode to make any desired changes.
1. Add Spells using the Spellbook.
1. Be sure to put your class' abilities and features in your Note section.
1. Save your character (either export or save to browser storage).
