import buffer from 'buffer'

// @ts-ignore
globalThis.Buffer = buffer.Buffer
if (!globalThis.process) {
  globalThis.process = {
    env: {
      NODE_DEBUG: 'false',
    },
    cwd: () => '/',
    'platform': 'linux',
    // @ts-ignore
    'browser': true,
    'nextTick': (func, ...args) => setTimeout(() => func(...args), 0),
    // 'nextTick': (function() {
    //   const {port1, port2} = new MessageChannel()
    //   const queue: ((...args: any[]) => any)[] = []
  
    //   port1.onmessage = function() {
    //     const callback = queue.shift()!
    //     callback()
    //   }
  
    //   return (callback: (...args: any[]) => any) => {
    //     port2.postMessage(null)
    //     queue.push(callback)
    //   }
    // })(),
    'version': '"v16.6.0"'
  }
}
