---
layout: post
title: 'Example: Accessible Gapminder Chart'
---

Below is a responsive, screen-reader-navigable version of the chart shown on the [homepage]({{ site.baseurl }}/). Press Navigate to enter keyboard navigation. Or, change your "prefers reduced motion" system setting to see fade animations instead of motion.

<div style="display: flex; width: 100%; flex-wrap: wrap; overflow: visible;">
  <div style="flex: 1 0 auto; max-width: 100%;">
  <button id="navigation-entry" tabindex="0">Navigate</button>
  <button id="navigation-exit" tabindex="0" style="display: none">
      Exit Chart
  </button>

  <div
      id="gapminder-chart-container"
      tabindex="0"
      style="position: relative; max-height: 50vh;"
      role="figure"
  >
      <svg
      width="800"
      height="600"
      id="gapminder-axes"
      style="position: absolute; top: 0; left: 0"
      overflow="visible"
      ></svg>
      <canvas
      id="gapminder-content"
      style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
      "
      ></canvas>
  </div>
  <div style="max-width: 400px; width: 100%;">
      <div
      id="navigation-tooltip"
      style="font-size: 12pt"
      role="tooltip"
      ></div>
  </div>
  </div>
  <div id="gapminder-controls" role="group">
  <p>
      <label for="year-slider"
      >Year: <span id="year-text">1992</span></label
      >
      <input type="range" min="1952" max="2007" id="year-slider" />
  </p>
  <p><button id="play-pause">Play/Pause</button></p>
  <p>
      <label for="x-dropdown">X axis:</label>
      <select id="x-dropdown">
      <option value="gdp_cap">GDP Per Capita</option>
      <option value="life_exp" selected>Life Expectancy</option>
      <option value="population">Population</option>
      </select>
  </p>
  <p>
      <label for="y-dropdown">Y axis:</label>
      <select id="y-dropdown">
      <option value="gdp_cap" selected>GDP Per Capita</option>
      <option value="life_exp">Life Expectancy</option>
      <option value="population">Population</option>
      </select>
  </p>
  <p>
      <label for="size-dropdown">Radius:</label>
      <select id="size-dropdown">
      <option value="gdp_cap">GDP Per Capita</option>
      <option value="life_exp">Life Expectancy</option>
      <option value="population" selected>Population</option>
      </select>
  </p>
  <p><button id="reset-zoom">Reset Zoom</button></p>
  <p style="font-size: 0.8em">
      Source: Free Data from World Bank via gapminder.org, CC-BY license
  </p>
  </div>
</div>

<link href="/counterpoint/assets/gapminder/gapminder.css" rel="stylesheet"/>
<script type="text/javascript"> 
        console.log('loading');
    var hasGapminder = false;
  import("/counterpoint/assets/gapminder/gapminder_accessible.js").then(({ loadGapminderPlot }) => {
    // load gapminder when the page changes if not already loaded
    new MutationObserver(() => {
      if (!!document.getElementById('gapminder-chart-container') && !hasGapminder) {
        hasGapminder = true;
        loadGapminderPlot();
      } else {
        hasGapminder = false;
      }
    })
    .observe(document.body, { childList: true })
    hasGapminder = true;
    loadGapminderPlot();
  });
</script>