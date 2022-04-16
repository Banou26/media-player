import type { Chunk } from './worker'

// todo: reimplement this into a ReadableByteStream https://web.dev/streams/ once FF gets support
export const bufferStream = ({ stream, size: SIZE }: { stream: ReadableStream, size: number }) =>
  new ReadableStream({
    start() {
      this.reader = stream.getReader()
    },
    async pull(controller) {
      const { leftOverData }: { leftOverData: Uint8Array | undefined } = this

      const accumulate = async ({ buffer = new Uint8Array(SIZE), currentSize = 0 } = {}): Promise<{ buffer?: Uint8Array, currentSize?: number, done: boolean }> => {
        const { value: newBuffer, done } = await this.reader.read()
  
        if (currentSize === 0 && leftOverData) {
          buffer.set(leftOverData)
          currentSize += leftOverData.byteLength
          this.leftOverData = undefined
        }
  
        if (done) {
          return { buffer: buffer.slice(0, currentSize), currentSize, done }
        }
  
        let newSize
        const slicedBuffer = newBuffer.slice(0, SIZE - currentSize)
        newSize = currentSize + slicedBuffer.byteLength
        buffer.set(slicedBuffer, currentSize)
  
        if (newSize === SIZE) {
          this.leftOverData = newBuffer.slice(SIZE - currentSize)
          return { buffer, currentSize: newSize, done: false }
        }
        
        return accumulate({ buffer, currentSize: newSize })
      }
      const { buffer, done } = await accumulate()
      if (buffer?.byteLength) controller.enqueue(buffer)
      if (done) controller.close()
    }
  })

const getTimeRanges = (sourceBuffer: SourceBuffer) =>
  Array(sourceBuffer.buffered.length)
    .fill(undefined)
    .map((_, index) => ({
      index,
      start: sourceBuffer.buffered.start(index),
      end: sourceBuffer.buffered.end(index)
    }))

const getTimeRange =
  (sourceBuffer: SourceBuffer) =>
    (time: number) =>
      getTimeRanges(sourceBuffer)
        .find(({ start, end }) => time >= start && time <= end)

const listenForOperationResult =
  (sourceBuffer: SourceBuffer) =>
    (func: () => void) =>
      new Promise((resolve, reject) => {
        const updateEnd = ev => {
          unregisterListeners()
          resolve(ev)
        }
        const abort = ev => {
          unregisterListeners()
          reject(ev)
        }
        const error = (ev) => {
          unregisterListeners()
          reject(ev)
        }
        const unregisterListeners = () => {
          sourceBuffer.removeEventListener('updateend', updateEnd)
          sourceBuffer.removeEventListener('abort', abort)
          sourceBuffer.removeEventListener('error', error)
        }
        sourceBuffer.addEventListener('updateend', updateEnd)
        sourceBuffer.addEventListener('abort', abort)
        sourceBuffer.addEventListener('error', error)
        func()
      })

export const appendBuffer =
  (sourceBuffer: SourceBuffer) =>
    (buffer: ArrayBuffer) =>
      listenForOperationResult(sourceBuffer)(() => {
        sourceBuffer.appendBuffer(buffer)
      })

export const removeRange =
  (sourceBuffer: SourceBuffer) =>
    ({ start, end, index }: { start: number, end: number, index: number }) =>
      listenForOperationResult(sourceBuffer)(() => {
        sourceBuffer.remove(
          Math.max(sourceBuffer.buffered.start(index), start),
          Math.min(sourceBuffer.buffered.end(index), end)
        )
      })

export const abort =
  (sourceBuffer: SourceBuffer) =>
    listenForOperationResult(sourceBuffer)(() => {
      sourceBuffer.abort()
    })

export const appendChunk =
  (sourceBuffer: SourceBuffer) =>
    async (chunk: Chunk) => {
      await appendBuffer(sourceBuffer)(chunk.arrayBuffer.buffer)
    }

export const removeChunk =
  (sourceBuffer: SourceBuffer) =>
    async (chunk: Chunk) => {
      if (chunk.keyframeIndex < 0) return console.log('skipped remove', chunk)
      const range = getTimeRange(sourceBuffer)(chunk.startTime) ?? getTimeRange(sourceBuffer)(chunk.endTime)
      if (!range) throw new RangeError('No TimeRange found with this chunk')
      await removeRange(sourceBuffer)({ start: chunk.startTime, end: chunk.endTime, index: range.index })
    }

const PRE_SEEK_NEEDED_BUFFERS_IN_SECONDS = 15
const POST_SEEK_NEEDED_BUFFERS_IN_SECONDS = 30

export const updateSourceBuffer =
  (sourceBuffer: SourceBuffer, getChunkArrayBuffer: (id: number) => Promise<Uint8Array | undefined>) => {
    const cache: Map<number, Uint8Array | Promise<Uint8Array | undefined>> = new Map()
    const bufferedChunksMap: Map<number, Uint8Array> = new Map()
    let renderCount = 0

    return async ({ currentTime, chunks }: { currentTime: number, chunks: Chunk[] }) => {
      const currentRenderCount = renderCount
      renderCount++

      const neededChunks =
        [
          // header chunk
          { keyframeIndex: 0, startTime: 0, endTime: 0 },
          ...chunks
            .filter(({ startTime, endTime }) =>
              currentTime - PRE_SEEK_NEEDED_BUFFERS_IN_SECONDS < startTime
              && currentTime + POST_SEEK_NEEDED_BUFFERS_IN_SECONDS > endTime
            )
        ]

      // todo: improve perf by making this loop inclusive of bufferedChunksMap instead of chunks
      const shouldUnbufferChunks =
        chunks
          .filter(chunk => !neededChunks.includes(chunk))

      for (const chunk of shouldUnbufferChunks) {
        if (cache.has(chunk.keyframeIndex)) cache.delete(chunk.keyframeIndex)
      }

      if (sourceBuffer.updating) await abort(sourceBuffer)
      for (const chunk of shouldUnbufferChunks) {
        if (!bufferedChunksMap.has(chunk.keyframeIndex)) continue
        try {
          await removeChunk(sourceBuffer)(chunk)
          bufferedChunksMap.delete(chunk.keyframeIndex)
        } catch (err) {
          if (err.message === 'No TimeRange found with this chunk') {
            bufferedChunksMap.delete(chunk.keyframeIndex)
          }
          if (err.message !== 'No TimeRange found with this chunk') throw err
        }
      }
      const bufferedOutOfRangeRanges =
        getTimeRanges(sourceBuffer)
          .filter(({ start, end }) =>
              currentTime - PRE_SEEK_NEEDED_BUFFERS_IN_SECONDS > start && currentTime - PRE_SEEK_NEEDED_BUFFERS_IN_SECONDS > end ||
              currentTime + POST_SEEK_NEEDED_BUFFERS_IN_SECONDS < start && currentTime + POST_SEEK_NEEDED_BUFFERS_IN_SECONDS < end
            )
      for (const range of bufferedOutOfRangeRanges) {
        await removeRange(sourceBuffer)(range)
      }
      for (const chunk of neededChunks) {
        // console.log('chunk', chunk, neededChunks, bufferedChunksMap.has(chunk.keyframeIndex), chunk.keyframeIndex + 1 === chunks.length)
        if (bufferedChunksMap.has(chunk.keyframeIndex) || chunk.keyframeIndex + 1 === chunks.length) continue
        // console.log('check PASSED', chunk, neededChunks)
        try {
          const cachedBuffer = cache.get(chunk.keyframeIndex)
          if (!cachedBuffer) {
            const fetchBuffer =
              getChunkArrayBuffer(chunk.keyframeIndex)
                .then(arrayBuffer => {
                  if (arrayBuffer) cache.set(chunk.keyframeIndex, arrayBuffer)
                  return arrayBuffer
                })
            cache.set(chunk.keyframeIndex, fetchBuffer)
          }
          const buffer = await cache.get(chunk.keyframeIndex)
          if (renderCount !== currentRenderCount + 1) return
          if (!buffer) continue
          const _chunk = { ...chunk, arrayBuffer: buffer }
          await appendChunk(sourceBuffer)(_chunk).catch(err => {
            bufferedChunksMap.delete(chunk.keyframeIndex)
            throw err
          })
          bufferedChunksMap.set(chunk.keyframeIndex, buffer)
        } catch (err) {
          if (!(err instanceof Event)) throw err
          // if (err.message !== 'Failed to execute \'appendBuffer\' on \'SourceBuffer\': This SourceBuffer is still processing an \'appendBuffer\' or \'remove\' operation.') throw err
          break
        }
      }
    }
  }
