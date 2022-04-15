import type { MP4Info } from './mp4box'
import { createFile } from 'mp4box'
import { openDB, DBSchema } from 'idb'
import { makeCallListener, registerListener } from 'osra'
import { remux } from '@banou26/oz-libav'

export type Chunk = {
  arrayBuffer: ArrayBuffer
  keyframeIndex: number
  startTime: number
  endTime: number
}

export type Video = {
  id: string
  filename?: string
  date: Date
  size: number
  chunkSize: number
}

interface VideoDB extends DBSchema {
  index: {
    key: IDBValidKey
    value: Video[]
    indexes: {
      id: IDBValidKey
    }
  }
  chunks: {
    key: IDBValidKey
    value: ArrayBuffer[]
  }
}

export const db =
  openDB<VideoDB>('fkn-media-player', 1, {
    upgrade(db) {
      db.createObjectStore('index', { keyPath: 'id' })
      db.createObjectStore('chunks')
    }
  })

const makeMp4Extracter = async (stream: ReadableStream<Uint8Array>) => {
  const reader = stream.getReader()
  const mp4boxfile = createFile()
  const chunks = []
  let processedBytes = 0

  mp4boxfile.onError = e => console.error('onError', e)
  mp4boxfile.onSamples = (id, user, samples) => {
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
      const lastSample = group.slice(-1)[0]

      if (chunks[firstSample.moof_number - 1]) continue

      const startTime = firstSample.cts / firstSample.timescale
      const _endTime = lastSample.cts / lastSample.timescale

      chunks[firstSample.moof_number - 1] = {
        firstSample,
        lastSample,
        keyframeIndex: firstSample.moof_number - 1,
        startTime,
        // Some files have faulty fragments that contain the same start/end timestamps
        // this allow the sourceBuffer.remove calls to not throw on incorrect ranges
        endTime:
          startTime === _endTime
            ? _endTime + 0.02
            : _endTime
      }
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
  let done = false
  const read = async () => {
    // const { value: arrayBuffer } = await reader.read()
    const { value: arrayBuffer, done } = await reader.read()
    // console.log('arrayBuffer', arrayBuffer)
    // if (i > 5) done = true
    if (done) {
      return
    }

    i++
    const buffer = arrayBuffer.buffer
    // const buffer = arrayBuffer.slice(0).buffer
    // @ts-ignore
    buffer.fileStart = processedBytes
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
  'REMUX': makeCallListener(async ({ id, size, stream: inStream }: { id: string, size: number, stream: ReadableStream<Uint8Array> }, extra) => {
    const { stream, info } = await remux({ size, stream: inStream, autoStart: true })
    // const reader = stream.getReader()
    const { mime, info: mp4info } = await makeMp4Extracter(stream)

    return { mime, info, mp4info }
  })
}

export type Resolvers = typeof resolvers

registerListener({ target: globalThis, resolvers })

