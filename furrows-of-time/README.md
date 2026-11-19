# Furrows of Time

A first-person farming game in the browser. You start in the year 300 with bare hands on a field of 65,536 plots and farm your way through twelve ages to the year 3000.

## How it plays

- Walk into the grass. Your tool plows every plot it reaches. Pass again to sow, and come back when the crop is ripe to harvest it.
- Plowing and sowing pay nothing. Harvested crops go into your bag.
- When the bag is full, walk to one of the four red barns at the edges of the field and empty it. That is the only way to earn coins.
- Spend coins in the shop on six kinds of upgrade: tool reach, swing speed, walking speed, harvest value, growth speed and bag size.
- When you have enough coins, buy your way into the next age. Each age brings new crops, new tools and a new look.

## Ages

| Year | Age | New crops | New tool you can see |
|---|---|---|---|
| 300 | Antiquity | Wheat | Digging stick, iron sickle |
| 800 | Early Medieval | Barley | Ox and ard |
| 1200 | High Medieval | Cabbage | Heavy plough with two oxen |
| 1600 | Discovery | Potato, tomato | Horse plough |
| 1850 | Industrial | Cotton | Steam engine |
| 1940 | Machine Age | Corn | Tractor |
| 1990 | Agribusiness | Sunflower | Combine harvester |
| 2000 | Digital | Soybean | GPS tractor |
| 2026 | Smart Farming | Strawberry | Drone swarm |
| 2100 | Robot Age | Glow rice | Field robots |
| 2500 | Orbital | Moonberry | Hover harvester |
| 3000 | Star Age | Starbloom | Nanobot cloud |

A simulated player who never stops needs about 7 hours to reach 3000 and buy every upgrade. A real player takes longer.

## Controls

- **Phone:** left thumb walks, drag anywhere else to look. The Work button turns the tool on and off.
- **Computer:** W A S D to walk, drag with the mouse to look, Space turns work on and off, E empties the bag at a barn.

Progress is saved in your browser.

## Graphics

The field has real-time shadows from the sun, a sky with sun or moon and drifting clouds, distant hills, and grass, crops and trees that sway in the wind. The shop has a Graphics setting:

- **High:** sharp shadows and the densest grass. The default on computers.
- **Medium:** softer shadows and less grass. The default on phones.
- **Low:** no shadows and no grass, for slower phones.

## Running it

Open `index.html` in a current browser. It is a single file and loads three.js r128 from cdnjs, so it needs an internet connection.

To serve it locally:

```
npx serve .
```

## Code

- `src/logic.js`: game rules (field, crops, upgrades, ages, bag, saving), with no DOM or 3D code.
- `src/page.html`: the page, HUD, shop and 3D world (three.js), with a `/*LOGIC*/` marker where the rules go.
- `index.html`: the built game. Rebuild it after editing `src/` with `node tools/build.js`.
- `tools/tune.js`: sets the price of every age by simulating a player. Edit `TARGET` (minutes per age), then run `node tools/tune.js src/logic.js` and rebuild.
