<script lang="ts">
  import {
    Attribute,
    Ticker,
    Mark,
    createRenderGroup,
    curveEaseInOut,
  } from 'canvas-animation';
  import createREGL from 'regl';
  import { onDestroy } from 'svelte';
  import { getCoordinate } from './point_layouts';

  let pointLayout: 'random' | 'gaussian' | 'gradient' = 'random';

  let canvas: HTMLCanvasElement;
  let markSet = createRenderGroup(
    new Array(100000).fill(0).map(
      (_, i) =>
        new Mark(i, {
          x: new Attribute({
            valueFn: (m) => getCoordinate(pointLayout, 'x'),
            lazy: true, // this ensures that we don't recompute coordinates every frame, since our coordinates are random
          }),
          y: new Attribute({
            valueFn: (m) => getCoordinate(pointLayout, 'y'),
            lazy: true,
          }),
        })
    )
  )
    .configure({
      animationDuration: 2000,
      animationCurve: curveEaseInOut,
      lazyUpdates: true, // this ensures that our updateBuffers command doesn't run every frame
    })
    .registerPreloadableProperty('x')
    .registerPreloadableProperty('y');
  let regl: any;
  let drawDots: Function;
  // we will only update these buffers when the preload attributes change
  let xBuffer: any;
  let yBuffer: any;

  let ticker = new Ticker(markSet, updateBuffers);

  $: if (!!canvas && !regl) {
    regl = createREGL(canvas);
    xBuffer = regl.buffer(markSet.count() * 4);
    yBuffer = regl.buffer(markSet.count() * 4);

    drawDots = regl({
      frag: `
        precision mediump float;
        uniform vec4 color;
        void main () {
          vec2 cxy = 2.0 * gl_PointCoord - 1.0;
          if (dot(cxy, cxy) > 0.8) {
            discard;
          }
          gl_FragColor = color;
        }`,

      vert: `
        precision mediump float;
        attribute vec4 x;
        attribute vec4 y;
        uniform float currentTime;
        uniform float radius;

        void animate(in vec4 attrib, out float interpolatedValue) {
          float t = clamp(
            (attrib.w - attrib.z >= 0.001) ? (currentTime - attrib.z) / (attrib.w - attrib.z) : 0.0,
            0.0,
            1.0
          );
          t = t * t * (3.0 - 2.0 * t);
          interpolatedValue = attrib.y * t + attrib.x * (1.0 - t);
        }

        void main () {
          gl_PointSize = radius * 2.0;
          float finalX, finalY;
          animate(x, finalX);
          animate(y, finalY);
          gl_Position = vec4(finalX, finalY, 0, 1);
        }`,

      attributes: {
        x: xBuffer,
        y: yBuffer,
      },
      uniforms: {
        color: [0.73, 0.97, 0.82, 1.0],
        radius: regl.prop('radius'),
        currentTime: regl.prop('currentTime'),
      },
      count: markSet.count(),
      primitive: 'points',
    });

    updateBuffers();

    // Clear and redraw every frame
    regl.frame(() => {
      regl.clear({
        color: [0.12, 0.16, 0.23, 1.0],
        depth: 1,
      });
      drawDots({
        radius: 2.0,
        currentTime: markSet.currentTime(),
      });
    });
  }

  function updateBuffers() {
    if (!canvas || !regl) return;
    console.log('updating buffers');

    xBuffer(
      markSet
        .map((mark) => {
          let x = mark.attributes['x'].getPreload();
          return [x.start, x.end, x.startTime, x.endTime];
        })
        .flat()
    );
    yBuffer(
      markSet
        .map((mark) => {
          let y = mark.attributes['y'].getPreload();
          return [y.start, y.end, y.startTime, y.endTime];
        })
        .flat()
    );
  }

  $: if (!!canvas) {
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  }

  onDestroy(() => ticker.stop());

  function animatePoints(newLayout: typeof pointLayout) {
    pointLayout = newLayout;
    markSet.animate('x').animate('y');
  }
</script>

<main>
  <canvas
    style="width: 100vw; height: calc(100vh - 40px);"
    bind:this={canvas}
  />
  <button on:click={() => animatePoints('random')}>Random</button>
  <button on:click={() => animatePoints('gaussian')}>Gaussian</button>
  <button on:click={() => animatePoints('gradient')}>Gradient</button>
</main>

<style>
  :global(body) {
    margin: 0;
  }
</style>
