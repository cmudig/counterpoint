<script lang="ts">
  import {
    Ticker,
    curveEaseInOut,
    MarkRenderGroup,
    Mark,
    AttributeRecompute,
    PositionMap,
    Attribute,
    Animator,
    interpolateTo,
    curveLinear,
  } from 'counterpoint-vis';
  import * as d3 from 'd3';
  import { onDestroy, onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let width = 1000;
  let height = 500;
  const simulationWidth = 2000;
  const simulationHeight = 700;
  const gutter = 100;
  const pointSize = 3;
  let numPoints = 1000;

  let nodes = new Array(numPoints).fill(0).map((_, i) => ({
    x: Math.random() * simulationWidth,
    y: Math.random() * simulationHeight,
  }));
  let markSet = new MarkRenderGroup(
    nodes.map(
      (n, i) =>
        new Mark(i, {
          x: {
            value: n.x,
            transform: (v: number) => {
              let x = xOffset.get() + v;
              return ((x + gutter) % (simulationWidth + gutter * 2)) - gutter;
            },
          },
          y: n.y,
          color: {
            value: `hsl(${Math.random() * 360}, 90%, 70%)`,
            recompute: AttributeRecompute.WHEN_UPDATED,
          },
          radius: pointSize,
          alpha: 1.0,
        })
    )
  ).configure({
    animationDuration: 2000,
    animationCurve: curveEaseInOut,
  });
  let xOffset = new Attribute(simulationWidth + gutter);
  let positionMap = new PositionMap().add(markSet);
  markSet.forEach((m) =>
    m.adj(
      'neighbors',
      positionMap
        .marksNear([m.attr('x'), m.attr('y')], 100)
        .slice(0, Math.floor(Math.random() * 14) + 5)
        .filter((n, i) => n.id > m.id && (i == 0 || Math.random() < 0.5))
    )
  );
  let ticker = new Ticker([markSet, xOffset]).onChange(draw);

  function draw() {
    if (!!canvas) {
      let ctx = canvas.getContext('2d');

      if (!!ctx) {
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.fillStyle = '#225';
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.translate(0, -(simulationHeight - height) * 0.5);
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 1.0;
        ctx.globalAlpha = 0.3;
        let xo = xOffset.get();
        // Draw edges
        markSet.stage!.forEach((mark) => {
          let x = mark.attr('x');
          let y = mark.attr('y');
          ctx?.beginPath();
          mark.adj('neighbors').forEach((neighbor) => {
            let nx = neighbor.attr('x');
            let ny = neighbor.attr('y');
            if (
              Math.max(Math.abs(nx - x), Math.abs(ny - y)) >
              simulationHeight * 0.5
            )
              return;
            ctx?.moveTo(x, y);
            ctx?.lineTo(nx, ny);
          });

          [...mark.adj('neighbors'), ...mark.sourceMarks()].forEach(
            (neighbor) => {
              // start an animation on radius
              if (
                !mark.changed('radius') &&
                neighbor.attr('radius') > pointSize * 1.2
              ) {
                pulsateMark(
                  mark,
                  neighbor.attributes['radius'].future() * 0.95
                );
              }
            }
          );
          ctx?.stroke();
          ctx?.closePath();
        });
        ctx.globalAlpha = 1.0;

        markSet.stage!.forEach((mark) => {
          ctx?.save();
          let x = mark.attr('x');
          let y = mark.attr('y');
          let r = mark.attr('radius');
          let color = mark.attr('color');
          ctx!.globalAlpha = mark.attr('alpha');
          ctx!.fillStyle = color;
          ctx?.beginPath();
          ctx?.ellipse(x, y, r, r, 0, 0, 2 * Math.PI, false);
          ctx?.fill();
          ctx?.stroke();
          ctx?.closePath();
          ctx?.restore();
        });
      }
    }
  }

  let simulation: d3.Simulation<{ x: number; y: number }, undefined> | null =
    null;
  let currentTick = 0;

  async function pan() {
    await xOffset
      .animate(
        new Animator(
          interpolateTo(-gutter),
          ((simulationWidth + gutter) / 1000) * 20000,
          curveLinear
        )
      )
      .wait();
    xOffset.set(simulationWidth + gutter);
    pan();
  }

  async function pulsateMark(mark: Mark, radius: number) {
    try {
      await mark.animateTo('radius', radius, { duration: 200 }).wait('radius');
      mark.animateTo('radius', pointSize, { duration: 500 });
    } catch (e) {}
  }

  onMount(() => {
    pan();
    if (!!simulation) simulation.stop();
    simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(
            markSet
              .map((m) =>
                m.adj('neighbors').map((n) => ({ source: m.id, target: n.id }))
              )
              .flat()
          )
          .distance(simulationHeight * 0.1)
          .strength(2)
      )
      .force(
        'center',
        d3.forceCenter(simulationWidth / 2, simulationHeight / 2)
      )
      .force('collide', d3.forceCollide(pointSize * 2))
      .force('repel', d3.forceManyBody().strength(-2))
      .on('tick', () => {
        currentTick += 1;
        if (!markSet.changed('x')) {
          markSet
            .animateTo('x', (_, i) => nodes[i].x)
            .animateTo('y', (_, i) => nodes[i].y);
          nodes.forEach((n) => {
            n.x +=
              Math.random() * simulationHeight * 0.2 - simulationHeight * 0.1;
            n.y +=
              Math.random() * simulationHeight * 0.2 - simulationHeight * 0.1;
          });
        }
        if (currentTick % 100 == 0) {
          simulation?.alphaDecay(0);
        }
      });

    new ResizeObserver(() => {
      if (!canvas) return;
      console.log('resizing', canvas.offsetWidth);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      draw();
    }).observe(canvas);
  });
  onDestroy(() => {
    ticker.stop();
    simulation?.stop();
  });

  function mouseover(e: MouseEvent) {
    let pos = [
      e.clientX - canvas.getBoundingClientRect().left,
      e.clientY - canvas.getBoundingClientRect().top,
    ];
    positionMap.invalidate();
    let closestMarks = positionMap.marksNear(pos, pointSize * 5);
    if (closestMarks.length >= 1) {
      if (!closestMarks[0].changed('radius'))
        pulsateMark(closestMarks[0], pointSize * 2.5);
    }
  }
</script>

<main>
  <canvas
    style="width: 100%; height: 500px;"
    bind:this={canvas}
    on:mousemove={mouseover}
  />
</main>
