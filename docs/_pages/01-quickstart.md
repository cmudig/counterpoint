---
layout: post
title: 'Quickstart and Tutorial'
---

Counterpoint is a library of data structures for developing animated, interactive 
canvas-based web interfaces. It's best suited for people who are building data-
driven interfaces with custom or non-standard rendering requirements, such as 
D3.js users looking for additional flexibility and simpler canvas support.

## Installation

TBD update directions and urls

Importing Counterpoint in ES6 JavaScript is simple:

```javascript
import { Mark, Attribute, ... } from 'canvas-animation';
```

To import Counterpoint in vanilla JavaScript, you can use similar syntax but
refer to the full library URL:

```javascript
import { Mark, Attribute } from 'https://cdn.jsdelivr.net/gh/venkatesh-sivaraman/canvas-animation@main/canvas-animation/dist/canvas-animation.es.js';
```

or use [dynamic import syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#):

```javascript
import(
  'https://cdn.jsdelivr.net/gh/venkatesh-sivaraman/canvas-animation@main/canvas-animation/dist/canvas-animation.es.js'
).then((Counterpoint) => {
  // use Counterpoint as a module
});
```

## Setting Up a Canvas

This example will walk you through creating a simple rendering of some circles that
move across the screen when you click.

The first step to use Counterpoint is to set up an HTML5 Canvas element.
We'll place the canvas in our HTML and give it an id:

```html
<body>
  <canvas id="example-canvas" style="width: 300px; height: 300px;"></canvas>
</body>
```

Then we'll add some JavaScript to get the Canvas element and draw to it:

```html
<script type="text/javascript">
  const canvas = document.getElementById('example-canvas');
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;

  function draw() {
    const ctx = canvas.getContext('2d');

    // scaling for 2x devices
    ctx.resetTransform();
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.ellipse(150, 150, 20, 20, 0, 0, 2 * Math.PI, false);
    ctx.fill();
  }

  draw();
</script>
```

The canvas should now look like this:

<div>
    <canvas id="example-canvas-1" style="width: 300px; height: 300px; border: 1px solid #999;"></canvas>
    <script>
      (() => {
        const canvas = document.getElementById("example-canvas-1");
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;

        function draw() {
            const ctx = canvas.getContext('2d');

            // scaling for 2x devices
            ctx.resetTransform();
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.ellipse(150, 150, 20, 20, 0, 0, 2 * Math.PI, false);
            ctx.fill();
        }

        draw();
      })();
    </script>

</div>

## Defining Marks and a Render Group

At this point, if we wanted to manually create multiple circles and have them
animate, we would have to create a data structure to hold the point coordinates,
then update that data structure every frame and redraw the canvas accordingly.
That's because unlike with [SVG](https://www.w3schools.com/html/html5_svg.asp),
objects on a canvas are not DOM elements so you cannot use
[CSS animations](https://www.w3schools.com/css/css3_animations.asp) to animate them.
This quickly becomes cumbersome when not all elements are animating at the same
times, when adding or removing elements, or when you want to cancel one animation
mid-flight and begin another one.

**Counterpoint can help you achieve great animations as easily as with SVG, while
getting the great performance and scalability of Canvas.**

It does this by letting you express the contents of the canvas in terms of
**marks**, or drawable units, that have animatable **attributes**. For instance,
in a scatter plot, the marks might be points consisting of _x_ and _y_ attributes.

Let's set up some marks in our script to represent two circles. Each `Mark` is
constructed with an ID (any identifier) and a dictionary of attributes:

```javascript
let marks = [
  new Mark(0, { x: new Attribute(50), y: new Attribute(50) }),
  new Mark(1, { x: new Attribute(200), y: new Attribute(100) }),
];
```

Attributes can also be initialized with functions that get called whenever the
attribute is needed. For example, we could set up a `color` attribute that
changes depending on the marks' x and y positions:

```javascript
function getColor(mark) {
  return `hsl(${mark.attr('x') * 360 / 500}, ${mark.attr('y') * 100 / 500}%, 40%)`;
}

let marks = [
  new Mark(0, { x: new Attribute(50), y: new Attribute(50), color: new Attribute(getColor) },
  new Mark(1, { x: new Attribute(200), y: new Attribute(100), color: new Attribute(getColor) }),
];
```

Counterpoint also provides a container called `MarkRenderGroup` which helps
manage animations and updates over a potentially large set of marks. Let's use it
to wrap our array of marks:

```javascript
let renderGroup = createRenderGroup(marks);
```

Now that we've defined our marks and their attributes, we can use them to
re-implement the `draw()` function we created above. Every time `draw()` gets
called (which is still just once for now, until we add animations), we iterate
over the render group and get each mark's coordinates using the `Mark.attr()`
method.

```javascript
function draw() {
  const ctx = canvas.getContext('2d');

  // scaling for 2x devices
  ctx.resetTransform();
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

  ctx.fillStyle = 'blue';
  // iterate over the marks in the render group and draw them
  renderGroup.forEach((mark) => {
    ctx.beginPath();
    ctx.fillStyle = mark.attr('color');
    ctx.ellipse(mark.attr('x'), mark.attr('y'), 20, 20, 0, 0, 2 * Math.PI, false);
    ctx.fill();
  });
}
```

<div>
    <canvas id="example-canvas-2" style="width: 300px; height: 300px; border: 1px solid #999;"></canvas>
    <script>
        import('https://cdn.jsdelivr.net/gh/venkatesh-sivaraman/canvas-animation@main/canvas-animation/dist/canvas-animation.es.js').then(({ Mark, Attribute, createRenderGroup }) => {
            const canvas = document.getElementById("example-canvas-2");
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;

            function getColor(mark) {
              return `hsl(${mark.attr('x') * 360 / 500}, ${mark.attr('y') * 100 / 500}%, 40%)`;
            }

            let marks = [
                new Mark(0, { x: new Attribute(50), y: new Attribute(50), color: new Attribute(getColor) }),
                new Mark(1, { x: new Attribute(200), y: new Attribute(100), color: new Attribute(getColor) }),
            ];
            let renderGroup = createRenderGroup(marks);

            function draw() {
                const ctx = canvas.getContext('2d');

                // scaling for 2x devices
                ctx.resetTransform();
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

                ctx.fillStyle = 'blue';
                renderGroup.forEach((mark) => {
                    ctx.beginPath();
                    ctx.fillStyle = mark.attr('color');
                    ctx.ellipse(mark.attr('x'), mark.attr('y'), 20, 20, 0, 0, 2 * Math.PI, false);
                    ctx.fill();
                });
            }

            draw();
        });
    </script>

</div>

That's great, but it still looks pretty basic. Let's add some animations!

## Simple Animations

Now that we've encoded our canvas objects as `Mark` instances and placed them
in a render group, it's easy to perform animations on the attributes we've
defined. As the animations play, our `draw()` function will get called every
frame, and the values returned by the `Mark.attr()` method will automatically
interpolate to the new values.

> **TIP: Keeping it Fast**
> 
> Since the `draw()` function will get called about 60 times per second during animations, it's 
> important to make sure it runs fast and doesn't perform any unnecessary
> calculations. Plus, you can configure Counterpoint to redraw only when
> needed, improving performance and saving energy. See [Optimizing Performance]({% link _pages/07-optimizing-performance.md %}) 
> to learn more.
> 
>
{: .block-tip }

To enable animations, we first have to create a **<a href="{{ site.baseurl }}/pages/03-animation-timing#triggering-render-updates-with-a-ticker">ticker</a>** to keep track of our
animations' timing. This `Ticker` instance will keep track of the render group(s)
we give it, and we pass it a function to call when the state of the render group
changes:

```javascript
ticker = new Ticker(renderGroup).onChange(draw);
```

Now all that's left is to write the animations! For this example we'll simply add
a button that animates both circles' locations to a random spot when clicked. The
click handler will look like this:

```javascript
function animateCircles() {
  renderGroup
    .animateTo('x', () => Math.random() * 300)
    .animateTo('y', () => Math.random() * 300);
}
```

And we'll add the click handler to a new button:

```html
<button onclick="animateCircles">Animate</button>
```

Once completed, you should have something that looks like the following:

<div>
    <canvas id="example-canvas-3" style="width: 300px; height: 300px; border: 1px solid #999;"></canvas>
    <div><button style="margin-bottom: 32px;" id="animate-button-3">Animate</button></div>
    <script>
        import('https://cdn.jsdelivr.net/gh/venkatesh-sivaraman/canvas-animation@main/canvas-animation/dist/canvas-animation.es.js').then(({ Mark, Attribute, Ticker, createRenderGroup }) => {
            const canvas = document.getElementById("example-canvas-3");
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;

            function getColor(mark) {
              return `hsl(${mark.attr('x') * 360 / 500}, ${mark.attr('y') * 100 / 500}%, 40%)`;
            }

            let marks = [
                new Mark(0, { x: new Attribute(50), y: new Attribute(50), color: new Attribute(getColor) }),
                new Mark(1, { x: new Attribute(200), y: new Attribute(100), color: new Attribute(getColor) }),
            ];
            let renderGroup = createRenderGroup(marks);

            function draw() {
                const ctx = canvas.getContext('2d');

                // scaling for 2x devices
                ctx.resetTransform();
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

                ctx.fillStyle = 'blue';
                renderGroup.forEach((mark) => {
                    ctx.beginPath();
                    ctx.fillStyle = mark.attr('color');
                    ctx.ellipse(mark.attr('x'), mark.attr('y'), 20, 20, 0, 0, 2 * Math.PI, false);
                    ctx.fill();
                });
            }

            let ticker = new Ticker(renderGroup).onChange(() => draw());

            document.getElementById('animate-button-3').addEventListener('click', () => {
              renderGroup
                .animateTo('x', () => Math.random() * 300)
                .animateTo('y', () => Math.random() * 300);
            });

            draw();
        });
    </script>
</div>

Although these are simple animations so far, you can already see that Counterpoint
has helped make our animations easy to create yet smooth. For example, if you click
the button multiple times quickly, you'll see that the animations smoothly switch
from one to the next with no jitter. And we didn't have to animate the `color`
property, since that was automatically computed from our animations to `x` and `y`.

## Next Steps

From here, you can check out further documentation to learn about [how to use attributes and marks effectively]({{ site.baseurl }}/pages/02-marks-and-rendergroups),
[make more complex animations]({{ site.baseurl }}/pages/03-animation-timing), 
[add and remove marks dynamically]({{ site.baseurl }}/pages/04-staging),
[make your canvases non-visually accessible]({{ site.baseurl }}/pages/06-accessible-navigation), and more.

We've also provided some more complete examples (TODO).