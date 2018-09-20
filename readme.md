# parse-darwin-push-port

Parse [Darwin Push Port](https://wiki.openraildata.com/index.php/Darwin:Push_Port) datasets into duplicate-free [ndjson](http://ndjson.org). Written at [HackTrain at InnoTrans 2018](https://www.eventbrite.com/e/hacktrain-hackathon-powered-by-innotrans-tickets-43135838454). *Work in progress, only collecting delay information so far.*

[![license](https://img.shields.io/github/license/juliuste/parse-darwin-push-port.svg?style=flat)](license)
[![chat on gitter](https://badges.gitter.im/juliuste.svg)](https://gitter.im/juliuste)

## Installation

In order to run this project, you'll need to have [`node.js` 8 or later installed](https://nodejs.org/en/download/package-manager/). Please note that you might encounter issues running these scripts on Mac OS since its `grep` and `xargs` tools doesn't support all required features. Please use `ggrep` (GNU grep) etc. instead.

```sh
git clone https://github.com/juliuste/parse-darwin-push-port
cd parse-darwin-push-port

npm run [script]
```

## Usage

**Fails right now because of a minor error in a bashscript, will be fixed later. Generally completed, though.**

All provided scripts need to be run in a directory containing at least one `[…].v8.xml.gz`, one `[…].ref_v3.xml.gz` and multiple `pPortData.log.[…]` files per date (multiple dates in the same directory are supported as well).

### `npm run merge`

Merges all delay and schedule files into one `mergedDelays.list` and one `mergedSchedules.list`.

### `npm run delays`

Parses `mergedDelays.list` into `delays.ndjson`.

### `npm run schedules`

Parses `mergedSchedules.list` into `schedules.ndjson`.

### `npm run combine`

Combines, sorts and uniqs `delays.ndjson` and `schedules.ndjson` into `full.ndjson`.

### `npm run full`

Runs the above scripts combined.

### `npm run full`

Shows basic stats about `full.ndjson`.


## Contributing

If you found a bug or want to propose a feature, feel free to visit [the issues page](https://github.com/juliuste/parse-darwin-push-port/issues).
