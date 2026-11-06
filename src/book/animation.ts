/*
 * Adapted from “The leporello carousel”, Animorio.
 * https://animorio.com/en/animations/leporello-carousel/
 * Free on own/client sites, including commercial work; no resale or redistribution.
 * https://animorio.com/en/license/
 * House and paper artwork supplied by the original project.
 */
import { BOOKS } from './content';

type Timeline = { to(target: object, vars: object, position: number): Timeline; kill(): void };
declare const gsap: {
  ticker: {add(callback: (time: number, delta: number) => void): void; remove(callback: (time: number, delta: number) => void): void};
  timeline(options: {onUpdate: () => void; onComplete: () => void}): Timeline;
};
type Press = {id: number; x0: number; y0: number; p0: number; goal: number; trail: number[][]; idx: number};
type BookEvents = GlobalEventHandlersEventMap & { 'book:navigate': Event; visibilitychange: Event };
function listen<K extends keyof BookEvents>(signal: AbortSignal, target: EventTarget, type: K, handler: (event: BookEvents[K]) => void, options: AddEventListenerOptions = {}) {
  target.addEventListener(type, handler as EventListener, {...options, signal});
}

const START = 0;
const FOLD = 86;                /* the steepest fold, in degrees: the stacks at the two ends */
const SPREAD = 0.72;            /* how quickly the paper folds up away from the middle, in cards: bigger, gentler */
const BREATHE = 0.15;           /* how much the folds open while the strip runs: 0 not at all */
const PEEK = 0.22;              /* how much a folded card opens under the pointer */
const GLIDE = [7, 0.8];         /* the strip's spring: how quickly it reaches a card, how much it is held back */
const THROW = 0.24;             /* the seconds a thrown strip runs on before it is caught (how far a flick goes) */
const SHADE = 0.13;             /* how dark a card turned away from the light gets */

// Connected leaves use shared hinge coordinates. Position and hover settle on
// springs; one separate progress controls the whole opening/closing transition.

function initBook(host: HTMLElement, signal: AbortSignal) {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = host.querySelector<HTMLElement>('[data-lep]')!;
  const view = root.querySelector<HTMLElement>('[data-view]')!;
  const strip = root.querySelector<HTMLElement>('[data-strip]')!;
  const boardStrip = view.querySelector<HTMLElement>('.lep__boards')!;
  const shadowEl = root.querySelector<HTMLElement>('[data-shadow]')!;
  const live = root.querySelector<HTMLElement>('[data-live]')!;
  const books = BOOKS;
  const N = books.length;

  const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
  const RAD = Math.PI / 180;
  const foldMax = clamp(FOLD, 10, 88);
  const spread = Math.max(0.3, SPREAD);
  const breathe = Math.max(0, BREATHE);
  const peek = clamp(PEEK, 0, 0.9);
  const shadeMax = clamp(SHADE, 0, 0.8);
  const glideW = Math.max(1, GLIDE[0]);
  const glideZ = clamp(GLIDE[1], 0.2, 2);
  const LIGHT = [-0.5, 0.866];  /* the light: from the front, a little from the left */
  const leaves = books.map((_, i) => {
    const el = strip.children[i] as HTMLElement;
    const shades = el.querySelectorAll<HTMLElement>('.leaf__shade');
    return {
      el,
      board: boardStrip.querySelector<HTMLElement>(`[data-board="${i}"]`),
      front: shades[0], back: shades[1],
      frontFace: el.querySelector<HTMLElement>('.leaf__face--front')!,
      backFace: el.querySelector<HTMLElement>('.leaf__face--back')!,
      sign: i % 2 ? -1 : 1, hv: 0, hvv: 0, phi: 0,
      last: { t: '', f: '', b: '', vis: '' },
    };
  });

  /* ---------------------------------------------------------------- sizes */
  let W = 232;                  /* the width of a card */
  let viewW = 900;
  let persp = 1740;             /* the perspective of the view, to know where the paper ends on screen */
  function measure() {
    W = parseFloat(getComputedStyle(leaves[0].el).width) || 232;
    viewW = view.clientWidth || 900;
    persp = parseFloat(getComputedStyle(view).perspective) || W * 7.5;
  }
  const onScreen = (x: number, z: number) => (x * persp) / Math.max(1, persp - z);

  /* ---------------------------------------------------------------- the state */
  let at = clamp(Math.round(START), 0, N - 1);  /* the card lying open, whole */
  let p = at;                   /* the card in the middle, as a fraction: the strip's position */
  let pv = 0;                   /* how fast it goes, in cards a second */
  let target = at;
  let omega = glideW;
  let br = 0;                   /* how far the folds are pulled open by the running strip, on its spring */
  let bv = 0;
  let hoverIdx = -1;
  let press: Press | null = null;             /* a pointer down on the strip */
  let drag: Press | null = null;              /* the same pointer once it moves the strip */
  let entering = false;
  let phase = 'closed';
  let bindingTimeline: Timeline | null = null;
  const binding = {open:0};
  const X = new Float64Array(N + 1);
  const Z = new Float64Array(N + 1);

  /* ---------------------------------------------------------------- the paper, every frame */
  function foldOf(i: number, sp: number) {
    const d = (i - p) / sp;
    let a = foldMax * (1 - Math.exp(-d * d));
    const L = leaves[i];
    if (!REDUCED) a *= 1 - peek * clamp(L.hv, -0.2, 1.2);
    return clamp(a, -20, 89);
  }

  function render() {
    const sp = spread * (1 + breathe * br);
    /* the chain: every card starts where the one before ends, turned by its own fold, one way or the other */
    // A compressed concertina keeps an 8° gap at every alternating hinge.
    // Both covers stay attached to the ends; neither has a separate rotation.
    for (let i = 0; i < N; i++) {
      const closed = i % 2 === 0 ? 148 : -24;
      const unfolded = leaves[i].sign * foldOf(i, sp);
      leaves[i].phi = closed + (unfolded - closed) * binding.open;
    }
    X[0] = Z[0] = 0;
    for (let i = 0; i < N; i++) {
      const r = leaves[i].phi * RAD;
      X[i + 1] = X[i] + W * Math.cos(r);
      Z[i + 1] = Z[i] - W * Math.sin(r);
    }
    /* the middle of the card at p stands in the middle of the view, at its true size */
    const k = N > 1 ? clamp(Math.floor(p), 0, N - 2) : 0;
    const f = N > 1 ? p - k : 0;
    const cx0 = (X[k] + X[k + 1]) / 2;
    const cz0 = (Z[k] + Z[k + 1]) / 2;
    const k1 = Math.min(N - 1, k + 1);
    const cx1 = (X[k1] + X[k1 + 1]) / 2;
    const cz1 = (Z[k1] + Z[k1 + 1]) / 2;
    const openX = cx0 + (cx1 - cx0) * f;
    const openZ = cz0 + (cz1 - cz0) * f;
    const closedX = (Math.min(...X) + Math.max(...X)) / 2;
    const closedZ = (Math.min(...Z) + Math.max(...Z)) / 2;
    const ax = closedX + (openX - closedX) * binding.open;
    const az = closedZ + (openZ - closedZ) * binding.open;
    const reach = viewW / 2 + W;
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i < N; i++) {
      const L = leaves[i];
      const x = X[i] - ax;
      const z = Z[i] - az;
      const x2 = X[i + 1] - ax;
      const seen = Math.min(x, x2) < reach && Math.max(x, x2) > -reach;
      const vis = seen ? '' : 'hidden';
      if (vis !== L.last.vis) {
        L.el.style.visibility = vis;
        L.last.vis = vis;
      }
      // Do not leave coplanar front/back layers to mobile compositor tie-breaking.
      const facingFront = Math.cos(L.phi * RAD) >= 0;
      L.frontFace.style.visibility = seen && facingFront ? 'visible' : 'hidden';
      L.backFace.style.visibility = seen && !facingFront ? 'visible' : 'hidden';
      // ABOUT's ivory board is the inner face of the illustrated front cover.
      // Its reverse is already drawn by cover-art; drawing both silhouettes
      // puts a second, mirrored roof and chimney outside the closed house.
      if (L.board) L.board.style.visibility = seen && (i !== 0 || facingFront) ? 'visible' : 'hidden';
      const depth = (Z[i] + Z[i + 1]) / 2 - az;
      L.el.style.zIndex = String(Math.round(depth * 1000) * (N + 1) + N - i);
      if (!seen) continue;
      const sx = onScreen(x, z);
      const sx2 = onScreen(x2, Z[i + 1] - az);
      lo = Math.min(lo, sx, sx2);
      hi = Math.max(hi, sx, sx2);
      const t = `translate3d(${x.toFixed(2)}px,0,${z.toFixed(2)}px) rotateY(${L.phi.toFixed(3)}deg)`;
      if (t !== L.last.t) {
        L.el.style.transform = t;
        if (L.board) L.board.style.transform = t;
        L.last.t = t;
      }
      /* the light on both sides of the paper */
      const r = L.phi * RAD;
      const nx = Math.sin(r);
      const nz = Math.cos(r);
      const lit = nx * LIGHT[0] + nz * LIGHT[1];
      const flatness = clamp(1 - Math.abs(L.phi) / foldMax, 0, 1);
      const fs = (shadeMax * clamp(0.5 * (1 - flatness) + 0.6 * (1 - lit / LIGHT[1]), 0, 1.4)).toFixed(3);
      // The original outside artwork has its own silhouette. A paper-sized
      // shade on this unclipped face paints a grey rectangle over the house.
      const bs = i === 0 ? '0' : (shadeMax * (0.35 + clamp(1 + lit / LIGHT[1], 0, 1.4) * 0.6)).toFixed(3);
      if (fs !== L.last.f) {
        L.front.style.opacity = fs;
        L.last.f = fs;
      }
      if (bs !== L.last.b) {
        L.back.style.opacity = bs;
        L.last.b = bs;
      }

    }
    if (phase === 'closed') {
      const rect = host.querySelector<HTMLElement>('.cover-art')!.getBoundingClientRect();
      const hit = host.querySelector<HTMLElement>('#coverHit')!;
      Object.assign(hit.style, {left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});
    }
    /* the shadow on the table follows the strip */
    if (lo > hi) lo = hi = 0;
    lo = Math.max(lo, -viewW / 2);
    hi = Math.min(hi, viewW / 2);
    const sw = Math.max(40, hi - lo);
    shadowEl.style.transform = `translate3d(${lo.toFixed(1)}px,0,0) scaleX(${(sw / 100).toFixed(3)})`;
  }

  /* ---------------------------------------------------------------- the physics */
  function step(h: number) {
    let a;
    if (drag) a = 900 * (drag.goal - p) - 60 * pv;
    else a = omega * omega * (target - p) - 2 * glideZ * omega * pv;
    pv += a * h;
    p += pv * h;
    /* a running strip pulls the folds open a little */
    const bt = REDUCED ? 0 : Math.min(1, Math.abs(pv) / 5);
    bv += (90 * (bt - br) - 2 * 0.95 * Math.sqrt(90) * bv) * h;
    br += bv * h;
    for (let i = 0; i < N; i++) {
      const L = leaves[i];
      const tg = i === hoverIdx && !drag && i !== at ? 1 : 0;
      L.hvv += (170 * (tg - L.hv) - 2 * 0.72 * Math.sqrt(170) * L.hvv) * h;
      L.hv += L.hvv * h;
    }
  }

  function settled() {
    if (drag || entering) return false;
    if (Math.abs(pv) > 0.002 || Math.abs(target - p) > 0.0005) return false;
    if (Math.abs(br) > 0.002 || Math.abs(bv) > 0.01) return false;
    return leaves.every((L, i) => {
      const tg = i === hoverIdx && i !== at ? 1 : 0;
      return Math.abs(L.hv - tg) < 0.002 && Math.abs(L.hvv) < 0.01;
    });
  }

  let awake = false;
  function tick(_time: number, deltaMs: number) {
    /* a step of 1/30 s at most, cut into slices of 4 ms */
    const dt = Math.min(1 / 30, (deltaMs || 16) / 1000);
    const n = Math.max(1, Math.ceil(dt / 0.004));
    for (let k = 0; k < n; k++) step(dt / n);
    if (drag) {
      const k = clamp(Math.round(p), 0, N - 1);
      if (k !== at) choose(k, true);
    }
    if (settled()) {
      p = target;
      pv = br = bv = 0;
      leaves.forEach((L, i) => {
        L.hv = i === hoverIdx && i !== at ? 1 : 0;
        L.hvv = 0;
      });
      render();
      gsap.ticker.remove(tick);
      awake = false;
      return;
    }
    render();
  }
  function wake() {
    if (phase !== 'open' || awake) return;
    awake = true;
    gsap.ticker.add(tick);
  }

  /* ---------------------------------------------------------------- choosing a book */
  function announce() {
    const [title, words] = books[at];
    live.textContent = `${at + 1} / ${N}: ${title}. ${words}`;
  }

  function choose(k: number, quiet = false) {
    if (k === at) return;
    at = k;
    leaves.forEach((L, i) => (i === k ? L.el.setAttribute('aria-current', 'true') : L.el.removeAttribute('aria-current')));
    leaves.forEach((leaf, i) => {
      const link = leaf.el.querySelector('a');
      if (link) link.tabIndex = i === k ? 0 : -1;
    });
    if (!quiet) announce();
  }

  function go(k: number) {
    if (phase !== 'open') return;
    k = clamp(k, 0, N - 1);
    /* the spring is softened by the distance: a long way starts with the same pull as a step of one */
    omega = glideW / Math.sqrt(Math.max(1, Math.abs(k - p)));
    target = k;
    choose(k);
    root.dispatchEvent(new Event('book:navigate'));
    if (REDUCED) jump();
    wake();
  }

  function jump() {
    p = target;
    pv = 0;
    render();
  }

  /* ---------------------------------------------------------------- hands */
  const rubber = (v: number) => (0.3 * v) / (1 + v);
  const leafOf = (t: EventTarget | null) => {
    const el = t instanceof Element ? t.closest('.leaf') : null;
    return el ? leaves.findIndex((L) => L.el === el) : -1;
  };
  function setHover(k: number) {
    if (k === hoverIdx) return;
    hoverIdx = k;
    wake();
  }

  listen(signal, view, 'pointerdown', (e) => {
    if ((e.target as Element).closest('a')) return;
    if (phase !== 'open' || e.isPrimary === false || (e.pointerType === 'mouse' && e.button !== 0)) return;
    // A fresh mouse press also recovers if the previous release was lost.
    if (press && e.pointerType === 'mouse') cancelPress();
    if (press) return;
    const idx = leafOf(e.target);
    if (idx < 0) return;
    press = { id: e.pointerId, x0: e.clientX, y0: e.clientY, p0: p, goal: p, trail: [[performance.now(), e.clientX]], idx };
    // Capture immediately, including the small movement before drag begins.
    try { view.setPointerCapture(e.pointerId); } catch {}
    /* a finger on a folded card opens it a little, as the mouse does */
    if (e.pointerType !== 'mouse') setHover(press.idx);
  });
  listen(signal, view, 'pointermove', (e) => {
    if (e.pointerType === 'mouse' && !press) setHover(leafOf(e.target));
    if (!press || e.pointerId !== press.id) return;
    if (e.pointerType === 'mouse' && e.buttons === 0) {
      cancelPress();
      return;
    }
    const now = performance.now();
    press.trail.push([now, e.clientX]);
    while (press.trail.length > 2 && now - press.trail[0][0] > 90) press.trail.shift();
    if (!drag) {
      const dx = e.clientX - press.x0;
      const dy = e.clientY - press.y0;
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      /* a finger going up or down scrolls the page */
      if (Math.abs(dy) > Math.abs(dx)) {
        cancelPress();
        return;
      }
      drag = press;
      // Keep the original press coordinates: the threshold is not a new start.
      view.classList.add('is-held');
      setHover(-1);
      try {
        view.setPointerCapture(e.pointerId);
      } catch {
        /* the pointer has gone already */
      }
    }
    /* one card for every 0.8 of a card's width: about how far the middle moves when the strip goes a card on */
    let g = drag.p0 - (e.clientX - drag.x0) / (W * 0.8);
    if (g < 0) g = -rubber(-g);
    else if (g > N - 1) g = N - 1 + rubber(g - (N - 1));
    drag.goal = g;
    if (!REDUCED) wake();
  });
  /* a strip let go fast towards its card would fly past it: it keeps no more speed than the spring can stop in time,
     so it lands with the same pixel of overshoot as a step of one */
  function calm() {
    const dist = target - p;
    if (Math.sign(pv) === Math.sign(dist)) pv = Math.sign(dist) * Math.min(Math.abs(pv), omega * Math.abs(dist) * 1.05);
  }

  function release(goal: number, v: number) {
    const k = clamp(Math.round(goal + v * THROW), 0, N - 1);
    omega = glideW / Math.sqrt(Math.max(1, Math.abs(k - goal) * 0.6));
    target = k;
    calm();
    choose(k, true);
    announce();
    root.dispatchEvent(new Event('book:navigate'));
    if (REDUCED) jump();
    wake();
  }
  const letGo = (e: Pick<PointerEvent, 'pointerId' | 'pointerType' | 'type'>) => {
    if (!press || e.pointerId !== press.id) return;
    const d = press;
    press = null;
    try { view.releasePointerCapture(d.id); } catch {}
    if (e.pointerType !== 'mouse') setHover(-1);
    if (!drag) {
      /* a tap on a card at the side goes there */
      if (e.type === 'pointerup' && d.idx >= 0 && d.idx !== at) go(d.idx);
      return;
    }
    drag = null;
    view.classList.remove('is-held');
    const [t0, x0] = d.trail[0];
    const [t1, x1] = d.trail[d.trail.length - 1];
    const v = e.type === 'pointerup' && performance.now() - t1 < 80 ? -(x1 - x0) / Math.max(0.016, (t1 - t0) / 1000) / (W * 0.8) : 0;
    if (REDUCED) {
      /* with less motion the strip did not follow the hand: a swipe is one card on or back */
      const moved = d.goal - d.p0;
      go(Math.abs(moved) > 0.15 ? at + Math.sign(moved) : at);
      return;
    }
    release(d.goal, clamp(v, -14, 14));
  };
  function cancelPress() {
    if (!press) return;
    letGo({pointerId:press.id, pointerType:'mouse', type:'pointercancel'});
    setHover(-1);
  }
  // Document fallbacks cover releases outside the view if capture is unavailable.
  listen(signal, document, 'pointerup', letGo);
  listen(signal, document, 'pointercancel', letGo);
  listen(signal, view, 'lostpointercapture', cancelPress);
  listen(signal, window, 'blur', cancelPress);
  listen(signal, document, 'visibilitychange', () => {
    if (document.hidden) cancelPress();
  });
  listen(signal, view, 'pointerleave', (e) => {
    if (e.pointerType === 'mouse') setHover(-1);
  });
  listen(signal, view, 'dragstart', (e) => e.preventDefault());

  /* a trackpad swiped sideways: one card per swipe, however long it glides */
  let wheelSum = 0;
  let wheelLast = 0;
  let wheelQuiet = 0;
  listen(signal, view, 'wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    const now = performance.now();
    if (now - wheelLast > 200) wheelSum = 0;
    wheelLast = now;
    if (now < wheelQuiet) {
      wheelQuiet = now + 220;
      return;
    }
    wheelSum += e.deltaX;
    if (Math.abs(wheelSum) > 40) {
      go(at + Math.sign(wheelSum));
      wheelSum = 0;
      wheelQuiet = now + 260;
    }
  }, { passive: false });

  /* the keys, with the focus on the strip */
  listen(signal, view, 'keydown', (e) => {
    if (e.key === 'ArrowRight') go(at + 1);
    else if (e.key === 'ArrowLeft') go(at - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(N - 1);
    else return;
    e.preventDefault();
  });

  listen(signal, window, 'resize', () => {
    measure();
    render();
  });

  // One timeline owns every binding transition. No CSS transition, timeout,
  // demo tour, or second ticker can animate the book at the same time.
  function setOpen(next: boolean) {
    if (bindingTimeline || phase === (next ? 'open' : 'closed')) return Promise.resolve();
    phase = next ? 'opening' : 'closing';
    root.dataset.state = phase;
    entering = true;
    gsap.ticker.remove(tick);
    awake = false;
    press = drag = null;
    hoverIdx = -1;
    pv = br = bv = 0;
    view.classList.remove('is-held');
    leaves.forEach(L => { L.hv = L.hvv = 0; });
    measure();
    if (next) {
      at = -1;
      choose(0);
    }
    const finish = () => {
      if (next) p = target = 0;
      binding.open = next ? 1 : 0;
      entering = false;
      phase = next ? 'open' : 'closed';
      root.dataset.state = phase;
      bindingTimeline = null;
      if (!next) choose(0);
      render();
    };
    if (REDUCED) {
      finish();
      return Promise.resolve();
    }
    return new Promise<void>(resolve => {
      const timeline = gsap.timeline({onUpdate:render, onComplete:() => {finish();resolve();}});
      bindingTimeline = timeline;
      // One shared progress folds the connected strip, without returning to
      // ABOUT first or swinging the front cover after the other pages stop.
      const position = {value:p};
      if (next) timeline.to(position, {
        value:0, duration:1.6, ease:'power2.inOut',
        onUpdate:()=>{p=target=position.value;}
      }, 0);
      timeline.to(binding, {open:next ? 1 : 0, duration:1.6, ease:'power2.inOut'}, 0);
    });
  }
  root.dataset.state='closed';
  measure();
  render();
  return {setOpen, destroy() { gsap.ticker.remove(tick); bindingTimeline?.kill(); }};
};

export function mountBook(host: HTMLElement) {
  const abort = new AbortController();
  const signal = abort.signal;

  const motion = initBook(host, signal);
  const root = host.querySelector<HTMLElement>('[data-lep]')!;
  const cover = host.querySelector<HTMLElement>('#coverHit')!;
  const close = host.querySelector<HTMLElement>('#closeBook')!;
  root.inert = true;
  root.setAttribute('aria-hidden', 'true');
  cover.inert = false;
  cover.setAttribute('aria-hidden', 'false');
  cover.setAttribute('aria-expanded', 'false');
  host.dataset.homeReady = 'false';
  const coverImage = host.querySelector<HTMLImageElement>('.cover-art')!;
  const backgroundUrl = getComputedStyle(document.body).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
  const background = new Image();
  if (backgroundUrl) background.src = backgroundUrl;
  const coverReady = Promise.all([
    coverImage.decode(),
    backgroundUrl ? background.decode() : Promise.resolve(),
    document.fonts.load('400 14px Neujoh'),
  ]).then(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!signal.aborted) host.dataset.homeReady = 'true';
    resolve();
  }))));
  // A failed image must not reveal the raw inner paper either.
  void coverReady.catch(() => {});
  // Keep hidden artwork off the network until the visitor opens the house.
  // Decode before moving so images do not pop in during the fold animation.
  let artwork: Promise<void> | undefined;
  function prepareArtwork() {
    if (artwork) return artwork;
    const urls = new Set<string>();
    host.querySelectorAll<HTMLElement>('[data-home-background]').forEach(element => {
      const url = element.dataset.homeBackground!;
      element.style.backgroundImage = `url("${url}")`;
      urls.add(url);
    });
    host.querySelectorAll<SVGImageElement>('[data-home-src]').forEach(element => {
      const url = element.dataset.homeSrc!;
      element.setAttribute('href', url);
      urls.add(url);
    });
    artwork = Promise.all([...urls].map(url => {
      const image = new Image();
      image.src = url;
      return image.decode().catch(() => undefined);
    })).then(() => undefined);
    return artwork;
  }
  let opened = false;
  let busy = false;
  async function change(next: boolean) {
    if (busy || next === opened) return;
    busy = true;
    if (next) {
      const enter = host.querySelector<HTMLButtonElement>('[data-home-open]')!;
      enter.textContent = '펼치는 중…';
      enter.setAttribute('aria-busy', 'true');
      await coverReady;
      await Promise.all([prepareArtwork(), document.fonts.load('700 18px Neujoh'), document.fonts.load('400 14px "Home Pretendard"')]);
      enter.textContent = '들어가며';
      enter.removeAttribute('aria-busy');
      if (signal.aborted) return;
    }
    root.inert = true;
    cover.inert = true;
    cover.setAttribute('aria-hidden','true');
    document.body.classList.add('is-transitioning');
    if (next) document.body.classList.add('is-open');
    await motion.setOpen(next);
    if (signal.aborted) return;
    opened = next;
    document.body.classList.toggle('is-open',next);
    document.body.classList.remove('is-transitioning');
    root.inert = !next;
    root.setAttribute('aria-hidden',String(!next));
    cover.inert = next;
    cover.setAttribute('aria-hidden',String(next));
    cover.setAttribute('aria-expanded',String(next));
    busy = false;
    (next ? host.querySelector<HTMLElement>('[data-view]')! : cover).focus({preventScroll:true});
  }
  listen(signal, cover, 'click',()=>change(true));
  listen(signal, close, 'click',()=>change(false));
  host.querySelectorAll('[data-home-open]').forEach(button => listen(signal, button, 'click', () => change(true)));
  host.querySelectorAll('[data-home-close]').forEach(button => listen(signal, button, 'click', () => change(false)));
  listen(signal, document, 'keydown',e=>{if(e.key==='Escape') change(false);});

  // A background tap must start and end outside the paper without moving.
  // Pointer capture from a book drag cannot turn its release into a close.
  const outside = (target: EventTarget | null) => target instanceof Element && !target.closest('.leaf, button, a, .topbar');
  let backgroundPress: {id: number; x: number; y: number} | null = null;
  listen(signal, document, 'pointerdown', e => {
    backgroundPress = opened && !busy && e.isPrimary && e.button === 0 && outside(e.target)
      ? {id:e.pointerId,x:e.clientX,y:e.clientY} : null;
  });
  listen(signal, document, 'pointermove', e => {
    if (backgroundPress && e.pointerId === backgroundPress.id && Math.hypot(e.clientX-backgroundPress.x,e.clientY-backgroundPress.y)>6) backgroundPress=null;
  });
  listen(signal, document, 'pointercancel',()=>{backgroundPress=null;});
  listen(signal, document, 'pointerup', e => {
    const press=backgroundPress;
    backgroundPress=null;
    if (press && e.pointerId===press.id && outside(e.target)) change(false);
  });

  return () => {
    abort.abort();
    host.dataset.homeReady = 'false';
    motion.destroy();
    document.body.classList.remove('is-open', 'is-transitioning');
  };
}
