import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import * as CA from 'https://cdn.jsdelivr.net/gh/venkatesh-sivaraman/canvas-animation@main/canvas-animation/dist/canvas-animation.es.js';

// Declare the chart dimensions and margins.
const width = 600;
const height = 600;
const marginTop = 60;
const marginRight = 60;
const marginBottom = 60;
const marginLeft = 60;

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
  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

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

  if (lineSet.count() > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 6.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    lineSet.forEach((mark) => {
      let xCoords = mark.attr('x');
      let yCoords = mark.attr('y');
      ctx.moveTo(xCoords[0], yCoords[0]);
      for (let i = 1; i < xCoords.length; i++) {
        ctx.lineTo(xCoords[i], yCoords[i]);
      }
    });
    ctx.stroke();
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

function interpolateClosestValue(variable, countryData, year) {
  let lowerYear = Array.from(countryData.keys()).reduce(
    (a, b) => (b > year ? a : Math.max(a, b)),
    0
  );
  let upperYear = Array.from(countryData.keys()).reduce(
    (a, b) => (b < year ? a : Math.min(a, b)),
    1e9
  );
  if (!countryData.has(lowerYear) && !countryData.has(upperYear)) return 0;
  if (!countryData.has(lowerYear)) return countryData.get(upperYear)[variable];
  if (!countryData.has(upperYear)) return countryData.get(lowerYear)[variable];
  if (lowerYear == upperYear) return countryData.get(lowerYear)[variable];
  return (
    (countryData.get(lowerYear)[variable] * (upperYear - year)) /
      (upperYear - lowerYear) +
    (countryData.get(upperYear)[variable] * (year - lowerYear)) /
      (upperYear - lowerYear)
  );
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

d3.csv('/canvas-animation/assets/gapminder_full.csv').then((data) => {
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
      new Map(data.filter((d) => d.country == country).map((d) => [d.year, d])),
    ])
  );

  let currentYear = 1992;
  let xEncoding = 'life_exp';
  let yEncoding = 'gdp_cap';
  let sizeEncoding = 'population';

  let hoveredCountry = null;
  let selectedCountry = null;

  // create scales, which handle transforming the coordinates and zooming to
  // particular marks when we select
  let scales = new CA.Scales()
    .xRange([marginLeft, width - marginRight])
    .yRange([height - marginBottom, marginTop])
    .onUpdate(() => {
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

  function updateDomains(animated) {
    scales.xDomain(
      d3.extent(data, (d) => d[xEncoding]),
      animated
    );
    scales.yDomain(
      d3.extent(data, (d) => d[yEncoding]),
      animated
    );
    sizeScale = sizeScale.domain(
      d3.extent(data, (d) =>
        ScaleTypes[sizeEncoding] == 'log'
          ? Math.pow(10, d[sizeEncoding])
          : d[sizeEncoding]
      )
    );
    scales.reset(animated);
  }
  updateDomains(false);

  // create a render group with all bubbles
  let bubbleSet = new CA.MarkRenderGroup(
    allCountries.map(
      (country) =>
        new CA.Mark(country, {
          year: new CA.Attribute(currentYear),
          x: new CA.Attribute((mark) => {
            let v = interpolateClosestValue(
              xEncoding,
              perCountryData.get(country),
              mark.attr('year')
            );
            // here we use the scale within the value fn, not as a transform,
            // because we want the transform to animate as well even if it
            // undergoes a discrete change (such as linear <> log)
            return scales.xScale(v);
          }),
          y: new CA.Attribute((mark) => {
            let v = interpolateClosestValue(
              yEncoding,
              perCountryData.get(country),
              mark.attr('year')
            );
            return scales.yScale(v);
          }),
          radius: new CA.Attribute({
            valueFn: (mark) => {
              let v = interpolateClosestValue(
                sizeEncoding,
                perCountryData.get(country),
                mark.attr('year')
              );
              if (ScaleTypes[sizeEncoding] == 'log') v = Math.pow(10, v);
              return v > 0 ? Math.max(sizeScale(v), 0) : 0;
            },
          }),
          strokeWidth: new CA.Attribute(
            () =>
              (selectedCountry == country ? 2.0 : 0) +
              (hoveredCountry == country ? 3.0 : 1.0)
          ),
          alpha: new CA.Attribute(() =>
            selectedCountry == country ||
            (selectedCountry === null &&
              (hoveredCountry == country || hoveredCountry == null))
              ? 1.0
              : 0.3
          ),
          labelSize: new CA.Attribute(() =>
            selectedCountry == country || hoveredCountry == country ? 12.0 : 0.0
          ),
        })
    )
  );

  // create another render group for the line showing each country's trajectory
  // (these marks will only be added when the user hovers or selects, using the
  // stage manager)
  let lineSet = new CA.MarkRenderGroup([]).configure({
    animationDuration: 500,
    animationCurve: CA.curveEaseInOut,
  });
  let lineStaging = new CA.StageManager({
    create: (id) =>
      new CA.Mark(`line-${id}`, {
        country: new CA.Attribute(id),
        startYear: new CA.Attribute(currentYear),
        endYear: new CA.Attribute(currentYear),
        x: new CA.Attribute({
          valueFn: (mark) => {
            // define the list of x coordinates for this line
            let countryData = perCountryData.get(id);
            let startYear = mark.attr('startYear'),
              endYear = mark.attr('endYear');
            let years = [
              startYear,
              ...Array.from(countryData.keys()).filter(
                (y) => y >= startYear && y <= endYear
              ),
              mark.attr('endYear'),
            ];
            return years.map((y) =>
              interpolateClosestValue(xEncoding, perCountryData.get(id), y)
            );
          },
          transform: (v) => v.map(scales.xScale),
        }),
        y: new CA.Attribute({
          valueFn: (mark) => {
            // define the list of y coordinates for this line
            let countryData = perCountryData.get(id);
            let startYear = mark.attr('startYear'),
              endYear = mark.attr('endYear');
            let years = [
              startYear,
              ...Array.from(countryData.keys()).filter(
                (y) => y >= startYear && y <= endYear
              ),
              mark.attr('endYear'),
            ];
            return years.map((y) =>
              interpolateClosestValue(yEncoding, perCountryData.get(id), y)
            );
          },
          transform: (v) => v.map(scales.yScale),
        }),
      }),
    show: async (mark) => {
      let availableYears = Array.from(
        perCountryData.get(mark.attr('country')).keys()
      );
      return await mark
        .animateTo(
          'startYear',
          availableYears.reduce((a, b) => Math.min(a, b), currentYear)
        )
        .animateTo(
          'endYear',
          availableYears.reduce((a, b) => Math.max(a, b), currentYear)
        )
        .wait(['startYear', 'endYear']);
    },
    hide: async (mark) =>
      await mark
        .animateTo('startYear', currentYear)
        .animateTo('endYear', currentYear)
        .wait(['startYear', 'endYear']),
  }).attach(lineSet);

  let zoom = d3
    .zoom()
    .scaleExtent([0.1, 10])
    .on('zoom', (e) => {
      // important to make sure the source event exists, filtering out our
      // programmatic changes
      if (e.sourceEvent != null) scales.transform(e.transform);
    });

  let canvas = document.getElementById('gapminder-content');
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  d3.select(canvas).call(zoom);

  // the ticker runs every frame and redraws only when needed
  let ticker = new CA.Ticker([bubbleSet, lineSet, scales]).onChange(() =>
    drawCanvas(canvas, bubbleSet, lineSet)
  );
  // the position map keeps track of mark locations so we can find them on hover
  let positionMap = new CA.PositionMap().add(bubbleSet);

  // Function to zoom to a country, leaving room for that country's location in
  // all years
  let zoomToCountry = (country) =>
    scales.zoomTo(
      CA.markBox(
        Array.from(perCountryData.get(country).entries()).map(
          ([year, d]) =>
            new CA.Mark(`${country}-${year}`, {
              x: new CA.Attribute({
                value: d[xEncoding],
                transform: scales.xScale,
              }),
              y: new CA.Attribute({
                value: d[yEncoding],
                transform: scales.yScale,
              }),
            })
        ),
        { padding: 60 }
      )
    );

  let zoomToAll = (animated = true) =>
    scales.zoomTo(
      CA.markBox(bubbleSet.getMarks(), {
        padding: 60,
        inverseTransformCoordinates: true, // needed because we apply scale within the value fns
      }),
      animated
    );
  zoomToAll(false);

  // respond to year slider selections
  let slider = document.getElementById('year-slider');
  slider.value = currentYear;
  slider.addEventListener('input', (e) => {
    let newValue = e.target.value;

    if (newValue != currentYear) {
      currentYear = parseInt(newValue);
      bubbleSet.animateTo('year', currentYear);
      document.getElementById('year-text').innerText = newValue;
      positionMap.invalidate();
    }
  });

  // reset viewport to show all marks
  document.getElementById('reset-zoom').addEventListener('click', zoomToAll);

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
          lineStaging.hide(oldHover);
        if (hoveredCountry != null) lineStaging.show(hoveredCountry);
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
      if (oldSelection != null) lineStaging.hide(oldSelection);
      if (selectedCountry != null) {
        lineStaging.show(selectedCountry);
        zoomToCountry(selectedCountry);
      }
    }
  });

  document.getElementById('x-dropdown').addEventListener('change', (e) => {
    xEncoding = e.target.value;
    bubbleSet.animate('x', { duration: 500 });
    lineSet.animate('x', { duration: 500 });
    updateDomains(true);
  });
  document.getElementById('y-dropdown').addEventListener('change', (e) => {
    yEncoding = e.target.value;
    bubbleSet.animate('y', { duration: 500 });
    lineSet.animate('y', { duration: 500 });
    updateDomains(true);
  });

  document.getElementById('size-dropdown').addEventListener('change', (e) => {
    sizeEncoding = e.target.value;
    bubbleSet.animate('radius', { duration: 500 });
    updateDomains(true);
  });
});
