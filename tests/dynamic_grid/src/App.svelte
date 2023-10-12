<script lang="ts">
  import {
    Attribute,
    Mark,
    MarkRenderGroup,
    StageManager,
    Ticker,
    curveEaseInOut,
  } from 'canvas-animation';
  import { onDestroy } from 'svelte';

  const cellWidth = 25;

  let canvas: HTMLCanvasElement;
  let markSet = new MarkRenderGroup<{
    x: Attribute<number>;
    y: Attribute<number>;
    alpha: Attribute<number>;
    color: Attribute<string>;
  }>().configure({
    animationDuration: 500,
    animationCurve: curveEaseInOut,
    lazyUpdates: true,
  });
  let stager = new StageManager({
    create: (id, info) =>
      new Mark(id, {
        x: new Attribute(info.x as number),
        y: new Attribute(info.y as number),
        alpha: new Attribute(0.0),
        color: new Attribute(
          `hsl(${Math.round(Math.random() * 360)}, 75%, 75%)`
        ),
      }),
    show: (mark) =>
      mark.animateTo('alpha', 1.0, { duration: 500 }).wait('alpha'),
    hide: (mark) =>
      mark.animateTo('alpha', 0.0, { duration: 500 }).wait('alpha'),
  }).attach(markSet);

  let ticker = new Ticker(markSet, draw);

  function draw() {
    if (!!canvas) {
      let ctx = canvas.getContext('2d');

      if (!!ctx) {
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.fillStyle = '#3388ff';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.0;
        markSet.forEach((mark) => {
          let x = mark.attr('x');
          let y = mark.attr('y');
          let color = mark.attr('color');
          ctx!.globalAlpha = mark.attr('alpha');
          ctx!.fillStyle = color;
          ctx?.beginPath();
          ctx?.rect(x, y, cellWidth, cellWidth);
          ctx?.fill();
          ctx?.stroke();
          ctx?.closePath();
        });
      }
    }
  }

  $: if (!!canvas) {
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    draw();
  }

  onDestroy(() => ticker.stop());

  function onClick(event: MouseEvent) {
    let location = {
      x: event.pageX - canvas.getBoundingClientRect().left,
      y: event.pageY - canvas.getBoundingClientRect().top,
    };
    let roundedLocation = {
      x: Math.floor(location.x / cellWidth) * cellWidth,
      y: Math.floor(location.y / cellWidth) * cellWidth,
    };
    let cellID =
      (roundedLocation.x / cellWidth) * 500 + roundedLocation.y / cellWidth;
    // toggle visibility
    if (stager.isVisible(cellID)) stager.hide(cellID);
    else stager.show(cellID, roundedLocation);
  }
</script>

<div>Click to show/hide colored squares</div>
<canvas
  style="width: 100vw; height: 500px;"
  bind:this={canvas}
  on:click={onClick}
/>

<style>
  :global(body) {
    margin: 0;
  }
</style>
