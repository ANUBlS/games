# Furrows of Time

A first-person farming game in the browser. You start in the year 300 with bare hands on a field of 65,536 plots and farm your way through twelve ages to the year 3000.

## How it plays

- Walk into the grass. Your tool plows every plot it reaches. Pass again to sow, and come back when the crop is ripe to harvest it.
- The mode bar above the Work button picks what your tool does: **All** does whichever step each plot needs, while **Plow**, **Sow** and **Harvest** do only that one step. Plow also plows growing and ripe crops back under, and those crops are lost.
- Plowing and sowing pay nothing. Harvested crops go into your bag.
- When the bag is full, walk to one of the four red barns at the edges of the field and empty it. That is the only way to earn coins.
- Spend coins in the shop on upgrades: tool reach, swing speed, walking speed, harvest value, growth speed, bag size and rock tools.
- About 1,070 rocks lie in clusters across the field: stones, rocks, big rocks and boulders. Nothing can be sown on a rock. To clear one, switch to Plow mode with a rock tool strong enough for its size; each rock costs coins to remove. Rock tools run from a crowbar in 300 to a matter dissolver in 3000, with a new one and a new price in every age, and later tools make each rock cheaper to clear.
- When you have enough coins, buy your way into the next age. Each age brings new crops, new tools and a new look.
- Some ages also set work you must finish during that age before you can leave it: plots plowed, and set amounts of particular crops harvested. The age panel counts finished tasks, and the shop shows each one with a progress bar.

| Leaving | Also needed |
|---|---|
| 800 | plow 2,000 plots, harvest 2,000 barley |
| 1200 | harvest 5,000 cabbage and 1,000 barley |
| 1600 | plow 12,000 plots, harvest 3,000 potato and 8,000 tomato |
| 1850 | harvest 20,000 cotton |
| 1990 | plow 70,000 plots, harvest 60,000 sunflower and 10,000 corn |
| 2000 | harvest 100,000 soybean |
| 2026 | plow 150,000 plots, harvest 150,000 strawberry |
| 2500 | plow 300,000 plots, harvest 300,000 moonberry and 20,000 glow rice |

The other ages (300, 1940 and 2100) only ask for coins.

## Seasons and weather

- The year turns through spring, summer, autumn and winter, 4 minutes each. Every crop can only be sown in certain seasons (wheat in spring, autumn or winter, tomato and cotton only in summer). In winter, crops that are not winter-hardy stop growing until spring. The seeds list greys out what cannot be sown now.
- Weather changes every minute or so. Rain makes crops grow 1.5 times faster, but now and then washes away a small patch. A storm marks an area with an orange ring, and 18 seconds later floods it, washing away every crop there. Winter brings snow, which covers the land.
- Autumn turns the trees orange, and snow turns the field white.

## Fertilizer

From 1850 on, many crops need fertilizer to sow: cotton and corn 1 unit per plot, sunflower and strawberry 2, moonberry 3. Soybean needs none. Buy fertilizer in the shop; its price follows the age you are in.

## Farm location

When you start, pick where your farm is: America, Russia, Azerbaijan, China, India, Brazil, France or Egypt. Each pays more for the crops it is known for (corn in America, wheat in Russia, cotton in Azerbaijan and Egypt, and so on). You can move later, for a fee.

## Gold

About one rock in thirty holds a gold nugget. Which rocks is hidden until you clear them, and a nugget pays far more than clearing the rock costs.

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
- **Computer:** W A S D to walk, drag with the mouse to look, Space turns work on and off, E empties the bag at a barn, 1 to 4 pick All, Plow, Sow or Harvest.

Progress is saved in your browser.

## Sound

Plowing, sowing, harvesting, clearing rocks, emptying the bag and entering a new age each have their own sound. Music is generated as you play in four styles: Lute, Pipes, Piano and Synth. **Match the age** moves from lute in antiquity to synth in the future. Both are set at the bottom of the shop. Sound starts after your first tap or key press.

## Graphics

The farm is drawn like a haystack game: big haystacks built from thousands of separate straws stand by the barns and around the farm, loose straw lies on plowed soil, straw flies up when you harvest or plow, and dust drifts in the sunlight. The field also has real-time shadows from the sun, a sky with sun or moon and drifting clouds, distant hills, and grass, crops and trees that sway in the wind. The shop has a Graphics setting:

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
