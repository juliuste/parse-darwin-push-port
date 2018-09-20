'use strict'

const fs = require('fs')
const map = require('through2-map').obj
const filter = require('through2-filter').obj
const ndjson = require('ndjson')
const toPromise = require('stream-to-promise')
const merge = require('lodash/merge')
const countBy = require('lodash/countBy')
const sortBy = require('lodash/sortBy')
const groupBy = require('lodash/groupBy')
const toArray = require('lodash/toArray')
const round = require('lodash/round')
const moment = require('moment-timezone')

const codeMap = {
	"106": "line", // This train has been delayed by a landslip
	"107": "line", // This train has been delayed by a line-side fire
	"124": "line", // This train has been delayed by a vehicle striking a bridge
	"125": "line", // This train has been delayed by a vehicle striking a bridge earlier
	"128": "line", // This train has been delayed by an earlier landslip
	"129": "line", // This train has been delayed by an earlier line-side fire
	"138": "line", // This train has been delayed by an obstruction on the line
	"139": "line", // This train has been delayed by an obstruction on the line earlier
	"143": "line", // This train has been delayed by animals on the line
	"144": "line", // This train has been delayed by animals on the line earlier
	"148": "line", // This train has been delayed by earlier electrical supply problems
	"151": "line", // This train has been delayed by earlier overhead wire problems
	"155": "line", // This train has been delayed by electrical supply problems
	"169": "line", // This train has been delayed by overhead wire problems
	"173": "line", // This train has been delayed by poor rail conditions
	"174": "line", // This train has been delayed by poor rail conditions earlier
	"115": "line", // This train has been delayed by a problem near the railway
	"117": "line", // This train has been delayed by a problem with line side equipment
	"132": "line", // This train has been delayed by an earlier problem near the railway
	"134": "line", // This train has been delayed by an earlier problem with line side equipment
	"116": "line", // This train has been delayed by a problem with a river bridge
	"133": "line", // This train has been delayed by an earlier problem with a river bridge
	"126": "general", // This train has been delayed by an earlier broken down train
	"136": "general", // This train has been delayed by an earlier train fault
	"114": "general", // This train has been delayed by a problem currently under investigation
	"149": "general", // This train has been delayed by earlier emergency engineering works
	"152": "general", // This train has been delayed by earlier over-running engineering works
	"156": "general", // This train has been delayed by emergency engineering works
	"170": "general", // This train has been delayed by over-running engineering works
	"187": "general", // This train has been delayed by engineering works
	"130": "general", // This train has been delayed by an earlier operating incident
	"140": "general", // This train has been delayed by an operating incident
	"145": "general", // This train has been delayed by congestion caused by earlier delays
	"141": "general", // This train has been delayed by an unusually large passenger flow
	"142": "general", // This train has been delayed by an unusually large passenger flow earlier
	"182": "general", // This train has been delayed by speed restrictions having been imposed
	"101": "train", // This train has been delayed by a delay on a previous journey
	"177": "train", // This train has been delayed by safety checks being made
	"178": "train", // This train has been delayed by safety checks having been made earlier
	"108": "train", // This train has been delayed by a member of train crew being unavailable
	"121": "train", // This train has been delayed by a train late from the depot
	"122": "train", // This train has been delayed by a train late from the depot earlier
	"183": "train", // This train has been delayed by train crew having been unavailable earlier
	"185": "train", // This train has been delayed by waiting earlier for a train crew member
	"186": "train", // This train has been delayed by waiting for a train crew member
	"109": "train", // This train has been delayed by a passenger being taken ill
	"110": "train", // This train has been delayed by a passenger having been taken ill earlier
	"146": "train", // This train has been delayed by disruptive passengers
	"147": "train", // This train has been delayed by disruptive passengers earlier
	"171": "train", // This train has been delayed by passengers transferring between trains
	"172": "train", // This train has been delayed by passengers transferring between trains earlier
	"111": "train", // This train has been delayed by a person hit by a train
	"112": "train", // This train has been delayed by a person hit by a train earlier
	"100": "train", // This train has been delayed by a broken down train
	"120": "train", // This train has been delayed by a train fault
	"113": "levelcrossing", // This train has been delayed by a problem at a level crossing
	"131": "levelcrossing", // This train has been delayed by an earlier problem at a level crossing
	"153": "signalling", // This train has been delayed by earlier signalling problems
	"179": "signalling", // This train has been delayed by signalling problems
	"161": "weather", // This train has been delayed by flooding
	"162": "weather", // This train has been delayed by flooding earlier
	"163": "weather", // This train has been delayed by fog
	"164": "weather", // This train has been delayed by fog earlier
	"165": "weather", // This train has been delayed by high winds
	"166": "weather", // This train has been delayed by high winds earlier
	"168": "weather", // This train has been delayed by lightning having damaged equipment
	"175": "weather", // This train has been delayed by poor weather conditions
	"176": "weather" // This train has been delayed by poor weather conditions earlier
}


const parseDate = (rid, time) => {
	const day = rid.substr(0, 10)
	if (time.length === 8) time = time.substr(0, 5)
	return moment.tz(rid+' '+time, 'YYYYMMDD HH:mm', 'Europe/London').toDate()
}

const main = async () => {
	let stations = await toPromise(fs.createReadStream('./full.ndjson').pipe(ndjson.parse()))
	stations = stations.filter(s => s.wtd || s.wtp || s.wta)
	stations.forEach(s => {
		s.lateReason = codeMap[s.lateReason]
		s.date = parseDate(s.rid, s.wtd || s.wtp || s.wta)
	})

	// stations = stations.filter(s => s.lateReason)
	// const codes = countBy(stations, 'lateReason')
	// const sortedCodes = sortBy(Object.keys(codes), c => -1*codes[c])
	// for (let c of sortedCodes) console.log(`${c}: ${codes[c]} (${round(codes[c]*100/stations.length, 1)} %)`)

	// // COUNTING LOGIC
	// const byStations = toArray(groupBy(stations, 'tpl')).filter(x => x.length >= 10)

	// const sortedStations = sortBy(byStations, s => 1-(s.filter(x => x.lateReason).length)/s.length)
	// let i = 0
	// for (let s of sortedStations) {
	// 	if (i <= 50) {
	// 		const reasonCode = sortBy(toArray(groupBy(s.filter(x => x.lateReason), 'lateReason')), x => -1*x.length)[0][0].lateReason
	// 		console.log(`${s[0].tpl}: ${(s.filter(x => x.lateReason).length)}, ${s.length}, ${round(100*(s.filter(x => x.lateReason).length)/s.length, 1)} %, ${reasonCode}`)
	// 	}
	// 	i++
	// }
	// console.log(sortedStations.filter(s => s.filter(x => x.lateReason).length > 10).length)
	// console.log(sortedStations.length)

	// const liverpool = stations.filter(x => x.tpl === 'SHIP')
	// // let delayed = liverpool.filter(x => x.lateReason)
	// let delayed = liverpool
	// // delayed = delayed.filter(x => moment.tz(x.date, 'Europe/London').format('YYYY-MM-DD') === '2018-05-16')

	// const sortedByTime = sortBy(delayed, x => +x.date)

	// // process.stdout.write(JSON.stringify(sortedByTime))
	// console.log(sortedByTime)

}

main()
