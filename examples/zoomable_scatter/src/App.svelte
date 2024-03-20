<script lang="ts">
  import {
    Attribute,
    Mark,
    createRenderGroup,
    curveEaseInOut,
    Scales,
    Ticker,
    markBox,
    centerOn,
  } from 'counterpoint-vis';
  import { onDestroy } from 'svelte';
  import * as d3 from 'd3';

  let canvas: HTMLCanvasElement;
  let scales = new Scales({ animationDuration: 500 })
    .xRange([0, 500])
    .yRange([0, 500])
    .onUpdate(() => {
      // When the scales update, we also need to let the d3 zoom object know that
      // the zoom transform has changed. Otherwise performing a zoom gesture after
      // a programmatic update will result in an abrupt transform change
      let sel = d3.select(canvas as Element);
      let currentT = d3.zoomTransform(canvas);
      let t = scales.transform();
      if (t.k != currentT.k || t.x != currentT.x || t.y != currentT.y) {
        sel.call(zoom.transform, new d3.ZoomTransform(t.k, t.x, t.y));
      }

      // for demo purposes, animate the color to show that the following behavior changed
      if (!scales.controller && zoomedIdxs.length > 0) {
        markSet.wait('color').then(() => {
          zoomedIdxs = [];
          markSet.animate('color', { delay: 2000 });
        });
      }
    });

  let markSet = createRenderGroup(
    new Array(100).fill(0).map(
      (_, i) =>
        new Mark(i, {
          x: new Attribute({
            value: Math.random(),
            transform: scales.xScale,
          }),
          y: new Attribute({
            value: Math.random(),
            transform: scales.yScale,
          }),
          color: new Attribute({
            valueFn: (m) => (zoomedIdxs.includes(m.id) ? '#7dd3fc' : '#9f1239'),
            lazy: true,
          }),
        })
    )
  ).configure({
    animationDuration: 500,
    animationCurve: curveEaseInOut,
  });

  let ticker = new Ticker([markSet, scales]).onChange(draw);

  // We use a d3 zoom object to simplify the gesture handling, but supply the
  // output transform to our Scales instance
  let zoom = d3
    .zoom()
    .scaleExtent([0.1, 10])
    .on('zoom', (e) => {
      // important to make sure the source event exists, filtering out our
      // programmatic changes
      if (e.sourceEvent != null) scales.transform(e.transform);
    });

  let zoomedIdxs: number[] = [];

  function draw() {
    console.log('drawing');
    if (!!canvas) {
      let ctx = canvas.getContext('2d');

      if (!!ctx) {
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.strokeStyle = 'white';
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
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;

    // set up the d3 zoom object
    d3.select(canvas as Element).call(zoom);

    draw();
  }

  onDestroy(() => ticker.stop());

  function animatePoints() {
    markSet
      .animateTo('x', (_) => Math.random(), { duration: 5000 })
      .animateTo('y', (_) => Math.random(), { duration: 5000 });
  }

  function resetZoom() {
    scales.reset(true);
    zoomedIdxs = [];
    markSet.animate('color');
  }

  function zoomToPoints() {
    // select two random points
    zoomedIdxs = [
      Math.round(Math.random() * markSet.count()),
      Math.round(Math.random() * markSet.count()),
    ];
    markSet.animate('color');
    scales.zoomTo(markBox(zoomedIdxs.map((i) => markSet.getMarkByID(i)!)));
  }

  function followPoints() {
    // select two random points
    zoomedIdxs = [
      Math.round(Math.random() * markSet.count()),
      Math.round(Math.random() * markSet.count()),
    ];
    markSet.animate('color');
    scales.follow(markBox(zoomedIdxs.map((i) => markSet.getMarkByID(i)!)));
  }

  function centerPoint() {
    zoomedIdxs = [Math.round(Math.random() * markSet.count())];
    markSet.animate('color');
    scales.follow(centerOn(markSet.getMarkByID(zoomedIdxs[0])!));
  }

  // This shows how basic zoom and pan can be implemented without d3 (only
  // click+drag and scroll wheel). Add the below methods as event listeners on
  // the canvas to use them

  /*let lastMousePos: [number, number] | null = null;

  function onMousedown(e: MouseEvent) {
    lastMousePos = [
      e.clientX - canvas.getBoundingClientRect().left,
      e.clientY - canvas.getBoundingClientRect().top,
    ];
  }

  function onMousemove(e: MouseEvent) {
    if (lastMousePos != null) {
      let newMousePos: [number, number] = [
        e.clientX - canvas.getBoundingClientRect().left,
        e.clientY - canvas.getBoundingClientRect().top,
      ];
      scales.translateBy(
        newMousePos[0] - lastMousePos[0],
        newMousePos[1] - lastMousePos[1]
      );
      lastMousePos = newMousePos;
      e.preventDefault();
    }
  }

  function onMouseup(e: MouseEvent) {
    lastMousePos = null;
  }

  function onMouseWheel(e: WheelEvent) {
    let ds = -0.01 * e.deltaY;

    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    scales.scaleBy(ds, [mouseX, mouseY]);

    e.preventDefault();
  }*/
</script>

<main>
  <canvas style="width: 500px; height: 500px;" bind:this={canvas} />
  <div>
    <button on:click={animatePoints}>Animate</button>
    <button on:click={centerPoint}>Center Random Point</button>
    <button on:click={zoomToPoints}>Zoom to 2 Points</button>
    <button on:click={followPoints}>Follow 2 Points</button>
    <button on:click={resetZoom}>Reset Zoom</button>
  </div>
  {#if zoomedIdxs.length > 0}
    <p>Selected indexes: {zoomedIdxs.join(', ')}</p>
  {/if}
</main>
