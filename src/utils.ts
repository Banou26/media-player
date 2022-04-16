import { Chunk } from './worker'

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
    let bufferedChunks: number[] = []

    return async ({ currentTime, chunks }: { currentTime: number, chunks: Chunk[] }) => {
      const neededChunks =
        chunks
          .filter(({ startTime, endTime }) =>
            currentTime - PRE_SEEK_NEEDED_BUFFERS_IN_SECONDS < startTime
            && currentTime + POST_SEEK_NEEDED_BUFFERS_IN_SECONDS > endTime
          )
  
      const shouldUnbufferChunks =
        chunks
          .filter(chunk => !neededChunks.includes(chunk))
  
      // console.log('bufferedRanges', getTimeRanges())

      if (sourceBuffer.updating) await abort(sourceBuffer)
      for (const chunk of shouldUnbufferChunks) {
        if (!bufferedChunks.includes(chunk.keyframeIndex)) continue
        // if (!chunk.buffered) continue
        try {
          await removeChunk(sourceBuffer)(chunk)
        } catch (err) {
          if (err.message === 'No TimeRange found with this chunk') {
            bufferedChunks = bufferedChunks.filter(index => index !== chunk.keyframeIndex)
            // chunk.buffered = false
          }
          if (err.message !== 'No TimeRange found with this chunk') throw err
        }
      }
      const bufferedRanges =
        getTimeRanges(sourceBuffer)
          .filter(({ start, end }) =>
              currentTime - PRE_SEEK_NEEDED_BUFFERS_IN_SECONDS > start && currentTime - PRE_SEEK_NEEDED_BUFFERS_IN_SECONDS > end ||
              currentTime + POST_SEEK_NEEDED_BUFFERS_IN_SECONDS < start && currentTime + POST_SEEK_NEEDED_BUFFERS_IN_SECONDS < end
            )
      for (const range of bufferedRanges) {
        await removeRange(sourceBuffer)(range)
      }
      for (const chunk of neededChunks) {
        if (
          bufferedChunks.includes(chunk.keyframeIndex)
          // chunk.buffered
          || (
            // processedBytes !== fileSize
            // &&
            chunk.keyframeIndex + 1 === chunks.length
          )
        ) continue
        try {
          const buffer = await getChunkArrayBuffer(chunk.keyframeIndex)
          if (!buffer) continue
          const _chunk = { ...chunk, arrayBuffer: buffer }
          await appendChunk(sourceBuffer)(_chunk)
          bufferedChunks = [...bufferedChunks, chunk.keyframeIndex]
        } catch (err) {
          if (!(err instanceof Event)) throw err
          // if (err.message !== 'Failed to execute \'appendBuffer\' on \'SourceBuffer\': This SourceBuffer is still processing an \'appendBuffer\' or \'remove\' operation.') throw err
          break
        }
      }
    }
  }
    
