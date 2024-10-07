---
layout: post
title: 'Accessible Rendering and Navigation'
---

Counterpoint's state management functionality helps you accommodate users with
different preferences about the appearance, animation, and navigation style of
your interfaces. Check out the [Accessible Gapminder plot]({{ site.baseurl }}/2024/04/30/gapminder-accessible) to see some examples.

## Responding to Global User Preferences

It's important to respect users' accessibility preferences regarding graphics and
animation. This can help users who have vestibular or photosensitive disabilities
use your visualizations.

Ordinarily, these preferences are exposed to your application as [CSS media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries). Counterpoint *wraps*
these media queries in a reactive type called the `RenderContext`.

To respond to `RenderContext` changes in your rendering, add it to your ticker:
```javascript
const renderContext = getRenderContext();
let ticker = new Ticker([
    // other elements...
    renderContext
]);
```

Then, in your drawing function, you can use the following properties of the 
render context (which are exposed as simple JavaScript types, not Counterpoint
Attributes):

- **Reduced Motion** (`renderContext.prefersReducedMotion`, boolean): wraps the CSS
    `prefers-reduced-motion` media query
- **Reduced Transparency** (`renderContext.prefersReducedTransparency`, boolean):
    wraps the CSS `prefers-reduced-transparency` media query
- **Contrast** (`renderContext.contrastPreference`, enum): wraps the CSS
    `prefers-contrast` media query. Possible values are `ContrastPreference.none`,
    `more`, or `less`.
- **Color Scheme** (`renderContext.colorSchemePreference`, enum): wraps the CSS
    `prefers-color-scheme` media query. Possible values are `ColorSchemePreference.light`
    or `dark`.

## Implementing Alternate Animation Styles with Events

As described in [Event Listeners]({{ site.baseurl }}/pages/02-marks-and-rendergroups#event-listeners),
render groups provide an event dispatching mechanism that allows you to separate
the *triggering* of animation events with how marks *execute* them. This can
allow you to implement alternative animation styles, such as versions with and
without motion or transparency.

In the below example, you can click the button to change between motion animations
and fade animations.

<div>
      <canvas style="width: 500px; height: 500px;" id="motion-canvas"></canvas>
        <div>
            <button id="animatePoints">Animate</button>
            <label><input type="checkbox" checked id="motion-checkbox" /> Motion animation</label>
        </div>
    <script>
        import('https://cdn.jsdelivr.net/npm/counterpoint-vis@latest/dist/counterpoint-vis.es.js').then(({ Mark, Ticker, MarkRenderGroup }) => {
            const canvas = document.getElementById("motion-canvas");
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;

            let reduceMotion = false;

            let markSet = new MarkRenderGroup(
                new Array(100).fill(0).map(
                    (_, i) =>
                        new Mark(i, {
                        x: Math.random() * 500,
                        y: Math.random() * 500,
                        alpha: 1.0,
                        color: `hsl(${Math.random() * 360}, 70%, 40%)`
                    })
                )
            ).configure({
                animationDuration: 500,
            }).configureStaging({
                initialize: (mark) => mark.setAttr('alpha', 0.0),
                enter: (mark) => mark.animateTo('alpha', 1.0).wait('alpha'),
                exit: (mark) => mark.animateTo('alpha', 0.0).wait('alpha')
            }).onEvent('animate', async (mark, locationFn) => {
                let newCoords = locationFn(mark);
                if (!reduceMotion) {
                    mark.animateTo('x', newCoords.x, { duration: 1000 });
                    mark.animateTo('y', newCoords.y, { duration: 1000 });
                } else {
                    let clone = mark.copy(mark.id, { x: newCoords.x, y: newCoords.y });
                    markSet.addMark(clone);
                    markSet.deleteMark(mark);
                }
            });

            let ticker = new Ticker([markSet]).onChange(draw);

            function draw() {
                if (!!canvas) {
                let ctx = canvas.getContext('2d');

                if (!!ctx) {
                    ctx.resetTransform();
                    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 1.0;
                    markSet.stage.forEach((mark) => {
                        ctx.save();
                        let { x, y, color, alpha } = mark.get();
                        ctx.fillStyle = color;
                        ctx.globalAlpha = alpha;
                        ctx?.beginPath();
                        ctx?.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI, false);
                        ctx?.fill();
                        ctx?.stroke();
                        ctx?.closePath();
                        ctx.restore();
                    });
                }
                }
            }

            document.getElementById("animatePoints").addEventListener("click", () => {
                markSet.dispatch('animate', (mark) => ({
                    x: mark.attr('x') + Math.random() * 50 - 25,
                    y: mark.attr('y') + Math.random() * 50 - 25
                }))
            });

            document.getElementById("motion-checkbox").addEventListener("change", (e) => {
                reduceMotion = !e.target.checked;
            });

            draw();
        });
    </script>
</div>

To implement this, let's say we have a variable called `reduceMotion` 
representing the value of the checkbox above (or we can get the value from `RenderContext.prefersReducedMotion`).
We configure the render group to listen for an event called 'animate' and perform
the appropriate animation depending on the `reduceMotion` setting. To implement
the fade animations, we simply create a clone of each mark, animate its alpha
using the stage manager, then remove the original.

```javascript
renderGroup.configureStaging({
    initialize: (mark) => mark.setAttr('alpha', 0.0),
    enter: (mark) => mark.animateTo('alpha', 1.0).wait('alpha'),
    exit: (mark) => mark.animateTo('alpha', 0.0).wait('alpha')
}).onEvent('animate', (mark, locationFn) => {
    let newCoords = locationFn(mark);
    if (reduceMotion) {
        // fade animation
        let clone = mark.copy(mark.id, { x: newCoords.x, y: newCoords.y });
        markSet.addMark(clone);
        markSet.deleteMark(mark);
    } else {
        // motion animation
        mark.animateTo('x', newCoords.x, { duration: 1000 });
        mark.animateTo('y', newCoords.y, { duration: 1000 });
    }
});
```

Here, `locationFn` is a function specifying where each point should be moved to.
When the points need to be animated, we dispatch an 'animate' event and provide 
that location function:

```javascript
markSet.dispatch('animate', (mark) => ({
    x: mark.attr('x') + Math.random() * 50 - 25,
    y: mark.attr('y') + Math.random() * 50 - 25
}));
```

## Navigation with Data Navigator

[Data Navigator](https://www.npmjs.com/package/data-navigator)
is a library to help make data visualizations navigable by interfacing with a 
variety of input formats, such as key presses, gestures, and voice commands.
While Counterpoint is a state management library, Data Navigator is stateless.
So the two libraries complement each other to help you develop performant
animated visualizations that are also accessible to those who need alternate
ways of navigating charts.

To see an example of how Data Navigator can be used with Counterpoint, see the
[running demo]({{ site.baseurl}}/2024/04/30/gapminder-accessible) and 
[source code](https://github.com/cmudig/counterpoint/blob/main/docs/assets/gapminder/gapminder_accessible.js)
of an accessible Gapminder chart.