import type { MediaBackend, SubtitleFragment, Attachment } from '../backends'

import { fromAsyncCallback } from './utils'
import { queuedThrottleWithLastCall } from '../utils'

type DataSourceEvents =
  | { type: 'METADATA', mimeType: string, duration: number }
  | { type: 'SEEKING', currentTime: number }
  | { type: 'NEED_DATA' }

type DataSourceEmittedEvents =
  | { type: 'DATA', data: Uint8Array }
  | { type: 'NEW_SUBTITLE_FRAGMENTS', subtitles: SubtitleFragment[] }
  | { type: 'NEW_ATTACHMENTS', attachments: Attachment[] }

type DataSourceInput = {
  createBackend: () => Promise<MediaBackend>
}

export default fromAsyncCallback<DataSourceEvents, DataSourceInput, DataSourceEmittedEvents>(async ({ sendBack, receive, input }) => {
  const backend = await input.createBackend()

  const metadata = await backend.init()
  if (metadata.indexes) sendBack({ type: 'INDEXES', indexes: metadata.indexes })
  if (metadata.attachments?.length) sendBack({ type: 'NEW_ATTACHMENTS', attachments: metadata.attachments })
  if (metadata.subtitles?.length) sendBack({ type: 'NEW_SUBTITLE_FRAGMENTS', subtitles: metadata.subtitles })
  sendBack({ type: 'METADATA', ...metadata })

  let isFinished = false
  let currentSeeks: { currentTime: number }[] = []
  const loadMore = queuedThrottleWithLastCall(100, async () => {
    if (currentSeeks.length || isFinished) return
    try {
      const { data, subtitles, finished } = await backend.read()
      if (finished) {
        isFinished = true
      }
      if (subtitles.length) {
        sendBack({ type: 'NEW_SUBTITLE_FRAGMENTS', subtitles })
      }
      sendBack({ type: 'DATA', data })
    } catch (err: any) {
      if (err.message === 'Cancelled') return
      console.error(err)
    }
  })

  receive(async (event) => {
    if (event.type === 'NEED_DATA') {
      loadMore()
    } else if (event.type === 'SEEKING') {
      isFinished = false
      const { currentTime } = event
      const seekObject = { currentTime }
      currentSeeks = [...currentSeeks, seekObject]
      try {
        const { data, pts } = await backend
          .seek(currentTime)
          .finally(() => {
            currentSeeks = currentSeeks.filter(seekObj => seekObj !== seekObject)
          })
        sendBack({ type: 'TIMESTAMP_OFFSET', timestampOffset: pts })
        sendBack({ type: 'DATA', data })
      } catch (err: any) {
        if (err.message === 'Cancelled') return
        console.error(err)
      }
    }
  })

  return () => {
    backend.destroy()
  }
})
