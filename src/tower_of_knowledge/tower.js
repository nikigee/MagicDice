/* 
This is just one big databank for d&d related stuff like monsters and spells.
I'd store these in a JSON file but for people running MagicDice locally in a browser without a webserver, this will still allow that data to be used.

The data here will most like be kept static anyway. Not as if the program features web scraping.. yet. ;^)
*/
const Library = (()=>{
    const library = {};
    library.monsters = {};
    library.spells = {};

    return library;
})();