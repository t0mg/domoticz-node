var idxMap = {};

idxMap.switches = {};
idxMap.dimmers = {};
idxMap.scenes = {};
idxMap.temps = {};
idxMap.doors = {};
idxMap.windows = {};
idxMap.fans = {};

idxMap.scenes.definitions = {};

idxMap.switches.items = '';
idxMap.dimmers.items = [7, 8, 9, 10, 34, 36, 38, 47, 48];
idxMap.scenes.items = [1, 2, 3, 4, 5];
idxMap.temps.items = [43, 15, 22];
idxMap.doors.items = [28, 29, 30];
idxMap.windows.items = '';
idxMap.fans.items = [37];

idxMap.scenes.definitions[1] = "All On";
idxMap.scenes.definitions[2] = "All Off";
idxMap.scenes.definitions[3] = "Movie";
idxMap.scenes.definitions[4] = "Night Away";
idxMap.scenes.definitions[5] = "Entertaining";
idxMap.scenes.definitions[6] = "Evening Dim";
idxMap.scenes.definitions[7] = "Garage Test";



module.exports = idxMap;