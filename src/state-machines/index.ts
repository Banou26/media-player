import { createActorContext } from '@xstate/react'

import mediaMachine from './media'

// Explicit type annotation needed because the machine type is too complex for TS to serialize
export const MediaMachineContext: ReturnType<typeof createActorContext<typeof mediaMachine>> = createActorContext(mediaMachine)
