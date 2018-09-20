'use strict'

const pify = require('pify')
const level = require('level')
const tmp = require('tmp')
const fs = require('fs')
const map = require('through2-map').obj
const ndjson = require('ndjson')
const pick = require('lodash/pick')
const merge = require('lodash/merge')
const sortBy = require('lodash/sortBy')
const s2p = require('stream-to-promise')

const stream = () => map(x => x)

tmp.setGracefulCleanup() // clean up even on errors

const pTmpDir = pify(tmp.dir)
const pLevel = pify(level)

const save = (db) => async (d) => {
	const key = d.rid
	let val
	try { val = await db.get(key) }
	catch(e) { val = [] }
	val.push(d)
	await db.put(key, val)
	return null
}

const transformRow = outputStream => cache => {
	let schedule = cache.find(e => !e.informationDate)
	if (schedule) {
		const delays = cache.filter(e => e.informationDate)
		const sortedDelays = sortBy(delays, d => +new Date(d.informationDate))

		for (let delay of sortedDelays) schedule = merge(schedule, delay)
		outputStream.write(schedule)
	}

	return null
}

const main = async () => {
	const outputStream = stream()

	const dir = await pTmpDir({prefix: 'sort-streams-'})
	const db = await pLevel(dir, {valueEncoding: 'json'})

	const inputStream = fs.createReadStream('./may-23/combined.ndjson').pipe(ndjson.parse())
	inputStream.on('data', d => save(db)(d))

	await s2p(inputStream)

	db.createValueStream().pipe(map(transformRow(outputStream)))
	return outputStream
}

main().then(res => res.pipe(ndjson.stringify()).pipe(process.stdout)).catch(console.error)
