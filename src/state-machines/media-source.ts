import { makeRemuxer } from 'libav-wasm'

import { fromAsyncCallback, getTimeRanges, updateSourceBuffer } from './utils'

type MediaSourceEvents =
  | ({ type: 'METADATA' } & Awaited<ReturnType<Awaited<ReturnType<typeof makeRemuxer>>['init']>>)
  | { type: 'TIMESTAMP_OFFSET', timestampOffset: number }
  | { type: 'DATA', data: ArrayBuffer }

type MediaSourceEmittedEvents =
  | { type: 'SOURCE_BUFFER_READY' }
  | { type: 'SOURCE_OPEN' }
  | { type: 'SOURCE_ENDED' }
  | { type: 'SOURCE_ERROR' }
  | { type: 'NEED_DATA' }

type MediaSourceInput = {
  videoElement: HTMLVideoElement
}

const defaultPreEvictionTime = -20
const defaultPostEvictionTime = 60
const defaultBufferTargetTime = 30

export default fromAsyncCallback<MediaSourceEvents, MediaSourceInput, MediaSourceEmittedEvents>(async ({ sendBack, receive, input, self, emit }) => {
  const { videoElement } = input

  const handlError = () => console.error(videoElement.error)
  videoElement.addEventListener('error', handlError)

  const mediaSource = new MediaSource()
  const mediaSourceUrl = URL.createObjectURL(mediaSource)
  videoElement.src = mediaSourceUrl

  const getPreEvictionTime = () => videoElement.currentTime + defaultPreEvictionTime
  const getPostEvictionTime = () => videoElement.currentTime + defaultPostEvictionTime
  const getBufferTargetTime = () => videoElement.currentTime + defaultBufferTargetTime

  let headerBuffer: ArrayBuffer | undefined
  const sourceBuffer =
    await new Promise<SourceBuffer>(resolve =>
      mediaSource.addEventListener(
        'sourceopen',
        () => {
          let resolved = false
          receive((event) => {
            if (resolved) return
            if (event.type === 'METADATA') {
              const sourceBuffer = mediaSource.addSourceBuffer(`video/mp4; codecs="${event.info.input.videoMimeType},${event.info.input.audioMimeType}"`)
              sourceBuffer.mode = 'segments'
              mediaSource.duration = event.info.input.duration
              headerBuffer = event.data
              resolved = true
              resolve(sourceBuffer)
            }
          })
        },
        { once: true }
      )
    )

  if (!headerBuffer) throw new Error('No header buffer')

  const { appendBuffer, unbufferRange } = updateSourceBuffer(sourceBuffer)
  appendBuffer(headerBuffer)

  receive(async (event) => {
    if (event.type === 'DATA') {
      await appendBuffer(event.data)
    } else if (event.type === 'TIMESTAMP_OFFSET') {
      sourceBuffer.timestampOffset = event.timestampOffset
    }
  })

  const unbuffer = async () => {
    const preEvictionTime = getPreEvictionTime()
    const postEvictionTime = getPostEvictionTime()
    const bufferedRanges = getTimeRanges(sourceBuffer)
    for (const { start, end } of bufferedRanges) {
      if (start < preEvictionTime) {
        await unbufferRange(
          start,
          preEvictionTime
        )
      }
      if (end > postEvictionTime) {
        await unbufferRange(
          postEvictionTime,
          end
        )
      }
    }
  }

  const interval = setInterval(async () => {
    await unbuffer()
    const timeRanges = getTimeRanges(sourceBuffer)
    const maxBufferedTime  = Math.max(...timeRanges.map(({ end }) => end))
    if (maxBufferedTime < getBufferTargetTime()) {
      sendBack({ type: 'NEED_DATA' })
    }
  }, 100)

  const handleSourceOpen = () => sendBack({ type: 'SOURCE_OPEN' })
  const handleSourceEnded = () => sendBack({ type: 'SOURCE_ENDED' })
  const handleSourceError = () => sendBack({ type: 'SOURCE_ERROR' })

  mediaSource.addEventListener('sourceopen', handleSourceOpen)
  mediaSource.addEventListener('sourceended', handleSourceEnded)
  mediaSource.addEventListener('error', handleSourceError)

  return () => {
    URL.revokeObjectURL(mediaSourceUrl)
    clearInterval(interval)
    videoElement.removeEventListener('error', handlError)
    mediaSource.removeEventListener('sourceopen', handleSourceOpen)
    mediaSource.removeEventListener('sourceended', handleSourceEnded)
    mediaSource.removeEventListener('error', handleSourceError)
  }
})
