<script lang="ts">
  import {
    Attribute,
    Mark,
    MarkRenderGroup,
    curveEaseInOut,
    interpolateTo,
  } from 'canvas-animation';

  let canvas: HTMLCanvasElement;
  let markSet = new MarkRenderGroup(
    new Array(100).fill(0).map(
      (_, i) =>
        new Mark(i, {
          x: new Attribute(Math.random() * 500),
          y: new Attribute(Math.random() * 500),
          color: new Attribute('#ff0000'),
        })
    )
  ).configure({
    animationDuration: 500,
    animationCurve: curveEaseInOut,
  });

  let lastDrawTime: number | undefined = undefined;

  function draw() {
    if (!!canvas) {
      let ctx = canvas.getContext('2d');

      if (!!ctx) {
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.fillStyle = '#9999ff40';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1.0;
        markSet.forEach((mark) => {
          let x = mark.attr('x');
          let y = mark.attr('y');
          let color = mark.attr('color');
          ctx!.fillStyle = color;
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

  let colorIdx = 0;

  function getColor(mark: (typeof markSet)['marks'][number]) {
    return colorIdx % 2 == 0 ? '#ff0000' : '#0000ff';
  }

  function animatePoints() {
    colorIdx++;
    markSet
      .animateTo('x', (mark) => (mark.attr('x') + 100) % 500)
      .animateTo('color', (mark) => getColor);
    animationCallback(window.performance.now());
  }
</script>

<main>
  <canvas width="500px" height="500px" bind:this={canvas} />
  <button on:click={animatePoints}>Animate</button>
</main>
