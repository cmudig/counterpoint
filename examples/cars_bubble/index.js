import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import * as d3legend from 'https://cdn.jsdelivr.net/npm/d3-svg-legend/+esm';
// import * as CP from './counterpoint-vis.es.js';
import * as CP from 'https://cdn.jsdelivr.net/npm/counterpoint-vis@latest/dist/counterpoint-vis.es.js';

// Declare the chart dimensions and margins.
let width = 400;
let height = 400;
const marginTop = 60;
const marginRight = 60;
const marginBottom = 60;
const marginLeft = 60;

const StartYear = 1970;

function createAxes(
  scales,
  sizeScale,
  colorScale,
  xEncoding,
  yEncoding,
  sizeEncoding,
  colorEncoding
) {
  // Create the SVG container.
  const svg = d3.select('#axes');
  if (svg.empty()) return;
  let rect = d3.select('#chart-container').node().getBoundingClientRect();
  svg.attr('width', rect.width).attr('height', rect.height);
  svg.selectAll('*').remove();

  // We portray the axes as log scales when needed and convert the extents
  let xScale, yScale;
  xScale = d3.scaleLinear(scales.xScale.domain(), scales.xScale.range());
  yScale = d3.scaleLinear(scales.yScale.domain(), scales.yScale.range());

  svg
    .append('g')
    .style('font-size', '10pt')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(xScale).tickArguments([5, ',.6~s']))
    .call((g) =>
      g
        .append('text')
        .attr('x', width - marginRight)
        .attr('y', 40)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'end')
        .text(`${xEncoding} →`)
    );
  svg
    .append('g')
    .selectAll('line')
    .data(xScale.ticks(5))
    .join('line')
    .attr('x1', (d) => xScale(d))
    .attr('x2', (d) => xScale(d))
    .attr('y1', marginTop)
    .attr('y2', height - marginBottom)
    .attr('stroke', '#f0f0f0')
    .attr('stroke-width', '1');

  // Add the y-axis.
  svg
    .append('g')
    .style('font-size', '10pt')
    .attr('transform', `translate(${marginLeft},0)`)
    .call(d3.axisLeft(yScale).tickArguments([5, ',.6~s']))
    .call((g) =>
      g
        .append('text')
        .attr('x', -marginLeft)
        .attr('y', marginTop - 20)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'start')
        .text(`↑ ${yEncoding}`)
    );
  svg
    .append('g')
    .attr('class', 'grid-lines')
    .selectAll('line')
    .data(yScale.ticks(5))
    .join('line')
    .attr('x1', marginLeft)
    .attr('x2', width - marginRight)
    .attr('y1', (d) => yScale(d))
    .attr('y2', (d) => yScale(d))
    .attr('stroke', '#f0f0f0')
    .attr('stroke-width', '1');

  // add legends

  svg
    .append('g')
    .attr('id', 'sizeLegend')
    .style('font-family', 'sans-serif')
    .style('font-size', '10pt')
    .attr('transform', `translate(${width},${marginTop})`);

  var sizeLegend = d3legend
    .legendSize()
    .cells(4)
    .shape('circle')
    .title(sizeEncoding)
    .labelFormat(d3.format(',.2r'))
    .shapePadding(10)
    .scale(sizeScale);

  svg.select('#sizeLegend').call(sizeLegend);
  svg
    .selectAll('#sizeLegend .swatch')
    .style('fill', colorScale(colorScale.domain()[0]));

  svg
    .append('g')
    .attr('id', 'colorLegend')
    .style('font-family', 'sans-serif')
    .style('font-size', '10pt')
    .attr('transform', `translate(${width},${marginTop + 200})`);

  var colorLegend = d3legend
    .legendColor()
    .shape('circle')
    .title(colorEncoding)
    .shapeRadius(5)
    .shapePadding(5)
    .scale(colorScale);

  svg.select('#colorLegend').call(colorLegend);
}

function drawCanvas(canvas, bubbleSet) {
  const ctx = canvas.getContext('2d');

  // scaling for 2x devices
  ctx.resetTransform();
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  ctx.clearRect(0, 0, width, height);

  // clip to chart bounds
  ctx.beginPath();
  ctx.rect(
    marginLeft,
    marginTop,
    width - marginLeft - marginRight,
    height - marginTop - marginBottom
  );
  ctx.clip();
  ctx.closePath();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.lineWidth = 1;

  bubbleSet.stage.forEach((mark) => {
    ctx.save();
    ctx.beginPath();
    let r = mark.attr('radius'),
      x = mark.attr('x'),
      y = mark.attr('y'),
      alpha = mark.attr('alpha'),
      color = mark.attr('color');
    ctx.ellipse(x, y, r, r, 0, 0, 2 * Math.PI);
    ctx.globalAlpha = alpha * 0.1;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  });
}

export function loadCarsBubble() {
  d3.json('https://cdn.jsdelivr.net/npm/vega-datasets@2/data/cars.json').then(
    (data) => {
      let canvas = document.getElementById('content');
      let slider = document.getElementById('year-slider');
      if (!canvas) return;

      console.log(data);
      data.forEach((d) => {
        d.Year = parseInt(d.Year.slice(0, d.Year.indexOf('-')));
        d.id = `${d.Year} ${d.Name}`;
      });

      let currentYear = new CP.Attribute(StartYear);
      let xEncoding = 'Acceleration';
      let yEncoding = 'Miles_per_Gallon';
      let sizeEncoding = 'Weight_in_lbs';
      let colorEncoding = 'Origin';
      let xGet = (datum) => datum[xEncoding];
      let yGet = (datum) => datum[yEncoding];
      let sizeGet = (datum) => datum[sizeEncoding];
      let colorGet = (datum) => datum[colorEncoding];

      // for bubble size, use a simple d3 scale
      let sizeScale = d3
        .scaleSqrt()
        .domain(d3.extent(data, sizeGet))
        .range([1, 10])
        .nice();
      let colorScale = d3
        .scaleOrdinal(d3.schemeCategory10)
        .domain(Array.from(new Set(data.map(colorGet))).sort());

      // create scales, which handle transforming the coordinates and zooming to
      // particular marks when we select
      let scales = new CP.Scales().onUpdate(() => {
        createAxes(
          scales,
          sizeScale,
          colorScale,
          xEncoding,
          yEncoding,
          sizeEncoding,
          colorEncoding
        );
      });

      function updateDomains() {
        let xExtent = d3.extent(data, xGet);
        let yExtent = d3.extent(data, yGet);
        scales.xDomain(
          [
            xExtent[0] - 0.05 * (xExtent[1] - xExtent[0]),
            xExtent[1] + 0.05 * (xExtent[1] - xExtent[0]),
          ],
          false
        );
        scales.yDomain(
          [
            yExtent[0] - 0.05 * (yExtent[1] - yExtent[0]),
            yExtent[1] + 0.05 * (yExtent[1] - yExtent[0]),
          ],
          false
        );
        sizeScale = sizeScale.domain(d3.extent(data, sizeGet));
      }
      updateDomains();

      function updateRanges(animated) {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        scales
          .xRange([marginLeft, width - marginRight], animated)
          .yRange([height - marginBottom, marginTop], animated);
      }
      updateRanges(false);

      // create a render group with all bubbles
      let bubbleSet = new CP.MarkRenderGroup()
        .configure({
          animationDuration: 1000,
        })
        .configureStaging({
          initialize: (mark) => mark.setAttr('alpha', 0.0).setAttr('radius', 0),
          enter: (mark) =>
            mark
              .animateTo('alpha', 1.0)
              .animateTo('radius', (mark) => sizeGet(mark.represented))
              .wait(['alpha', 'radius']),
          exit: (mark) =>
            mark
              .animateTo('alpha', 0.0)
              .animateTo('radius', 0)
              .wait(['alpha', 'radius']),
        });

      function updateToYear(year) {
        // add any bubbles that are from cars less than or equal to this year
        data.forEach((d) => {
          if (d.Year > year && bubbleSet.has(d.id)) {
            bubbleSet.delete(d.id);
          } else if (d.Year <= year && !bubbleSet.has(d.id)) {
            bubbleSet.addMark(
              bubbleSet.stage.get(d.id) ??
                new CP.Mark(d.id, {
                  x: {
                    valueFn: (mark) => xGet(mark.represented),
                    transform: scales.xScale,
                  },
                  y: {
                    valueFn: (mark) => yGet(mark.represented),
                    transform: scales.yScale,
                  },
                  radius: {
                    value: 0,
                    transform: (v) => Math.max(0, sizeScale(v)),
                  },
                  color: {
                    valueFn: (mark) => colorGet(mark.represented),
                    transform: colorScale,
                  },
                  alpha: 0.0,
                }).representing(d)
            );
          }
        });
      }

      updateToYear(currentYear.get());

      // the ticker runs every frame and redraws only when needed
      let ticker = new CP.Ticker([currentYear, bubbleSet, scales]).onChange(
        () => drawCanvas(canvas, bubbleSet)
      );

      // respond to year slider selections
      slider.addEventListener('input', (e) => {
        let newValue = e.target.value;

        if (newValue != currentYear) {
          currentYear.set(parseInt(newValue));
          updateToYear(currentYear.get());

          slider.value = Math.round(currentYear.get());
          let yearLabel = document.getElementById('year-text');
          if (!!yearLabel) yearLabel.innerText = slider.value;
        }
      });
    }
  );
}

window.onload = loadCarsBubble;
