'use strict'

const fs = require('fs')
const toJSON = require('xml-js').xml2json
const map = require('through2-map').obj
const split = require('split')
const ndjson = require('ndjson')
const pick = require('lodash/pick')

const stream = () => map(x => x)

const parseJourney = (outputStream) => (j) => {
	const rid = j.attributes.rid
	const uid = j.attributes.uid
	const vehicle = j.attributes.trainId

	if (j.name === 'Journey') {
		for (let stop of j.elements) {
			const result = pick(stop.attributes, ['tpl', 'wta', 'wtd', 'wtp'])
			result.rid = rid
			result.uid = uid
			result.vehicle = vehicle
			outputStream.write(JSON.parse(JSON.stringify(result)))
		}
	}

	return null
}

const convert = (outputStream) => (c) => {
	let timetable = null
	try {
		timetable = JSON.parse(toJSON(c)).elements[0]
	} catch (e) {
		console.error(e)
	}

	if (timetable) for (let journey of timetable.elements) parseJourney(outputStream)(journey)

	return null
}


const main = () => {
	const outputStream = stream()

	const xmlStream = fs.createReadStream('./mergedSchedules.list')
		.pipe(split())
		.pipe(map(convert(outputStream)))

	return outputStream
}

main()
.pipe(ndjson.stringify())
.pipe(process.stdout)
