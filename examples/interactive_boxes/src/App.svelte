<script lang="ts">
  import {
    Ticker,
    Mark,
    curveEaseInOut,
    PositionMap,
    MarkRenderGroup,
  } from 'counterpoint-vis';
  import { onDestroy } from 'svelte';

  let canvas: HTMLCanvasElement;
  let hoveredID: number | null = null;
  let draggingID: number | null = null;
  const itemWidth = 25;

  let markSet = new MarkRenderGroup(
    new Array(50).fill(0).map(
      (_, i) =>
        new Mark(i, {
          x: Math.random() * 500,
          y: Math.random() * 500,
          strokeWidth: () => (hoveredID === i ? 4 : 1),
          width: () => itemWidth * (draggingID === i ? 1.2 : 1),
        })
    )
  )
    .configure({
      animationDuration: 200,
      animationCurve: curveEaseInOut,
      hitTest: (mark, location) => {
        let x = mark.attr('x'),
          y = mark.attr('y');
        return (
          Math.abs(location[0] - x) <= itemWidth * 0.5 &&
          Math.abs(location[1] - y) <= itemWidth * 0.5
        );
      },
    })
    .onEvent('mouseover', (mark) => (hoveredID = mark.id));

  let positionMap = new PositionMap({ maximumHitTestDistance: itemWidth }).add(
    markSet
  );
  let ticker = new Ticker(markSet).onChange(draw).onChange(() => {
    // We only want to update the position map when the coordinates change.
    if (markSet.changed(['x', 'y'])) {
      positionMap.invalidate();
    }
  });

  function draw() {
    if (!!canvas) {
      let ctx = canvas.getContext('2d');

      if (!!ctx) {
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '14pt sans-serif';
        markSet.forEach((mark) => {
          let x = mark.attr('x');
          let y = mark.attr('y');
          let w = mark.attr('width');
          ctx?.beginPath();
          ctx?.roundRect(x - w * 0.5, y - w * 0.5, w, w, w * 0.2);
          ctx!.lineWidth = mark.attr('strokeWidth');
          ctx!.strokeStyle = 'black';
          ctx!.fillStyle = '#fdfdfd';
          ctx?.fill();
          ctx?.stroke();
          ctx!.fillStyle = 'black';
          ctx?.fillText(mark.id, x, y);
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

  function animate() {
    markSet
      .animateTo('x', () => Math.random() * 500, { duration: 5000 })
      .animateTo('y', () => Math.random() * 500, { duration: 5000 });
  }

  let initialMousePos: [number, number] | null = null;

  function onMousedown(e: MouseEvent) {
    initialMousePos = [
      e.clientX - canvas.getBoundingClientRect().left,
      e.clientY - canvas.getBoundingClientRect().top,
    ];
    let nearest = positionMap.hitTest(initialMousePos);
    if (!!nearest) {
      draggingID = nearest.id;
      // Freeze the mark's x and y attributes in case they are animating. This
      // allows us to click and drag even while the nodes are moving
      let mark = markSet.get(draggingID)!;
      mark.setAttr('x', mark.attr('x')).setAttr('y', mark.attr('y'));
    }
  }

  function onMouseover(e: MouseEvent) {
    let mousePos: [number, number] = [
      e.clientX - canvas.getBoundingClientRect().left,
      e.clientY - canvas.getBoundingClientRect().top,
    ];
    if (initialMousePos != null) {
      // clicking and dragging - update the dragging mark's location
      if (draggingID != null) {
        let mark = markSet.get(draggingID)!;
        mark
          .setAttr('x', mark.attr('x') + mousePos[0] - initialMousePos[0])
          .setAttr('y', mark.attr('y') + mousePos[1] - initialMousePos[1]);
      }
      initialMousePos = mousePos;
    } else {
      // just hovering - this may potentially regenerate the position map every
      // frame if the marks are animating, so to save time we could disable
      // hover interactions when markSet.marksAnimating() is true
      if (!positionMap.dispatchAt(mousePos, 'mouseover')) hoveredID = null;
    }
  }

  function onMouseup(e: MouseEvent) {
    initialMousePos = null;
    draggingID = null;
  }

  // increase stroke width on hover with animation
  $: hoveredID, markSet.animate('strokeWidth');
  // increase node size on drag with animation
  $: draggingID, markSet.animate('width');
</script>

<main>
  <canvas
    style="width: 500px; height: 500px;"
    bind:this={canvas}
    on:mousedown={onMousedown}
    on:mousemove={onMouseover}
    on:mouseup={onMouseup}
  />
  <button on:click={animate}>Shuffle</button>
  <p>
    Click and drag to move a node around. (Try moving a node right after
    clicking Shuffle!)
  </p>
</main>
