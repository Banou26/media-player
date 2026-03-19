import { css } from '@emotion/react'

import { MediaMachineContext } from '../state-machines'
import useSlider from '../utils/use-slider'

const style = css`
display: flex;
align-items: center;
justify-content: center;
flex-direction: column;
width: 100%;

.playback-slider {
  display: flex;
  align-items: center;

  padding: 8px 4px;
  margin: 0 2px;

  cursor: pointer;

  > div {
    position: relative;

    background: #ccc;
    border-radius: 4px;

    width: 120px;
    height: 3px;
    @media (min-width: 768px) {
      height: 4px;
    }
  }

  .playback-handle {
    position: absolute;


    background: #ffffff;
    border-radius: 50%;
    transform: translateX(-50%);
    pointer-events: none;

    width: 10px;
    height: 10px;
    top: -3.5px;
    @media (min-width: 768px) {
      width: 12px;
      height: 12px;
      top: -4px;
    }
  }
}
`

const PlaybackSlider = () => {
  const playbackRate = MediaMachineContext.useSelector((state) => state.context.media.playbackRate)
  const mediaActor = MediaMachineContext.useActorRef()

  const roundedRate = Math.round((playbackRate || 1) / 0.05) * 0.05

  const { sliderRef, onMouseDown, fillPercent } = useSlider({
    value: roundedRate,
    min: 0.25,
    max: 3.0,
    step: 0.05,
    onChange: (rate) => mediaActor.send({ type: 'SET_PLAYBACK_RATE', playbackRate: rate })
  })

  return (
    <div css={style}>
      <div>
        {roundedRate.toFixed(2)}x
      </div>
      <div
        className="playback-slider"
        ref={sliderRef}
        onMouseDown={onMouseDown}
      >
        <div
          style={{
            background: `linear-gradient(to right,
              #fff 0% ${fillPercent}%,
              #3A3A3A ${fillPercent}% 100%
            )`
          }}
        >
          <div
            className="playback-handle"
            style={{ left: `${fillPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default PlaybackSlider
