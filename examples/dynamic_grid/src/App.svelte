<script lang="ts">
  import {
    Attribute,
    Mark,
    MarkRenderGroup,
    StageManager,
    Ticker,
    curveEaseInOut,
  } from 'counterpoint-vis';
  import { onDestroy } from 'svelte';

  const cellWidth = 25;

  let canvas: HTMLCanvasElement;
  let markSet = new MarkRenderGroup<{
    x: Attribute<number>;
    y: Attribute<number>;
    alpha: Attribute<number>;
    color: Attribute<string>;
  }>(
    (id) =>
      new Mark(id, {
        x: new Attribute(0),
        y: new Attribute(0),
        alpha: new Attribute(0.0),
        color: new Attribute(
          `hsl(${Math.round(Math.random() * 360)}, 75%, 75%)`
        ),
      })
  )
    .configure({
      animationDuration: 500,
      animationCurve: curveEaseInOut,
    })
    .configureStaging({
      enter: async (element) =>
        element.animateTo('alpha', 1.0, { duration: 500 }).wait('alpha'),
      exit: async (element) =>
        element.animateTo('alpha', 0.0, { duration: 500 }).wait('alpha'),
    });

  let ticker = new Ticker(markSet).onChange(draw);

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
        markSet.stage!.forEach((mark) => {
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
    if (markSet.has(cellID)) markSet.hideID(cellID);
    else
      markSet.showID(cellID, (mark) =>
        mark.setAttr('x', roundedLocation.x).setAttr('y', roundedLocation.y)
      );
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
