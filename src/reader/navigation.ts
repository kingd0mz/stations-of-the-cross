import { PAGE_IDS, PageId } from '../content/types';

export function adjacentPage(pageId: PageId, direction: number): PageId {
  const index = PAGE_IDS.indexOf(pageId);
  return PAGE_IDS[Math.max(0, Math.min(PAGE_IDS.length - 1, index + direction))];
}

export type GestureDirection = 'horizontal' | 'vertical' | null;

export function gestureDirection(dx: number, dy: number): GestureDirection {
  if (Math.abs(dy) > 12 && Math.abs(dy) >= Math.abs(dx)) return 'vertical';
  if (Math.abs(dx) > 24 && Math.abs(dx) > Math.abs(dy) * 1.8) return 'horizontal';
  return null;
}

export function swipeStep(dx: number, dy: number): -1 | 0 | 1 {
  if (Math.abs(dx) < 60 || Math.abs(dx) <= Math.abs(dy) * 1.8) return 0;
  return dx < 0 ? 1 : -1;
}

// Gesture state lives outside React rendering. Once vertical, a drag stays vertical.
export function createSwipeTracker() {
  let direction: GestureDirection = null;
  let multipleTouches = false;
  return {
    start(touches: number) {
      if (touches === 1) { direction = null; multipleTouches = false; }
      else multipleTouches = true;
    },
    addTouch(touches: number) { if (touches > 1) multipleTouches = true; },
    move(dx: number, dy: number, touches: number) {
      if (touches !== 1) multipleTouches = true;
      if (multipleTouches || direction === 'vertical') return false;
      direction = gestureDirection(dx, dy);
      return direction === 'horizontal';
    },
    finish(dx: number, dy: number) {
      const step = direction === 'horizontal' && !multipleTouches ? swipeStep(dx, dy) : 0;
      direction = null;
      return step;
    },
    cancel() { direction = null; },
  };
}
