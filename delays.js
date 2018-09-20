'use strict'

const fs = require('fs')
const toJSON = require('xml-js').xml2json
const map = require('through2-map').obj
const split = require('split')
const ndjson = require('ndjson')
const pick = require('lodash/pick')

const stream = () => map(x => x)

const parseElement = (date, rid, uid, lateReason) => (e) => {
	const result = pick(e.attributes, ['tpl', 'wta', 'wtd', 'wtp'])
	result.rid = rid
	result.uid = uid
	result.informationDate = date
	result.lateReason = lateReason

	if (e.elements) {
		for (let element of e.elements) {
			if (element.attributes && element.attributes.et) {
				if (element.name === 'ns3:arr') result.wta = element.attributes.et
				if (element.name === 'ns3:dep') result.wtd = element.attributes.et
				if (element.name === 'ns3:pass') result.wtp = element.attributes.et
			}
		}
	}

	return result
}

const convert = (outputStream) => (c) => {
	let el = null
	try {
		el = JSON.parse(toJSON(c))
	} catch (e) {
		console.error(e)
	}

	if (el) {
		let train = null
		let pport = null
		try {
			pport = el.elements[0]
			train = pport.elements[0].elements[0]
		} catch (e) {
			console.error(e)
		}

		if (pport && train) {
			const date = pport.attributes.ts
			const rid = train.attributes.rid
			const uid = train.attributes.uid

			let lateReason = null

			for (let element of train.elements) {
				if (element.name === 'ns3:LateReason') lateReason = element.elements.find(x => x.type === 'text').text
				if (element.name === 'ns3:Location') outputStream.write(parseElement(date, rid, uid, lateReason)(element))
			}
		}
	}

	return null
}


const main = () => {
	const outputStream = stream()

	const xmlStream = fs.createReadStream('./mergedDelays.list')
		.pipe(split())
		.pipe(map(convert(outputStream)))
		.pipe(ndjson.stringify())

	return outputStream
}

main()
.pipe(ndjson.stringify())
.pipe(process.stdout)

