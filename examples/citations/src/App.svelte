<script lang="ts">
  import {
    Mark,
    Scales,
    Ticker,
    markBox,
    MarkRenderGroup,
    PositionMap,
    Attribute,
  } from 'counterpoint-vis';
  import { onDestroy, onMount } from 'svelte';
  import * as d3 from 'd3';
  import dataUrl from './assets/papers.json?url';
  import { PaperDataset, type Paper } from './papers';

  const pointSize = 1;
  const simulationDimension = 800;
  const ZoomPadding = 100;

  let dataset: PaperDataset;

  type NetworkMarkAttrs = {
    x: Attribute<number>;
    y: Attribute<number>;
    radius: Attribute<number>;
    alpha: Attribute<number>;
    entranceProgress: Attribute<number>;
    color: Attribute<string, number>;
    strokeWidth: Attribute<number>;
  };

  type EdgeMarkAttrs = {
    entranceProgress: Attribute<number>;
    strokeWidth: Attribute<number>;
    color: Attribute<string>;
    alpha: Attribute<number>;
  };

  let canvas: HTMLCanvasElement;
  let scales = new Scales({ animationDuration: 500, padding: 100 })
    .xDomain([0, simulationDimension])
    .yDomain([0, simulationDimension])
    .xRange([0, simulationDimension])
    .yRange([0, simulationDimension])
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
      if (!!positionMap) positionMap.invalidate();
    });
  let colorScale = d3.scaleSequential(d3.interpolateMagma);

  let markSet: MarkRenderGroup<NetworkMarkAttrs>;
  let lineSet: MarkRenderGroup<EdgeMarkAttrs>;
  let positionMap: PositionMap;
  let currentYear: number;
  let minYear: number, maxYear: number;
  let hoveredID: string | null = null;
  let selectedID: string | null = null;
  let selectionSubgraph: Set<string> = new Set();
  let selectionPaths: { [key: string]: string } | null = null;
  let hoverSelectionPathID: string | null = null;

  let selectForwardCitations: boolean = true; // if false, show backward references

  let hoverPos: [number, number] | null = null;

  let ticker: Ticker;

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

  function draw() {
    if (!!canvas && !!markSet) {
      console.log('drawing');
      let ctx = canvas.getContext('2d');

      if (!!ctx) {
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 1.0;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.globalAlpha = 0.8;
        lineSet.stage!.forEach((line, i) => {
          let marks: Mark<NetworkMarkAttrs>[] = line.represented.map(
            (id: string) => markSet.stage?.get(id)
          );
          if (marks.some((m) => !m)) return;
          let entranceProgress =
            line.attr('entranceProgress') *
            marks.reduce(
              (prev, curr) => prev * curr.attr('entranceProgress'),
              1
            );
          if (entranceProgress == 0) return;
          ctx?.save();
          ctx?.beginPath();
          let xs = marks.map((m) => m.attr('x')),
            ys = marks.map((m) => m.attr('y'));
          ctx!.strokeStyle = line.attr('color');
          ctx!.lineWidth = line.attr('strokeWidth');
          ctx!.globalAlpha = line.attr('alpha');
          let segment = Math.ceil(entranceProgress * (marks.length - 1));
          let segmentProgress =
            (entranceProgress - (segment - 1) / (marks.length - 1)) /
            (1 / (marks.length - 1));
          ctx?.moveTo(xs[0], ys[0]);
          for (let i = 1; i < segment + 1; i++) {
            if (i == segment)
              ctx?.lineTo(
                xs[i - 1] + (xs[i] - xs[i - 1]) * segmentProgress,
                ys[i - 1] + (ys[i] - ys[i - 1]) * segmentProgress
              );
            else ctx?.lineTo(xs[i], ys[i]);
          }
          ctx?.stroke();
          ctx?.closePath();
          ctx?.restore();
        });

        ctx.globalAlpha = 1.0;
        markSet.stage!.forEach((mark, i) => {
          ctx?.beginPath();
          let { x, y, radius, entranceProgress, alpha, color, strokeWidth } =
            mark.get();
          ctx?.ellipse(
            x,
            y,
            radius * entranceProgress,
            radius * entranceProgress,
            0,
            0,
            2 * Math.PI,
            false
          );
          if (hoveredID == mark.id) hoverPos = [x, y];
          ctx!.globalAlpha = alpha * entranceProgress;
          ctx!.strokeStyle = color;
          ctx!.lineWidth = 1.0;
          ctx?.stroke();
          ctx!.globalAlpha = alpha * entranceProgress * 0.4;
          ctx!.fillStyle = color;
          ctx?.fill();
          ctx?.closePath();
          if (strokeWidth > 0) {
            ctx?.beginPath();
            ctx?.ellipse(
              x,
              y,
              (radius + strokeWidth) * entranceProgress,
              (radius + strokeWidth) * entranceProgress,
              0,
              0,
              2 * Math.PI,
              false
            );
            ctx!.globalAlpha = 1.0;
            ctx!.strokeStyle = 'steelblue';
            ctx!.lineWidth = strokeWidth;
            ctx?.stroke();
            ctx?.closePath();
          }
        });
      }
    }
  }

  onDestroy(() => ticker.stop());

  let simulation: d3.Simulation<{ paper: Paper; x: number; y: number }, any>;

  function getRadius(node: Paper) {
    return (
      (currentYear < node.year
        ? 0
        : pointSize +
          Math.sqrt(1 + node.numCitations[currentYear - node.year]) * 2) *
      (hoveredID == node.id ? 1.5 : 1)
    );
  }

  function getAlpha(m: Mark): number {
    let base =
      selectedID != null ? (selectionSubgraph.has(m.id) ? 1.0 : 0.1) : 1.0;
    return base;
    // return hoveredID != null
    //   ? m.id == hoveredID
    //     ? 1.0
    //     : Math.min(base, 0.5)
    //   : base;
  }

  $: if (!!canvas && !!markSet) {
    console.log('setting up canvas');
    // set up the d3 zoom object
    d3.select(canvas as Element)
      .on('mousemove', handleMouseover)
      .on('mouseleave', () => (hoveredID = null))
      .on('click', handleClick)
      .call(zoom);

    draw();
  }

  function makeMark(d: Paper) {
    return new Mark<NetworkMarkAttrs>(d.id, {
      x: {
        valueFn: (v) => v.represented.x,
        transform: scales.xScale,
      },
      y: {
        valueFn: (v) => v.represented.y,
        transform: scales.yScale,
      },
      radius: {
        valueFn: (v) => getRadius(v.represented.paper),
        transform: (v: number) =>
          Math.max(
            1,
            (v *
              scales.transform().k *
              Math.min(canvas.offsetWidth, canvas.offsetHeight)) /
              simulationDimension
          ),
      },
      color: {
        value: d.year,
        transform: (v) => colorScale(v) as string,
        cacheTransform: true,
      },
      strokeWidth: (m) => (selectedID != null && selectedID == m.id ? 2.0 : 0),
      alpha: getAlpha,
      entranceProgress: 0,
    }).representing({
      paper: d,
      x: d.x * simulationDimension,
      y: d.y * simulationDimension,
    });
  }

  function setupSimulation() {
    let alpha = 0.001;
    let minAlpha = 0.0001;
    if (!!simulation) {
      simulation.stop();
      // preserve previous simulation's alpha if still running
      if (simulation.alpha() > minAlpha) alpha = simulation.alpha();
    }

    let nodes = markSet.map((m) => m.represented);
    console.log(nodes);
    simulation = d3
      .forceSimulation(nodes)
      .force(
        'collide',
        d3.forceCollide((n) => getRadius(n.paper) + 1).strength(0.1)
      )
      .alpha(alpha)
      .alphaDecay(0.0005)
      .alphaMin(minAlpha)
      .on('tick', () => {
        markSet.update('x').update('y');
        positionMap.invalidate();
      });
  }

  let oldYear: number;
  $: if (!!dataset && oldYear !== currentYear) {
    // add and remove marks
    dataset.getPapers().forEach((d) => {
      if (d.year <= currentYear) {
        let existingMark = markSet.stage?.get(d.id);
        if (!markSet.has(d.id)) markSet.addMark(existingMark ?? makeMark(d));
        if (!!existingMark) {
          existingMark.animate('radius');
        }
      } else if (d.year > currentYear && markSet.has(d.id)) {
        markSet.delete(d.id);
      }
    });
    // setupSimulation();
    if (!!simulation) simulation.stop();
    markSet.wait(['x', 'y']).then(setupSimulation);

    if (!!selectedID) {
      let mark = markSet.get(selectedID);
      if (!mark || mark.represented.paper?.year > currentYear) {
        selectedID = null;
      } else {
        scales.zoomTo(
          markBox(
            markSet.filter((m) => selectionSubgraph.has(m.id)).getMarks(),
            {
              padding: ZoomPadding,
            }
          )
        );
      }
    }
    oldYear = currentYear;
    positionMap.invalidate();
  }

  let resizeObserver;

  onMount(async () => {
    let result = await (await fetch(dataUrl)).json();
    dataset = new PaperDataset(result.data);
    minYear = result.min_year;
    maxYear = result.max_year;
    colorScale = colorScale.domain([minYear, maxYear]);
    console.log(
      dataset,
      minYear,
      maxYear,
      colorScale.domain(),
      colorScale(2000)
    );
    currentYear = minYear;

    markSet = new MarkRenderGroup<NetworkMarkAttrs>()
      .configure({
        animationDuration: 200,
        hitTest: (mark, location) => {
          let radius = mark.attr('radius');
          return (
            Math.abs(location[0] - mark.attr('x')) <= radius + 20 &&
            Math.abs(location[1] - mark.attr('y')) <= radius + 20
          );
        },
      })
      .configureStaging({
        initialize: (mark) =>
          mark
            .setAttr('entranceProgress', 0)
            .setAttr('radius', (v) => getRadius(v.represented.paper)),
        enter: (mark) =>
          mark
            .animateTo('entranceProgress', 1, {
              duration: 500,
            })
            .wait(['entranceProgress']),
        exit: (mark) =>
          mark
            .freeze('radius') // needed to prevent radius from changing with the year
            .animateTo('entranceProgress', 0, { duration: 500 })
            .wait(['entranceProgress']),
      });
    lineSet = new MarkRenderGroup<EdgeMarkAttrs>()
      .configure({ animationDuration: 1000 })
      .configureStaging({
        initialize: (line) => line.setAttr('entranceProgress', 0),
        enter: (line) =>
          line
            .animateTo('entranceProgress', 1)
            .animateTo('alpha', 1)
            .wait(['entranceProgress', 'alpha']),
        exit: (line) =>
          line
            .freeze('entranceProgress')
            .animateTo('alpha', 0, { duration: 200 })
            .wait('alpha'),
      });
    positionMap = new PositionMap({ maximumHitTestDistance: 50 }).add(markSet);
    ticker = new Ticker([markSet, lineSet, scales]).onChange(draw);

    setupSimulation();

    resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;

      scales
        .xDomain([0, simulationDimension])
        .yDomain([0, simulationDimension])
        .xRange([0, canvas.offsetWidth])
        .yRange([0, canvas.offsetHeight])
        .makeSquareAspect()
        .zoomTo(
          markBox(
            dataset.getPapers().map((d) => makeMark(d)),
            { padding: ZoomPadding }
          ),
          false
        );
    });
    resizeObserver.observe(canvas);
  });

  onDestroy(() => {
    if (!!simulation) simulation.stop();
    if (!!ticker) ticker.stop();
  });

  function selectNode(mark: Mark<NetworkMarkAttrs>, forward: boolean = true) {
    // populate the selected subgraph with this paper, its references, and the
    // papers that cite it
    selectedID = mark.id;
    selectionSubgraph = new Set([selectedID!]);
    selectionPaths = dataset.getForwardCitationPaths([selectedID!]);
    console.log('paths', selectionPaths);
    let forwardCites = new Set(Object.keys(selectionPaths));
    forwardCites.forEach((id) => selectionSubgraph.add(id));

    scales.zoomTo(
      markBox(markSet.filter((m) => selectionSubgraph.has(m.id)).getMarks(), {
        padding: ZoomPadding,
      })
    );
  }

  function handleMouseover(e: MouseEvent) {
    let mousePos = [
      e.clientX - canvas.getBoundingClientRect().left,
      e.clientY - canvas.getBoundingClientRect().top,
    ];
    let closestMark = positionMap.hitTest(mousePos);
    // cancel mouse events on non-selected nodes
    if (!!selectedID && !!closestMark && !selectionSubgraph.has(closestMark.id))
      hoveredID = null;
    else hoveredID = closestMark?.id ?? null;
  }

  function handleClick(e: MouseEvent) {
    let mousePos = [
      e.clientX - canvas.getBoundingClientRect().left,
      e.clientY - canvas.getBoundingClientRect().top,
    ];
    let closestMark = positionMap.hitTest(mousePos);
    if (
      (!!selectedID &&
        !!closestMark &&
        !selectionSubgraph.has(closestMark.id)) ||
      !closestMark
    ) {
      selectedID = null;
      selectionSubgraph = new Set();
      hoveredID = null;
    } else if (!!closestMark) {
      selectedID = closestMark.id;
      selectNode(closestMark, selectForwardCitations);
    }
  }

  let oldHoveredID: string | null = null;
  $: if (oldHoveredID != hoveredID && !!markSet) {
    markSet.animate('radius').animate('alpha');

    // add a line for the path corresponding to this paper
    if (!!hoverSelectionPathID) lineSet.delete(hoverSelectionPathID);
    if (selectedID != null && !!hoveredID && !!selectionPaths![hoveredID]) {
      let path = [hoveredID];
      while (selectionPaths![path[path.length - 1]] != path[path.length - 1]) {
        path.push(selectionPaths![path[path.length - 1]]);
      }
      console.log('hover path', path);
      hoverSelectionPathID = 'HOVER:' + path.join(', ');
      lineSet.addMark(
        lineSet.stage?.get(hoverSelectionPathID) ??
          new Mark<EdgeMarkAttrs>(hoverSelectionPathID, {
            entranceProgress: 0,
            color: '#999',
            strokeWidth: 4.0,
            alpha: 1,
          }).representing(path)
      );
    }

    oldHoveredID = hoveredID;
  }

  let oldSelectedID: string | null = null;
  $: if (oldSelectedID != selectedID && !!markSet) {
    markSet.animate('alpha').animate('strokeWidth');

    if (!!oldSelectedID) {
      Object.entries(
        dataset.getForwardCitationPaths([oldSelectedID], false)
      ).forEach((path) => {
        lineSet.delete(path.join(', '));
      });
    }
    if (!!selectedID) {
      Object.entries(
        dataset.getForwardCitationPaths([selectedID], false)
      ).forEach((path) => {
        let lineID = path.join(', ');
        lineSet.addMark(
          lineSet.stage?.get(lineID) ??
            new Mark<EdgeMarkAttrs>(lineID, {
              entranceProgress: 0,
              color: '#bbb',
              strokeWidth: 1,
              alpha: 1,
            }).representing(path)
        );
      });
    }
    oldSelectedID = selectedID;
  }

  let playYearsTimeout: NodeJS.Timeout | null = null;
  const playSecondsPerYear = 1000;
  function playYears() {
    if (currentYear >= maxYear) currentYear = minYear;
    playYearsTimeout = setTimeout(() => {
      currentYear++;
      playYearsTimeout = null;
      if (currentYear < maxYear) playYears();
    }, playSecondsPerYear);
  }

  function stopPlayingYears() {
    if (!!playYearsTimeout) clearTimeout(playYearsTimeout);
  }
</script>

<main
  style="width: 100%; height: 800px; max-height: 100vw; font-family: sans-serif;"
>
  <div style="position: relative; width: 100%; height: calc(100% - 120px);">
    <canvas
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
      bind:this={canvas}
    />
    {#if !!hoveredID && !!hoverPos}
      {@const node = markSet.get(hoveredID)?.represented.paper}
      {#if !!node}
        <div
          class="tooltip"
          style="top: {hoverPos[1]}px; left: {hoverPos[0]}px;"
        >
          <p><em>({node.year})</em> {node.title}</p>
        </div>
      {/if}
    {/if}
    {#if !!selectedID}
      {@const node = markSet.get(selectedID)?.represented.paper}
      {#if !!node}
        <div class="sidebar">
          <p>Selected: <strong>{node.title}</strong></p>
          <p>{node.authors.join(', ')}</p>
          <p style="color: #999;">{node.year}</p>
        </div>
      {/if}
    {/if}
  </div>
  <div style="display: flex; align-items: center; justify-content: center;">
    {#if !!minYear && !!maxYear && !!currentYear}
      <div>Year: {currentYear}</div>
      <input
        type="range"
        min={minYear}
        max={maxYear}
        step={1}
        style="margin: 0 12px; width: 200px;"
        bind:value={currentYear}
      />
    {/if}
    {#if !!playYearsTimeout}
      <button on:click={stopPlayingYears}>Pause</button>
    {:else}
      <button on:click={playYears}>Play</button>
    {/if}
    <!-- <button on:click={centerPoint}>Center Random Point</button>
    <button on:click={zoomToPoints}>Zoom to 2 Points</button>
    <button on:click={followPoints}>Follow 2 Points</button>
    <button on:click={resetZoom}>Reset Zoom</button> -->
  </div>
</main>

<style>
  .tooltip {
    pointer-events: none;
    padding: 0 12px;
    max-width: 300px;
    background-color: rgba(255, 255, 255, 0.8);
    border: 1px solid #bbb;
    border-radius: 6px;
    position: absolute;
    transform: translate(-50%, calc(-100% - 12px));
  }

  .sidebar {
    position: absolute;
    right: 24px;
    top: 24px;
    background-color: rgba(255, 255, 255, 0.8);
    border: 1px solid #bbb;
    border-radius: 6px;
    width: 400px;
    max-width: 25%;
    padding: 0 12px;
  }
</style>
