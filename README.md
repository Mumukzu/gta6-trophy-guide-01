[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Mumukzu/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Mumukzu/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Trophy Atlas — GTA VI Trophy Guide & Tracker

An offline web app that is the best guide and tracker for the 55 PlayStation 5
trophies of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver and 46 bronze,
28 of them hidden on PlayStation until earned.

## What it does

- **Every trophy, with its official name, description and grade**, plus a guide
  in our own words that cites its sources — what to do, where and how, and
  when it can be missed. No guide text is copied from another site.
- **A tracker**: tick a trophy off and it stays ticked (saved in the browser),
  export your progress to a file and import it back.
- **Filters** by grade and by kind (story, missable, collectibles, activities,
  meta), plus search.
- **A spoiler setting** that hides the names, descriptions and guides of the
  28 hidden trophies until you earn them.
- **A roadmap to the platinum** in 5 stages, and a flag on the one trophy
  that can be missed (Positive Mental Attitude — meditate at Lucia's balcony
  in Chapter 1 before it disappears).

## Run it

Serve `app/` with any static server and open `app/index.html` in a desktop
browser. It works with the network off — it loads nothing from the network.

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library.

## Sources

The trophy names, descriptions, grades and hidden flags come from the official
list as Exophase and PSNProfiles published it. The how-to details come from
Planet GTA 6, Output Lag, KeenGamer, EGamers, GTA Vice City Hub, U7BUY, Of Zen
and Computing and GTA Vibes — each guide names its source beside it. All
guides are written in our own words; the sources are cited, never copied.
