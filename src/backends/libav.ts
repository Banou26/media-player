/**
 * libav-wasm backend implementation.
 * Wraps makeRemuxer from libav-wasm behind the abstract MediaBackend interface.
 */
import { makeRemuxer } from 'libav-wasm'
import type { MediaBackend, ThumbnailCapableBackend, InitResult, ReadResult, SeekResult } from './types'

export type LibavBackendOptions = Parameters<typeof makeRemuxer>[0]

export async function createLibavBackend(options: LibavBackendOptions): Promise<ThumbnailCapableBackend> {
  const remuxer = await makeRemuxer(options)

  return {
    async init(): Promise<InitResult> {
      return await remuxer.init()
    },
    async read(): Promise<ReadResult> {
      return await remuxer.read()
    },
    async seek(time: number): Promise<SeekResult> {
      return await remuxer.seek(time)
    },
    async readKeyframe(timestamp: number): Promise<ArrayBuffer> {
      return await remuxer.readKeyframe(timestamp)
    },
    destroy() {
      remuxer.destroy()
    }
  }
}
