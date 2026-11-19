# Leonida Field Guide — GTA VI Trophy Guide & Tracker

An unofficial, offline web app that guides and tracks all **55 PlayStation 5
trophies** of Grand Theft Auto VI: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze,
27 hidden on PlayStation until earned, about 200 hours to the platinum.

## What it is

A "do-this-first" field guide, not a flat list. It opens on a time-ordered
platinum roadmap — Chapter 1 → Finale → Post-story — with the single
missable trophy pinned at the top, then a checklist below it.

- **Roadmap first.** Six stages in the order to play them: save discipline,
  Chapter 1 first, the story chapters, Chapter 2+ partners and strangers,
  free-roam clean-up, post-story 100%.
- **The one missable, impossible to miss.** *Positive Mental Attitude*
  (meditate at 18 spots in 10 locations) is pinned at the top with a
  save-warning: Lucia's balcony meditation only exists in Chapter 1, and
  there is no mission replay.
- **Tracker.** Tick trophies off; progress is saved in the browser
  (localStorage) and can be exported to a file and imported back.
- **Filters.** By kind (story, missable, collectibles, activities, heists,
  cars, hidden), by grade, by search text, and hide-earned.
- **Spoiler mode, on by default.** Story trophies stay hidden — name,
  description and guide — until you earn them.
- **A cited guide for every trophy.** Each trophy's guide is written in our
  own words and names its sources beside it (GamesRadar+ via gtasix.how,
  PC Gamer, PowerPyx, GTABase, PlayStation / Exophase via Push Square,
  Press Start, outputlag, HarryNinetyFour). Three riddle trophies
  (Let's Go Bowling, Personal Best, Bad Luck I Guess) are flagged
  **Method unconfirmed** — the guide says what the hint points at and never
  invents a method.

## Use it offline

Serve `app/` with any static server and open `app/index.html` in desktop
Chrome. It loads nothing from the network: every file it needs is under
`app/`, and it works with the network off.

```sh
cd app && python3 -m http.server 8080
```

## Handing it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to `/output` and writes `/output/dossier.json` with the vendored
`vendor/makefun-frontend.ts` library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

Trophy names, descriptions and grades are shown as PlayStation publishes
them. Guides are original writing that cites GamesRadar+, PC Gamer,
PowerPyx, GTABase, PlayStation / Exophase via Push Square, Press Start,
outputlag and HarryNinetyFour beside each trophy. No Rockstar logo,
official artwork or game screenshots are used anywhere.

## License

MIT — see `LICENSE`.
