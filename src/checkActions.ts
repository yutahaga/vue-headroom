export type Action = 'unpin' | 'pin' | null
export interface States {
  currentScrollY: number
  lastScrollY: number
  offset: number
  downTolerance: number
  upTolerance: number
}

function checkActions(states: States): Action {
  const direction = states.currentScrollY >= states.lastScrollY ? 'down' : 'up'
  const distanceScrolled = Math.abs(states.currentScrollY - states.lastScrollY)

  // Scrolling down and past the offset.
  // Unpinned the header.
  if (direction === 'down' && states.currentScrollY >= states.offset && distanceScrolled > states.downTolerance) {
    return 'unpin'

    // Now, it's time to up.
    // Pin the header.
  } else if ((direction === 'up' && distanceScrolled > states.upTolerance) || states.currentScrollY <= states.offset) {
    return 'pin'
  }

  return null
}

export default checkActions
