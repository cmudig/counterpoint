import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
// import * as CP from './counterpoint-vis.es.js';
import * as CP from 'https://cdn.jsdelivr.net/npm/counterpoint-vis@latest/dist/counterpoint-vis.es.js';

// Declare the chart dimensions and margins.
let width = 600;
let height = 600;
const marginTop = 60;
const marginRight = 0;
const marginBottom = 60;
const marginLeft = 60;

const MinYear = 1952;
const MaxYear = 2007;
const StartYear = 1992;

const AxisLabels = {
  gdp_cap: 'GDP Per Capita',
  life_exp: 'Life Expectancy (yr)',
  population: 'Population',
};

const ScaleTypes = {
  gdp_cap: 'log',
  life_exp: 'linear',
  population: 'log',
};

function createAxes(scales, xEncoding, yEncoding) {
  // Create the SVG container.
  const svg = d3.select('#gapminder-axes');
  if (svg.empty()) return;
  let rect = d3
    .select('#gapminder-chart-container')
    .node()
    .getBoundingClientRect();
  svg.attr('width', rect.width).attr('height', rect.height);
  svg.selectAll('*').remove();

  // We portray the axes as log scales when needed and convert the extents
  let xScale, yScale;
  if (ScaleTypes[xEncoding] == 'log')
    xScale = d3.scaleLog(
      scales.xScale.domain().map((x) => Math.pow(10, x)),
      scales.xScale.range()
    );
  else xScale = d3.scaleLinear(scales.xScale.domain(), scales.xScale.range());

  if (ScaleTypes[yEncoding] == 'log')
    yScale = d3.scaleLog(
      scales.yScale.domain().map((x) => Math.pow(10, x)),
      scales.yScale.range()
    );
  else yScale = d3.scaleLinear(scales.yScale.domain(), scales.yScale.range());

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
        .text(`${AxisLabels[xEncoding]} →`)
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
        .text(`↑ ${AxisLabels[yEncoding]}`)
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
}

function drawCanvas(canvas, bubbleSet, lineSet) {
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

  if (lineSet.stage.count() > 0) {
    ctx.save();
    // draw a shadow of the bubble's position and size using a series of
    // rounded paths
    ctx.fillStyle = '#e0e0e0';
    lineSet.stage.forEach((mark) => {
      ctx.globalAlpha = mark.attr('alpha');
      let xCoords = mark.attr('x');
      let yCoords = mark.attr('y');
      let sizes = mark.attr('size');
      for (let i = 0; i < xCoords.length - 1; i++) {
        let x0 = xCoords[i],
          x1 = xCoords[i + 1],
          y0 = yCoords[i],
          y1 = yCoords[i + 1],
          s0 = sizes[i],
          s1 = sizes[i + 1];
        ctx.save();
        ctx.translate(x0, y0);
        ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
        ctx.beginPath();
        let dist = Math.sqrt(Math.pow(y1 - y0, 2) + Math.pow(x1 - x0, 2));
        ctx.ellipse(0, 0, s0, s0, 0, -Math.PI * 0.5, Math.PI * 0.5, true);
        ctx.lineTo(dist, s1, dist);
        ctx.ellipse(dist, 0, s1, s1, 0, Math.PI * 0.5, -Math.PI * 0.5, true);
        ctx.lineTo(0, -s0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // draw a constant-width line on top
      ctx.beginPath();
      ctx.strokeStyle = '#bbb';
      ctx.lineWidth = 3.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(xCoords[0], yCoords[0]);
      for (let i = 1; i < xCoords.length; i++) {
        ctx.lineTo(xCoords[i], yCoords[i]);
      }
      ctx.stroke();
    });
    ctx.restore();
  }

  bubbleSet.forEach((mark) => {
    ctx.save();
    let alpha = mark.attr('alpha');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#4682b455';
    ctx.beginPath();
    let r = mark.attr('radius'),
      x = mark.attr('x'),
      y = mark.attr('y');
    ctx.ellipse(x, y, r, r, 0, 0, 2 * Math.PI);
    ctx.fill();
    let strokeWidth = mark.attr('strokeWidth');
    ctx.strokeStyle = '#4682b4';
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

    let labelSize = mark.attr('labelSize');
    if (labelSize > 1) {
      ctx.save();
      ctx.font = `${labelSize.toFixed(2)}pt sans-serif`;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = Math.round(0.25 * labelSize);
      ctx.fillStyle = 'black';
      ctx.strokeText(mark.id, x, y - r - 4);
      ctx.fillText(mark.id, x, y - r - 4);
      ctx.restore();
    }
  });
}

// interpolates between available year data
function interpolateVariable(getter, countryData, year) {
  let lowerYear = Array.from(countryData.keys()).reduce(
    (a, b) => (b > year ? a : Math.max(a, b)),
    0
  );
  let upperYear = Array.from(countryData.keys()).reduce(
    (a, b) => (b < year ? a : Math.min(a, b)),
    1e9
  );
  if (!countryData.has(lowerYear) && !countryData.has(upperYear)) return 0;
  if (!countryData.has(lowerYear)) return getter(countryData.get(upperYear));
  if (!countryData.has(upperYear)) return getter(countryData.get(lowerYear));
  if (lowerYear == upperYear) return getter(countryData.get(lowerYear));
  return (
    (getter(countryData.get(lowerYear)) * (upperYear - year)) /
      (upperYear - lowerYear) +
    (getter(countryData.get(upperYear)) * (year - lowerYear)) /
      (upperYear - lowerYear)
  );
}

// returns a set of coordinates for points falling between the start and end years
function lineCoordinates(getter, countryData, startYear, endYear) {
  let years = [
    startYear,
    ...Array.from(countryData.keys()).filter(
      (y) => y >= startYear && y <= endYear
    ),
    endYear,
  ];
  return years.map((y) => interpolateVariable(getter, countryData, y));
}

function nearestBubbleContainingPos(positionMap, mousePos, maxDistance) {
  let nearest = positionMap.marksNear(mousePos, maxDistance);
  if (nearest.length == 0) return null;
  else {
    // find the mark for which the mouse pos is within the bubble
    let markWithinBounds = nearest.find(
      (m) =>
        Math.sqrt(
          Math.pow(m.attr('x') - mousePos[0], 2) +
            Math.pow(m.attr('y') - mousePos[1], 2)
        ) <= m.attr('radius')
    );
    if (!!markWithinBounds) return markWithinBounds.id;
    return null;
  }
}

export function loadGapminderPlot() {
  d3.csv('/counterpoint/assets/gapminder_full.csv').then((data) => {
    let canvas = document.getElementById('gapminder-content');
    let slider = document.getElementById('year-slider');
    if (!canvas) return;

    // format dataset - apply log10 for logarithmic fields
    data.forEach((d) => {
      d.year = parseInt(d.year);
      d.population = Math.log10(parseInt(d.population));
      d.life_exp = parseFloat(d.life_exp);
      d.gdp_cap = Math.log10(parseFloat(d.gdp_cap));
    });
    let allCountries = Array.from(new Set(data.map((d) => d.country)));
    allCountries.sort();
    let perCountryData = new Map(
      allCountries.map((country) => [
        country,
        new Map(
          data.filter((d) => d.country == country).map((d) => [d.year, d])
        ),
      ])
    );

    let currentYear = new CP.Attribute(StartYear);
    let xEncoding = 'life_exp';
    let yEncoding = 'gdp_cap';
    let sizeEncoding = 'population';
    let xGet = (datum) => datum[xEncoding];
    let yGet = (datum) => datum[yEncoding];
    // cancel out the log transform for size
    let sizeGet = (datum) =>
      ScaleTypes[sizeEncoding] == 'log'
        ? Math.pow(10, datum[sizeEncoding])
        : datum[sizeEncoding];

    let hoveredCountry = null;
    let selectedCountry = null;

    // create scales, which handle transforming the coordinates and zooming to
    // particular marks when we select
    let scales = new CP.Scales().onUpdate(() => {
      // When the scales update, we also need to let the d3 zoom object know that
      // the zoom transform has changed. Otherwise performing a zoom gesture after
      // a programmatic update will result in an abrupt transform change
      let sel = d3.select(canvas);
      let currentT = d3.zoomTransform(canvas);
      let t = scales.transform();
      if (t.k != currentT.k || t.x != currentT.x || t.y != currentT.y) {
        sel.call(zoom.transform, new d3.ZoomTransform(t.k, t.x, t.y));
      }
      createAxes(scales, xEncoding, yEncoding);
      positionMap.invalidate();
    });

    // for bubble size, use a simple d3 scale
    let sizeScale = d3.scaleSqrt().range([4, 60]);

    function updateDomains() {
      scales.xDomain(d3.extent(data, xGet), false);
      scales.yDomain(d3.extent(data, yGet), false);
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
    let bubbleSet = new CP.MarkRenderGroup(
      allCountries.map(
        (country) =>
          new CP.Mark(country, {
            year: () => currentYear.get(),
            x: (mark) => {
              let v = interpolateVariable(
                xGet,
                perCountryData.get(country),
                mark.attr('year')
              );
              // here we use the scale within the value fn, not as a transform,
              // because we want the transform to animate as well even if it
              // undergoes a discrete change (such as linear <> log)
              return scales.xScale(v);
            },
            y: (mark) => {
              let v = interpolateVariable(
                yGet,
                perCountryData.get(country),
                mark.attr('year')
              );
              return scales.yScale(v);
            },
            radius: (mark) => {
              let v = interpolateVariable(
                sizeGet,
                perCountryData.get(country),
                mark.attr('year')
              );
              return v > 0 ? Math.max(sizeScale(v), 0) : 0;
            },
            strokeWidth: () =>
              (selectedCountry == country ? 2.0 : 0) +
              (hoveredCountry == country ? 3.0 : 1.0),
            alpha: () =>
              selectedCountry == country ||
              (selectedCountry === null &&
                (hoveredCountry == country || hoveredCountry == null))
                ? 1.0
                : 0.3,
            labelSize: () =>
              selectedCountry == country || hoveredCountry == country
                ? 12.0
                : 0.0,
          })
      )
    );

    // create another render group for the line showing each country's trajectory
    // (these marks will only be added when the user hovers or selects, using the
    // stage manager)
    function createLine(id) {
      return new CP.Mark(id, {
        country: id,
        startYear: currentYear.get(),
        endYear: currentYear.get(),
        x: (mark) =>
          lineCoordinates(
            xGet,
            perCountryData.get(id),
            mark.attr('startYear'),
            mark.attr('endYear')
          ).map(scales.xScale),
        y: (mark) =>
          lineCoordinates(
            yGet,
            perCountryData.get(id),
            mark.attr('startYear'),
            mark.attr('endYear')
          ).map(scales.yScale),
        size: (mark) =>
          lineCoordinates(
            sizeGet,
            perCountryData.get(id),
            mark.attr('startYear'),
            mark.attr('endYear')
          ).map(sizeScale),
        alpha: 0.0,
      });
    }
    let lineSet = new CP.MarkRenderGroup()
      .configure({
        animationDuration: 500,
        animationCurve: CP.curveEaseInOut,
      })
      .configureStaging({
        enter: (mark) =>
          mark
            .animateTo('startYear', MinYear)
            .animateTo('endYear', MaxYear)
            .animateTo('alpha', 1.0, { duration: 200 })
            .wait(['startYear', 'endYear']),
        exit: (mark) =>
          mark
            .animateTo('startYear', currentYear.get())
            .animateTo('endYear', currentYear.get())
            .animateTo('alpha', 0.0, { duration: 200, delay: 300 })
            .wait(['startYear', 'endYear']),
      });

    let zoom = d3
      .zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (e) => {
        // important to make sure the source event exists, filtering out our
        // programmatic changes
        if (e.sourceEvent != null) scales.transform(e.transform);
      });
    d3.select(canvas).call(zoom);

    // the ticker runs every frame and redraws only when needed
    let ticker = new CP.Ticker([
      currentYear,
      bubbleSet,
      lineSet,
      scales,
    ]).onChange(() => {
      drawCanvas(canvas, bubbleSet, lineSet);
      slider.value = Math.round(currentYear.get());
      let yearLabel = document.getElementById('year-text');
      if (!!yearLabel) yearLabel.innerText = slider.value;
      if (bubbleSet.changed(['x', 'y'])) positionMap.invalidate();
    });
    // the position map keeps track of mark locations so we can find them on hover
    let positionMap = new CP.PositionMap().add(bubbleSet);

    // Function to zoom to a country, leaving room for that country's location in
    // all years
    let zoomToCountry = (country) =>
      scales.zoomTo(
        CP.markBox(
          Array.from(perCountryData.get(country).entries()).map(
            ([year, d]) =>
              new CP.Mark(`${country}-${year}`, {
                x: new CP.Attribute({
                  value: xGet(d),
                  transform: scales.xScale,
                }),
                y: new CP.Attribute({
                  value: yGet(d),
                  transform: scales.yScale,
                }),
              })
          ),
          { padding: 60 }
        )
      );

    let zoomToAll = (animated = true) =>
      scales.zoomTo(
        CP.markBox(bubbleSet.getMarks(), {
          padding: 60,
          inverseTransformCoordinates: true, // needed because we apply scale within the value fns
        }),
        animated
      );
    zoomToAll(false);

    // respond to year slider selections
    slider.addEventListener('input', (e) => {
      let newValue = e.target.value;

      if (newValue != currentYear) {
        currentYear.set(parseInt(newValue));
        bubbleSet.animate('year');
        positionMap.invalidate();
      }
    });

    // play/pause
    document.getElementById('play-pause').onclick = () => {
      if (currentYear.animating()) {
        currentYear.set(currentYear.get());
      } else {
        if (currentYear.get() >= MaxYear) currentYear.set(MinYear);
        currentYear.animate(
          new CP.basicAnimationTo(
            MaxYear,
            (MaxYear - currentYear.get()) * 500,
            CP.curveLinear
          )
        );
      }
    };

    // reset viewport to show all marks
    document.getElementById('reset-zoom').onclick = zoomToAll;

    // mouse event handlers for hovering and selecting
    let mouseDown = false;
    canvas.addEventListener('mousedown', () => (mouseDown = true));
    canvas.addEventListener('mousemove', (e) => {
      let mousePos = [
        e.clientX - canvas.getBoundingClientRect().left,
        e.clientY - canvas.getBoundingClientRect().top,
      ];
      if (!mouseDown) {
        let oldHover = hoveredCountry;
        hoveredCountry = nearestBubbleContainingPos(
          positionMap,
          mousePos,
          sizeScale.range()[1]
        );
        if (oldHover !== hoveredCountry) {
          bubbleSet.animate('strokeWidth', { duration: 200 });
          bubbleSet.animate('alpha', { duration: 200 });
          bubbleSet.animate('labelSize', { duration: 200 });
          if (oldHover != null && oldHover !== selectedCountry)
            lineSet.delete(oldHover);
          if (hoveredCountry != null && !lineSet.has(hoveredCountry))
            lineSet.addMark(
              lineSet.stage.get(hoveredCountry) ?? createLine(hoveredCountry)
            );
        }
      }
    });
    canvas.addEventListener('mouseup', () => (mouseDown = false));
    canvas.addEventListener('click', (e) => {
      let mousePos = [
        e.clientX - canvas.getBoundingClientRect().left,
        e.clientY - canvas.getBoundingClientRect().top,
      ];

      let oldSelection = selectedCountry;
      selectedCountry = nearestBubbleContainingPos(
        positionMap,
        mousePos,
        sizeScale.range()[1]
      );
      if (oldSelection !== selectedCountry) {
        bubbleSet.animate('alpha', { duration: 200 });
        bubbleSet.animate('strokeWidth', { duration: 200 });
        bubbleSet.animate('labelSize', { duration: 200 });
        if (oldSelection != null && lineSet.has(oldSelection))
          lineSet.deleteMark(lineSet.get(oldSelection));
        if (selectedCountry != null) {
          if (!lineSet.has(selectedCountry))
            lineSet.addMark(
              lineSet.stage.get(selectedCountry) ?? createLine(selectedCountry)
            );
          zoomToCountry(selectedCountry);
        }
      }
    });
    // on resize, update the chart bounds and redraw the canvas immediately to prevent flicker
    new ResizeObserver(() => {
      updateRanges(true);
      drawCanvas(canvas, bubbleSet, lineSet);
    }).observe(canvas);

    document.getElementById('x-dropdown').addEventListener('change', (e) => {
      xEncoding = e.target.value;
      updateDomains();
      bubbleSet.animate('x', { duration: 500 });
      lineSet.animate('x', { duration: 500 });
      bubbleSet.wait('x').then(() => zoomToAll(true));
    });
    document.getElementById('y-dropdown').addEventListener('change', (e) => {
      yEncoding = e.target.value;
      updateDomains();
      bubbleSet.animate('y', { duration: 500 });
      lineSet.animate('y', { duration: 500 });
      bubbleSet.wait('y').then(() => zoomToAll(true));
    });

    document.getElementById('size-dropdown').addEventListener('change', (e) => {
      sizeEncoding = e.target.value;
      updateDomains();
      bubbleSet.animate('radius', { duration: 500 });
      lineSet.animate('size', { duration: 500 });
      bubbleSet.wait('radius').then(() => zoomToAll(true));
    });
  });
}
