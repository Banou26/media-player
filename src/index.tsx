/// <reference types="@emotion/react/types/css-prop" />
import { forwardRef, useCallback, useEffect, useRef, useState, VideoHTMLAttributes } from 'react'
import { createRoot } from 'react-dom/client'
import { call } from 'osra'
import { css, Global } from '@emotion/react'

import { Resolvers as WorkerResolvers } from './worker'

const useThrottle = () =>
  useCallback((func, limit) => {
    let inThrottle
    return (...args: any[]) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }
  }, [])

const makeTransmuxer = async ({ id, size, stream: inStream }: { id, size: number, stream: ReadableStream }) => {
  const worker = new Worker('/worker.js')
  const { stream: streamOut, info } = await call<WorkerResolvers>(worker)('REMUX', { id, size, stream: inStream })
  console.log('info', info)
  return {
    info,

  }
}

const chromeStyle = css`
  --background-padding: 2rem;
  display: grid;
  .bottom {
    align-self: end;
    height: calc(4.8rem + var(--background-padding));
    width: calc(100% - 4rem);
    margin: 0 auto;


    /* subtle background black gradient for scenes with high brightness to properly display white progress bar */
    /* font-size: 1.9rem;
    font-weight: 700;
    text-align: center; */
    /* text-shadow: rgb(0 0 0 / 80%) 1px 1px 0; */
    padding-top: var(--background-padding);
    background: linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) calc(100% - 1rem), rgba(0,0,0,0) 100%);

    .progress {
      position: relative;
      height: .4rem;
      background-color: hsla(0, 100%, 100%, .2);
      cursor: pointer;
      .padding {
        position: absolute;
        bottom: 0;
        height: 1.6rem;
        width: 100%;
      }
    }

    .controls {
      height: 100%;
      display: grid;
      align-items: center;
      grid-template-columns: 5rem 10rem auto;

      .play-button {
        color: #fff;
        background-color: transparent;
        border: none;
        cursor: pointer;
      }

      .time {
        font-family: Roboto;
        padding-bottom: .5rem;
      }
    }
  }
`

const Chrome = (({ ...rest }) => {
  return (
    <div css={chromeStyle} {...rest}>
      <div className="bottom">
        <div className="preview"></div>
        <div className="progress">
          <div className="padding"></div>
          {/* bar showing the currently loaded progress */}
          <div className="load"></div>
          {/* bar to show when hovering to potentially seek */}
          <div className="hover"></div>
          {/* bar displaying the current playback progress */}
          <div className="play"></div>
          <div className="chapters"></div>
          <div className="scrubber"></div>
        </div>
        <div className="controls">
          <button className="play-button" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <div className="time">
            10:10:10
          </div>
        </div>
      </div>
    </div>
  )
})

const style = css`
  display: grid;
  justify-content: center;
  background-color: #111;

  video {
    pointer-events: none;
    grid-column: 1;
    grid-row: 1;

    height: 100%;
    max-width: 100vw;
    background-color: black;
  }

  .chrome {
    grid-column: 1;
    grid-row: 1;
  }
`

const FKNVideo = forwardRef<HTMLVideoElement, VideoHTMLAttributes<HTMLInputElement> & { mediaSource?: MediaSource }>(({ mediaSource }, ref) => {
  const [sourceUrl, setSourceUrl] = useState<string>()

  useEffect(() => {
    if (!mediaSource) return
    setSourceUrl(URL.createObjectURL(mediaSource))
  }, [mediaSource])

  const waiting: React.DOMAttributes<HTMLVideoElement>['onWaiting'] = (ev) => {

  }

  const seeking: React.DOMAttributes<HTMLVideoElement>['onSeeking'] = (ev) => {

  }

  const timeUpdate: React.DOMAttributes<HTMLVideoElement>['onTimeUpdate'] = (ev) => {

  }
  
  return (
    <div css={style}>
      <video ref={ref} src={sourceUrl} onWaiting={waiting} onSeeking={seeking} onTimeUpdate={timeUpdate}/>
      <Chrome className="chrome"/>
    </div>
  )
})

const FKNMediaPlayer = ({ id, size, stream: inStream }: { id?: string, size?: number, stream?: ReadableStream<Uint8Array> }) => {
  const [transmuxer, setTransmuxer] = useState<Awaited<ReturnType<typeof makeTransmuxer>>>()
  const [mediaSource] = useState(new MediaSource())

  // useEffect(() => {
  //   if (!duration) return
  //   mediaSource.duration = duration
  // }, [duration])

  // sourceBuffer.mode = 'segments'

  // useEffect(() => {
  //   mediaSource.addEventListener(
  //     'sourceopen',
  //     () => resolve(mediaSource.addSourceBuffer(mime)),
  //     { once: true }
  //   )
  // }, [transmuxer])

  useEffect(() => {
    if (!size || !inStream) return
    makeTransmuxer({ size, stream: inStream }).then(setTransmuxer)
  }, [size, inStream])

  return <FKNVideo mediaSource={mediaSource}/>
}

export default FKNMediaPlayer


const mountStyle = css`
  display: grid;
  height: 100%;
  width: 100%;
`

const Mount = () => {
  const [stream, setStream] = useState<ReadableStream<Uint8Array> | null>()

  useEffect(() => {
    fetch('./video.mkv')
      .then(res => res.body)
      .then(setStream)
  }, [])

  return (
    <div css={mountStyle}>
      <FKNMediaPlayer />
    </div>
  )
}

const globalStyle = css`
  @import '/index.css';
  @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,500;1,600;1,700;1,800;1,900&family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 62.5%;
    height: 100%;
    width: 100%;
  }

  body {
    margin: 0;
    height: 100%;
    width: 100%;
    font-size: 1.6rem;
    font-family: Fira Sans;
    color: #fff;
    
    font-family: Montserrat;
    // font-family: "Segoe UI", Roboto, "Fira Sans",  "Helvetica Neue", Arial, sans-serif;
  }

  body > div {
    height: 100%;
    width: 100%;
  }

  a {
    color: #777777;
    text-decoration: none;
  }

  a:hover {
    color: #fff;
    text-decoration: underline;
  }

  ul {
    list-style: none;
  }
`

createRoot(
  document.body.appendChild(document.createElement('div'))
).render(
  <>
    <Global styles={globalStyle}/>
    <Mount/>
  </>
)
