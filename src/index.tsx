import { EbmlStreamDecoder, EbmlStreamEncoder, EbmlTagId } from 'ebml-stream'
import { Readable, Transform } from 'stream'

const downloadArrayBuffer = buffer => {
  const videoBlob = new Blob([new Uint8Array(buffer, 0, buffer.length)], { type: 'video/mp4' })

  var xhr = new XMLHttpRequest()
  xhr.open("GET", URL.createObjectURL(videoBlob))
  xhr.responseType = "arraybuffer"

  xhr.onload = function () {
      if (this.status === 200) {
          var blob = new Blob([xhr.response], {type: "application/octet-stream"})
          var objectUrl = URL.createObjectURL(blob)
          window.open(objectUrl)
      }
  }
  xhr.send()
}

fetch('/video.mkv').then(async (res) => {
  const originalBuffer = await fetch('/video.mkv').then(res => res.arrayBuffer())
  // const audioElement = document.createElement('video')
  // audioElement.controls = true
  // document.body.appendChild(audioElement)
  // const blob = new Blob([await res.arrayBuffer()], { type: "video/matroska" })
  // const url = window.URL.createObjectURL(blob)
  // audioElement.src = url
  // audioElement.play()
  // return
  const { body: stream } = res
  if (!stream) throw new Error('stream was null')
  const decoder = new EbmlStreamDecoder()
  
  const ebmlEncoder = new EbmlStreamEncoder()
 
  let strippedTracks = {}

  const buffers: Uint8Array[] = []

  // decoder.on('data', chunk => console.log(chunk))
  decoder.pipe(ebmlEncoder).on('data', chunk => buffers.push(chunk))

  const streamReader = stream.getReader()
  const readStream = async () => {
    const { value, done } = await streamReader.read()
    if (done) {
      decoder.end()
      const resultBuffer = buffers.reduce((accBuffer, buffer) => {
        const mergedArray = new Uint8Array(accBuffer.length + buffer.length)
        mergedArray.set(accBuffer)
        mergedArray.set(buffer, accBuffer.length)
        return mergedArray
      }, new Uint8Array())
      console.log('buffers', buffers)
      console.log('originalBuffer', new Uint8Array(originalBuffer))
      console.log('resultBuffer', resultBuffer)
      console.log('byteLength diff', resultBuffer.byteLength - originalBuffer.byteLength)
      console.log('originalBuffer view', new Uint8Array(originalBuffer, 5_000, 500))
      console.log('resultBuffer view', new Uint8Array(resultBuffer.buffer, 5_000, 500))
      const audioElement = document.createElement('video')
      audioElement.controls = true
      document.body.appendChild(audioElement)
      const blob = new Blob([resultBuffer], { type: "video/matroska" })
      const url = window.URL.createObjectURL(blob)
      audioElement.src = url
      audioElement.play()
      return
    }
    decoder.write(value)
    readStream()
  }
  readStream()
  


  // fs.readFile('media/test.webm', (err, data) => {
  //     if (err) {
  //         throw err
  //     }
  //     decoder.write(data)
  // })
})
