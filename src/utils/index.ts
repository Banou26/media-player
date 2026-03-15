
export function debounceImmediateAndLatest<TArgs extends unknown[]>(
  wait: number,
  func: (...args: TArgs) => void
): (...args: TArgs) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: TArgs | null = null

  return (...args: TArgs) => {
    if (timeoutId === null) {
      func(...args)
    } else {
      lastArgs = args
    }

    clearTimeout(timeoutId as ReturnType<typeof setTimeout>)

    timeoutId = setTimeout(() => {
      if (lastArgs) {
        func(...lastArgs)
        lastArgs = null
      }
      timeoutId = null
    }, wait)
  }
}

export const queuedThrottleWithLastCall = <TArgs extends unknown[]>(
  time: number,
  func: (...args: TArgs) => Promise<void>
) => {
  let running = false
  let pendingArgs: TArgs | undefined

  const execute = async (args: TArgs) => {
    running = true
    const start = performance.now()
    try {
      await func(...args)
    } catch (err) {
      console.error(err)
    }
    if (pendingArgs) {
      const nextArgs = pendingArgs
      pendingArgs = undefined
      const elapsed = performance.now() - start
      const delay = Math.max(0, time - elapsed)
      if (delay > 0) {
        await new Promise<void>(resolve => setTimeout(resolve, delay))
      }
      await execute(nextArgs)
    } else {
      running = false
    }
  }

  return (...args: TArgs) => {
    if (running) {
      pendingArgs = args
    } else {
      execute(args)
    }
  }
}

// todo: reimplement this into a ReadableByteStream https://web.dev/streams/ once Safari gets support
export const toStreamChunkSize = (SIZE: number) => (stream: ReadableStream) =>
  new ReadableStream<Uint8Array>({
    reader: undefined,
    leftOverData: undefined,
    start() {
      this.reader = stream.getReader()
    },
    async pull(controller) {
      const { leftOverData }: { leftOverData: Uint8Array | undefined } = this

      const accumulate = async ({ buffer = new Uint8Array(SIZE), currentSize = 0 } = {}): Promise<{ buffer?: Uint8Array, currentSize?: number, done: boolean }> => {
        const { value: newBuffer, done } = await this.reader!.read()
        if (currentSize === 0 && leftOverData) {
          buffer.set(leftOverData)
          currentSize += leftOverData.byteLength
          this.leftOverData = undefined
        }

        if (done) {
          const finalResult = { buffer: buffer.slice(0, currentSize), currentSize, done }
          this.reader = undefined
          this.leftOverData = undefined
          return finalResult
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
    },
    cancel() {
      this.reader?.cancel()
      this.leftOverData = undefined
    }
  } as UnderlyingDefaultSource<Uint8Array> & {
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    leftOverData: Uint8Array | undefined
  })

export const toBufferedStream = (SIZE: number) => (stream: ReadableStream) =>
  new ReadableStream<Uint8Array>({
    buffers: [],
    currentPullPromise: undefined,
    reader: undefined,
    leftOverData: undefined,
    start() {
      this.reader = stream.getReader()
    },
    async pull(controller) {
      const pull = async () => {
        if (this.buffers.length >= SIZE) return
        this.currentPullPromise = this.reader!.read()
        const { value: newBuffer, done } = await this.currentPullPromise
        this.currentPullPromise = undefined
        if (done) {
          try {
            for (const buffer of this.buffers) controller.enqueue(buffer)
            controller.close()
          } catch (err) {
            // stream already closed
          }
          return
        }
        this.buffers.push(newBuffer)
        return newBuffer
      }

      const tryToBuffer = async (): Promise<void> => {
        if (this.buffers.length >= SIZE) return

        if (this.buffers.length === 0) {
          const buffer = await pull()
          if (!buffer) return
          return tryToBuffer()
        } else {
          pull().then((buffer) => {
            if (!buffer) return
            tryToBuffer()
          })
        }
      }

      await tryToBuffer()
      try {
        controller.enqueue(this.buffers.shift())
        tryToBuffer()
      } catch(err) {
        if (!(
          err instanceof TypeError && (
            err.message === 'ReadableStreamDefaultController.enqueue: Cannot enqueue into a stream that has already been requested to close.' ||
            err.message === `Failed to execute 'enqueue' on 'ReadableStreamDefaultController': Cannot enqueue a chunk into a readable stream that is closed or has been requested to be closed`
          )
        )) {
          throw err
        }
      }
    },
    cancel() {
      this.reader!.cancel()
    }
  } as UnderlyingDefaultSource<Uint8Array> & {
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    leftOverData: Uint8Array | undefined
    buffers: Uint8Array[]
    currentPullPromise: Promise<ReadableStreamReadResult<Uint8Array>> | undefined
  })
