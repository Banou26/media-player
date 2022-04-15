/// <reference types="@emotion/react/types/css-prop" />
import { ClassAttributes, forwardRef, HTMLAttributes, MouseEventHandler, useCallback, useEffect, useRef, useState, VideoHTMLAttributes } from 'react'
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
  const worker = new Worker('/worker.js', { type: 'module' })
  const { stream: streamOut, info } = await call<WorkerResolvers>(worker)('REMUX', { id, size, stream: inStream })

  return {
    info,

  }
}

const chromeStyle = css`
  --background-padding: 2rem;
  display: grid;
  overflow: hidden;

  &.hide {
    opacity: 0;
    cursor: none;
  }

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
      grid-template-columns: 5rem 20rem auto 5rem 5rem;
      grid-gap: 1rem;
      color: #fff;

      .picture-in-picture {
        display: grid;
        justify-items: center;
        cursor: pointer;
      }

      .fullscreen {
        display: grid;
        justify-items: center;
        cursor: pointer;
      }

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

const Chrome = (({ duration, currentTime, pictureInPicture, fullscreen, ...rest }: { duration?: number, currentTime?: number, pictureInPicture: MouseEventHandler<HTMLDivElement>, fullscreen: MouseEventHandler<HTMLDivElement> } & HTMLAttributes<HTMLDivElement>) => {
  const [isFullscreen, setFullscreen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [autoHide, setAutoHide] = useState<number>()

  const mouseMove: MouseEventHandler<HTMLDivElement> = (ev) => {
    setHidden(false)
    if (autoHide) clearInterval(autoHide)
    setAutoHide(
      setTimeout(() => {
        setHidden(true)
      }, 5_000) as unknown as number
    )
  }

  const mouseOut = () => {
    setHidden(true)
  }

  const clickFullscreen = (ev) => {
    setFullscreen(value => !value)
    fullscreen(ev)
  }

  return (
    <div {...rest} css={chromeStyle} onMouseMove={mouseMove} onMouseOut={mouseOut} className={`${rest.className ?? ''} ${hidden ? 'hide' : ''}`}>
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
            <span>{new Date((currentTime ?? 0) * 1000).toISOString().substr(11, 8)}</span>
            <span> / </span>
            <span>{duration ? new Date(duration * 1000).toISOString().substr(11, 8) : ''}</span>
          </div>
          <div></div>
          <div className="picture-in-picture" onClick={pictureInPicture}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="21" height="14" rx="2" ry="2"></rect><rect x="12.5" y="8.5" width="8" height="6" rx="2" ry="2"></rect></svg>
          </div>
          <div className="fullscreen" onClick={clickFullscreen}>
            {
              isFullscreen
                ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            }
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

const FKNVideo = forwardRef<HTMLVideoElement, VideoHTMLAttributes<HTMLInputElement> & { mediaSource?: MediaSource, duration?: number }>(({ mediaSource, duration }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>()
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

  const pictureInPicture = () => {
    if (document.pictureInPictureElement) return document.exitPictureInPicture()
    videoRef.current?.requestPictureInPicture()
  }

  const fullscreen = () => {
    if (document.fullscreenElement) return document.exitFullscreen()
    // @ts-ignore
    containerRef.current?.requestFullscreen()
  }

  const refFunction: ClassAttributes<HTMLVideoElement>['ref'] = (element) => {
    if (typeof ref === 'function') ref(element)
    if (ref && 'current' in ref) ref.current = element
    videoRef.current = element ?? undefined
  }
  
  return (
    <div css={style} ref={containerRef}>
      <video ref={refFunction} src={sourceUrl} onWaiting={waiting} onSeeking={seeking} onTimeUpdate={timeUpdate}/>
      <Chrome className="chrome" duration={duration} pictureInPicture={pictureInPicture} fullscreen={fullscreen}/>
    </div>
  )
})

const FKNMediaPlayer = ({ id, size, stream: inStream }: { id?: string, size?: number, stream?: ReadableStream<Uint8Array> }) => {
  const [transmuxer, setTransmuxer] = useState<Awaited<ReturnType<typeof makeTransmuxer>>>()
  const [duration, setDuration] = useState<number>()
  const [mediaSource] = useState(new MediaSource())

  useEffect(() => {
    if (!transmuxer) return
    setDuration(transmuxer.info.input.duration)
    mediaSource.duration = transmuxer.info.input.duration
  }, [transmuxer])

  // sourceBuffer.mode = 'segments'

  // useEffect(() => {
  //   mediaSource.addEventListener(
  //     'sourceopen',
  //     () => resolve(mediaSource.addSourceBuffer(mime)),
  //     { once: true }
  //   )
  // }, [transmuxer])

  useEffect(() => {
    if (!id || !size || !inStream) return
    makeTransmuxer({ id, size, stream: inStream }).then(setTransmuxer)
  }, [size, inStream])

  return <FKNVideo duration={duration} mediaSource={mediaSource}/>
}

export default FKNMediaPlayer


const mountStyle = css`
  display: grid;
  height: 100%;
  width: 100%;
`

const Mount = () => {
  const [size, setSize] = useState<number>()
  const [stream, setStream] = useState<ReadableStream<Uint8Array>>()

  useEffect(() => {
    fetch('./video.mkv')
      .then(({ headers, body }) => {
        if (!body || !headers.get('Content-Length')) throw new Error('no stream or Content-Length returned from the response')
        setSize(Number(headers.get('Content-Length')))
        setStream(body)
      })
  }, [])

  return (
    <div css={mountStyle}>
      <FKNMediaPlayer id={'test'} size={size} stream={stream}/>
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
