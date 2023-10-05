<script lang="ts">
  import {
    Attribute,
    Mark,
    MarkSet,
    curveEaseInOut,
    interpolateTo,
    type MarkAttributes,
  } from 'canvas-animation';

  let canvas: HTMLCanvasElement;
  let markSet: MarkSet = new MarkSet([
    new Mark(1, {
      x: new Attribute(100),
      y: new Attribute(100),
    }),
    new Mark(1, {
      x: new Attribute(400),
      y: new Attribute(400),
    }),
  ]);

  let lastDrawTime: number | undefined = undefined;

  function draw() {
    if (!!canvas) {
      let ctx = canvas.getContext('2d');

      if (!!ctx) {
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.fillStyle = '#9999ff40';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1.0;
        markSet.forEach((mark: Mark<MarkAttributes>) => {
          let x = mark.attr('x');
          let y = mark.attr('y');
          ctx?.beginPath();
          ctx?.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI, false);
          ctx?.fill();
          ctx?.stroke();
          ctx?.closePath();
        });
      }
    }
  }

  function animationCallback(t: number) {
    if (lastDrawTime === undefined) {
      lastDrawTime = window.performance.now();
    }
    if (markSet.advance(t - lastDrawTime)) {
      draw();
    }
    requestAnimationFrame(animationCallback);
    lastDrawTime = t;
  }

  $: if (!!canvas) {
    draw();
    animationCallback(window.performance.now());
  }

  function animatePoints() {
    markSet.animateAll(
      'x',
      (mark) => interpolateTo((mark.attr('x') + 100) % 500),
      500,
      curveEaseInOut
    );
    animationCallback(window.performance.now());
  }
</script>

<main>
  <canvas width="500px" height="500px" bind:this={canvas} />
  <button on:click={animatePoints}>Animate</button>
</main>
