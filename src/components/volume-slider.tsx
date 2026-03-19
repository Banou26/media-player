import { useMemo } from 'react'
import { css } from '@emotion/react'

import { TooltipDisplay } from './tooltip-display'
import { MediaMachineContext } from '../state-machines'
import { logToLinearVolume } from '../utils/volume-utils'
import useSlider from '../utils/use-slider'

const style = css`
  display: flex;
  align-items: center;

  padding: 16px 4px;
  margin: 0 2px;

  cursor: pointer;

  > div {
    position: relative;

    background: #ccc;
    border-radius: 4px;

    width: 80px;
    height: 3px;
  }

  .volume-handle {
    position: absolute;
    top: -3.5px;

    background: #ffffff;
    border-radius: 50%;
    transform: translateX(-50%);
    pointer-events: none;

    width: 10px;
    height: 10px;
  }
`

type VolumeSliderType = {
  value: number
  onChange: (v: number) => void
}

const VolumeSlider = ({ value, onChange }: VolumeSliderType) => {
  const volume = MediaMachineContext.useSelector((state) => state.context.media.volume)
  const muted = MediaMachineContext.useSelector((state) => state.context.media.muted)

  const { sliderRef, onMouseDown, fillPercent } = useSlider({
    value,
    min: 0,
    max: 1,
    step: 0.05,
    onChange,
  })

  const displayVolumePercent = useMemo(
    () => Math.round(muted ? 0 : logToLinearVolume(volume) * 100),
    [volume]
  )

  return (
    <TooltipDisplay
      id='volume-slider'
      text={
        <div
          ref={sliderRef}
          css={style}
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
              className="volume-handle"
              style={{ left: `${fillPercent}%` }}
            />
          </div>
        </div>
      }
      toolTipText={
        <div className='volume-value'>
          {displayVolumePercent}%
        </div>
      }
    />
  )
}

export default VolumeSlider
