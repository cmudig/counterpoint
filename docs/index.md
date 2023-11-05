---
layout: home
---

Counterpoint is a **library of data structures** designed to help create beautifully smooth data-driven 
animations and interactive graphics. It's ideal for developers who are used to 
working with [D3.js](http://d3js.org/) or other customizable graphics libraries, but 
need more control and design options for animations.

Counterpoint **is**:

- **Lightweight and fast.** You can animate anywhere from hundreds to millions 
  of data points using Counterpoint. Unlike most multipurpose animation libraries,
  Counterpoint is specifically designed to work well with HTML5 Canvas and WebGL.
- **Reactive (when you need it).** Reactive web frameworks like React and Svelte
  make it much easier to manage application state than vanilla JS, but those
  affordances don't tend to scale well to individual data points and their
  properties. With Counterpoint, you can make data item properties reactive while
  retaining full control over when those properties update.
- **Compatible with popular libraries.** Use Counterpoint in combination with
  [D3](http://d3js.org), [regl](http://regl.party), [Svelte + LayerCake](http://layercake.graphics),
  and more. Let those libraries handle the graphics or the chart logic, we'll
  handle the animations.
  
Counterpoint **is not**:

- **A graphics library.** Perhaps surprisingly, Counterpoint doesn't contain any
  rendering code. You bring all the rendering code yourself, which means you can
  make the outputs look exactly as you want!
- **A replacement for D3 or Vega.** Similarly, Counterpoint makes no assumptions or opinions
  about charts, and doesn't provide any functionality to render chart elements
  such as axes, grids, or legends. To build charts, we highly recommend using
  modules from D3 such as `d3-zoom`, `d3-axis`, and others in combination with
  Counterpoint's data structures.

Ready to get started? Head over to the [quickstart]({% link _pages/01-quickstart.md %}) 
to install and learn the basics.

Or, check out this demo chart showing worldwide GDP, life expectancy, and population
trends from [Gapminder](https://gapminder.org). The code for this example (link TODO) is
around 600 lines and showcases several Counterpoint features along with how to combine
them with functionality from D3.

<div style="display: flex; max-width: 100%; flex-wrap: wrap;">
  <div id="gapminder-chart-container" style="position: relative; flex-shrink: 0;">
    <svg width="600" height="600" id="gapminder-axes" style="position: absolute; top: 0; left: 0;" overflow="visible"></svg>
    <canvas id="gapminder-content" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
  </div>
  <div id="gapminder-controls">
  <p><label for="year-slider">Year: <span id="year-text">1992</span></label>
  <input type="range" min="1952" max="2007" id="year-slider"/></p>
  <p><button id="play-pause">Play/Pause</button></p>
  <p><label for="x-dropdown">X axis:</label>
  <select id="x-dropdown">
    <option value="gdp_cap">GDP Per Capita</option>
    <option value="life_exp" selected>Life Expectancy</option>
    <option value="population">Population</option>
  </select></p>
  <p><label for="y-dropdown">Y axis:</label>
  <select id="y-dropdown">
    <option value="gdp_cap" selected>GDP Per Capita</option>
    <option value="life_exp">Life Expectancy</option>
    <option value="population">Population</option>
  </select></p>
  <p><label for="size-dropdown">Radius:</label>
  <select id="size-dropdown">
    <option value="gdp_cap">GDP Per Capita</option>
    <option value="life_exp">Life Expectancy</option>
    <option value="population" selected>Population</option>
  </select></p>
  <p><button id="reset-zoom">Reset Zoom</button></p>
  <p style="font-size: 0.8em;">Source: Free Data from World Bank via gapminder.org, CC-BY license</p>
</div>
<script type="module" src="/canvas-animation/assets/gapminder.js"></script>