<script lang="ts">
  import {
    Ticker,
    curveEaseInOut,
    MarkRenderGroup,
    Mark,
    AttributeRecompute,
    PositionMap,
  } from 'counterpoint-vis';
  import * as d3 from 'd3';
  import { onDestroy, onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let width = 1000;
  let height = 600;
  const simulationWidth = 1000;
  const simulationHeight = 600;
  const pointSize = 3;
  let numPoints = 1000;
  let hoveredID: number | null = null;

  // create randomly-positioned graph nodes
  let nodes = new Array(numPoints).fill(0).map((_, i) => ({
    x: Math.random() * simulationWidth,
    y: Math.random() * simulationHeight,
  }));

  // create a mark render group, which contains information about how these nodes will be drawn.
  // each node will be represented as a Mark attribute with position, color, and radius
  // attributes.
  let markSet = new MarkRenderGroup(
    nodes.map(
      (n, i) =>
        new Mark(i, {
          x: n.x,
          y: n.y,
          color: {
            value: `hsl(${Math.random() * 360}, 90%, 70%)`,
            recompute: AttributeRecompute.WHEN_UPDATED,
          },
          // computed function for radius so that only the hovered point will be large
          radius: () => (hoveredID == i ? pointSize * 2 : pointSize),
          alpha: 1.0,
        })
    )
  ).configure({
    // configure defaults for animation
    animationDuration: 1000,
    animationCurve: curveEaseInOut,
    // the hit-test function determines whether a given location falls inside
    // a mark or not, which will be used for mouseover interactions
    hitTest(mark, location) {
      return (
        Math.sqrt(
          Math.pow(mark.attr('x') - location[0], 2.0) +
            Math.pow(mark.attr('y') - location[1], 2.0)
        ) <=
        mark.attr('radius') * 2
      );
    },
  });

  // a position map helps us reverse-lookup marks by position so we can check
  // what node was hovered on
  let positionMap = new PositionMap({
    maximumHitTestDistance: pointSize * 4,
  }).add(markSet);

  // use the adj() method to represent node edges (these are random for demo purposes)
  markSet.forEach((m) =>
    m.adj(
      'neighbors',
      positionMap
        .marksNear([m.attr('x'), m.attr('y')], 100)
        .slice(0, Math.floor(Math.random() * 14) + 5)
        .filter((n, i) => n.id > m.id && (i == 0 || Math.random() < 0.5))
    )
  );

  // the ticker makes sure our draw function will get called whenever the marks change
  let ticker = new Ticker(markSet).onChange(() => {
    // since the marks may have moved, tell the position map that its positions aren't valid anymore
    positionMap.invalidate();
    draw();
  });

  function draw() {
    if (!!canvas) {
      let ctx = canvas.getContext('2d');

      if (!!ctx) {
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 1.0;
        ctx.globalAlpha = 0.3;
        // Draw edges
        markSet.stage!.forEach((mark) => {
          let x = mark.attr('x');
          let y = mark.attr('y');
          ctx?.beginPath();
          mark.adj('neighbors').forEach((neighbor) => {
            let nx = neighbor.attr('x');
            let ny = neighbor.attr('y');
            ctx?.moveTo(x, y);
            ctx?.lineTo(nx, ny);
          });

          ctx?.stroke();
          ctx?.closePath();
        });
        ctx.globalAlpha = 1.0;

        // Draw node circles
        markSet.stage!.forEach((mark) => {
          ctx?.save();
          let { x, y, radius, color, alpha } = mark.get();
          ctx!.globalAlpha = alpha;
          ctx!.fillStyle = color;
          ctx?.beginPath();
          ctx?.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI, false);
          ctx?.fill();
          ctx?.stroke();
          ctx?.closePath();
          ctx?.restore();
        });
      }
    }
  }

  // use a d3 force simulation to optimize the layout
  let simulation: d3.Simulation<{ x: number; y: number }, undefined> | null =
    null;
  let currentTick = 0;

  onMount(() => {
    if (!!simulation) simulation.stop();
    // for the d3 simulation, this defines the forces that will push the nodes
    // to the final positions, including pulling connected nodes closer, centering
    // the graph, preventing collisions, and generally repelling nodes
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
          .distance(pointSize * 10)
          .strength(2)
      )
      .force(
        'center',
        d3.forceCenter(simulationWidth / 2, simulationHeight / 2).strength(0.1)
      )
      .force('x', d3.forceX(simulationWidth * 0.5).strength(0.01))
      .force('y', d3.forceY(simulationHeight * 0.5).strength(0.01))
      .force('collide', d3.forceCollide(pointSize * 2))
      .force('repel', d3.forceManyBody().strength(-1))
      .alphaDecay(0.01)
      .on('tick', () => {
        currentTick += 1;
        if (!markSet.changed('x'))
          markSet
            .animateTo('x', (_, i) => nodes[i].x)
            .animateTo('y', (_, i) => nodes[i].y);
      });

    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    draw();
  });

  // clean up when the view is deleted
  onDestroy(() => {
    ticker.stop();
    simulation?.stop();
  });

  function mouseover(e: MouseEvent) {
    // find the mark the user is hovering on and increase its radius
    let pos = [
      e.clientX - canvas.getBoundingClientRect().left,
      e.clientY - canvas.getBoundingClientRect().top,
    ];
    let closestMark = positionMap.hitTest(pos);
    if ((closestMark?.id ?? null) !== hoveredID) {
      hoveredID = closestMark?.id ?? null;
      markSet.animate('radius', { duration: 200 });
    }
  }
</script>

<main>
  <canvas
    style="width: {width}px; height: {height}px;"
    bind:this={canvas}
    on:mousemove={mouseover}
  />
</main>
