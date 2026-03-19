/**
 * Abstract types for media backends.
 * These replace the direct dependency on libav-wasm types,
 * allowing different backends (libav-wasm, native video element, iframe, etc.)
 */

export type Attachment = {
  filename: string
  data: ArrayBuffer
}

export type SubtitleFragment =
  | { type: 'header', streamIndex: number, content: string }
  | { type: 'dialogue', streamIndex: number, content: string, start: number, end: number }

export type Index = {
  index: number
  timestamp: number
  pos: number
}

export type MediaInfo = {
  input: {
    duration: number
  }
  output: {
    videoMimeType: string
    audioMimeType: string
  }
}

export type InitResult = {
  info: MediaInfo
  data: ArrayBuffer
  attachments?: Attachment[]
  subtitles?: SubtitleFragment[]
  indexes?: Index[]
}

export type ReadResult = {
  data: Uint8Array
  subtitles: SubtitleFragment[]
  finished: boolean
}

export type SeekResult = {
  data: Uint8Array
  pts: number
}

/**
 * Abstract interface for a media backend.
 * Implementations handle demuxing/remuxing media data from various sources.
 */
export interface MediaBackend {
  init(): Promise<InitResult>
  read(): Promise<ReadResult>
  seek(time: number): Promise<SeekResult>
  destroy(): void
}

/**
 * A backend that also supports keyframe thumbnail extraction.
 */
export interface ThumbnailCapableBackend extends MediaBackend {
  readKeyframe(timestamp: number): Promise<ArrayBuffer>
}

export function isThumbnailCapable(backend: MediaBackend): backend is ThumbnailCapableBackend {
  return 'readKeyframe' in backend
}

/**
 * Factory function type for creating media backends.
 */
export type MediaBackendFactory = () => Promise<MediaBackend>

/**
 * Factory function type for creating thumbnail-capable backends.
 */
export type ThumbnailBackendFactory = () => Promise<ThumbnailCapableBackend>
