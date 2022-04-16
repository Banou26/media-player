import type { MP4Info } from './mp4box'
import { createFile } from 'mp4box'
import { openDB, DBSchema } from 'idb'
import { makeCallListener, registerListener } from 'osra'
import { remux } from '@banou26/oz-libav'

export type Chunk = {
  // arrayBuffer: Uint8Array // ArrayBuffer
  keyframeIndex: number
  startTime: number
  endTime: number
}

export type Video = {
  id: string
  filename?: string
  date: Date
  size: number
  chunks: Chunk[]
  done?: boolean
}

export interface VideoDB extends DBSchema {
  index: {
    key: IDBValidKey
    value: Video
    indexes: {
      id: IDBValidKey
    }
  }
  chunks: {
    key: IDBValidKey
    value: ArrayBuffer
  }
}

export const db =
  openDB<VideoDB>('fkn-media-player', 1, {
    upgrade(db) {
      db.createObjectStore('index', { keyPath: 'id' })
      db.createObjectStore('chunks')
    }
  })

const makeMp4Extracter = async ({ id, stream, size, newChunk }: { id: string, stream: ReadableStream<Uint8Array>, size: number, newChunk: (chunk: Chunk) => void }) => {
  const date = new Date()
  const reader = stream.getReader()
  const mp4boxfile = createFile()
  let chunks: Chunk[] = []
  let processedBytes = 0
  let done = false

  mp4boxfile.onError = e => console.error('onError', e)
  mp4boxfile.onSamples = async (_id, user, samples) => {
    // console.log('onSamples', id, user, samples)
    const groupBy = (xs, key) => {
      return xs.reduce((rv, x) => {
        (rv[x[key]] = rv[x[key]] || []).push(x)
        return rv
      }, []).filter(Boolean)
    }
    const groupedSamples = groupBy(samples, 'moof_number')
    for (const group of groupedSamples) {
      const firstSample = group[0]
      const lastSample = group.at(-1)
      if (chunks[firstSample.moof_number - 1]) continue

      const startTime = firstSample.cts / firstSample.timescale
      const _endTime = lastSample.cts / lastSample.timescale

      const chunk = {
        // firstSample,
        // lastSample,
        keyframeIndex: firstSample.moof_number,
        startTime,
        // Some files have faulty fragments that contain the same start/end timestamps
        // this allow the sourceBuffer.remove calls to not throw on incorrect ranges
        endTime:
          startTime === _endTime
            ? _endTime + 0.02
            : _endTime
      }

      chunks[firstSample.moof_number - 1] = chunk
      await (await db).put('index', { id, date, size, chunks, done })
      newChunk(chunk)
      // needed for mp4box to not keep a reference to the arrayBuffers creating a memory leak
      mp4boxfile.releaseUsedSamples(1, lastSample.number)
    }
  }

  const info = new Promise<{ mime: string, info: MP4Info }>(resolve => {
    mp4boxfile.onReady = (_info) => {
      let mime = 'video/mp4; codecs=\"'
      let info
      console.log('mp4box ready info', _info)
      info = _info
      for (let i = 0; i < info.tracks.length; i++) {
        if (i !== 0) mime += ','
        mime += info.tracks[i].codec
      }
      mime += '\"'
      mp4boxfile.setExtractionOptions(1, undefined, { nbSamples: 1000 })
      mp4boxfile.start()
      resolve({ mime, info })
    }
  })

  let first = false
  let i = 0
  const read = async () => {
    // const { value: arrayBuffer } = await reader.read()
    const { value: arrayBuffer, done: _done } = await reader.read()
    // console.log('arrayBuffer', arrayBuffer)
    // if (i > 5) done = true
    if (_done) {
      done = true
      // chunks = []
      // console.log('SLICED', chunks)
      await (await db).put('index', { id, date, size, chunks, done: true })
      return
    }

    const buffer = arrayBuffer.buffer
    // const buffer = arrayBuffer.slice(0).buffer
    // @ts-ignore
    buffer.fileStart = processedBytes
    ;(await db).put('chunks', arrayBuffer, `${id}-${i}`)
    i++
    // else {
    //   ;(await db).put('chunks', arrayBuffer, `${id}-${i}`)
    // }
    mp4boxfile.appendBuffer(buffer)
    // resultBuffer.set(arrayBuffer, processedBytes)
    processedBytes += arrayBuffer.byteLength
    if (!first) {
      first = true
      return read()
    }
    read()
  }

  await read()

  return info
}

const resolvers = {
  'REMUX': makeCallListener(async ({ id, size, stream: inStream, newChunk }: { id: string, size: number, stream: ReadableStream<Uint8Array>, newChunk: (chunk: Chunk) => void }, extra) => {
    const { stream, info } = await remux({ size, stream: inStream, autoStart: true })
    // const reader = stream.getReader()
    const { mime, info: mp4info } = await makeMp4Extracter({ id, stream, size, newChunk })
    return {
      mime,
      info,
      mp4info
    }
  })
}

export type Resolvers = typeof resolvers

registerListener({ target: globalThis, resolvers })

