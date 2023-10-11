<script lang="ts">
  import {
    Attribute,
    LazyTicker,
    Mark,
    createRenderGroup,
    curveEaseInOut,
  } from 'canvas-animation';
  import { onDestroy } from 'svelte';

  let canvas: HTMLCanvasElement;
  let markSet = createRenderGroup(
    new Array(100).fill(0).map(
      (_, i) =>
        new Mark(i, {
          x: new Attribute(Math.random() * 500),
          y: new Attribute(Math.random() * 500),
          color: new Attribute({ valueFn: getColor }),
        })
    )
  ).configure({
    animationDuration: 500,
    animationCurve: curveEaseInOut,
    lazyUpdates: true,
  });
  let ticker = new LazyTicker(markSet, draw);

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

  $: if (!!canvas) {
    draw();
  }

  onDestroy(() => ticker.stop());

  let colorIdx = 0;

  function getColor(): string {
    return colorIdx % 2 == 0 ? '#ff0000' : '#0000ff';
  }

  function animatePoints() {
    markSet
      .filter((mark, i) => i % 2 == 0)
      .animateTo('x', (mark) => (mark.attr('x') + 100) % 500)
      .wait('x')
      .then(() => {
        colorIdx++;
        markSet.animate('color');
      })
      .catch(() => {
        console.log('reject');
      });
    ticker.start();
  }
</script>

<main>
  <canvas width="500px" height="500px" bind:this={canvas} />
  <button on:click={animatePoints}>Animate</button>
</main>
