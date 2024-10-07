---
layout: post
title: 'Interaction and Pan/Zoom'
---

While Counterpoint does not provide built-in rendering capabilities, it does
provide helper classes to make it easier to use Canvas and WebGL for rendering 
while still supporting interaction.

## Retrieving Marks by Position

For many interactive applications, you'll need to detect what mark is under the 
user's cursor based on the mark coordinates. You may also
need to enumerate the set of marks that are within a certain distance of the
user's cursor. Counterpoint supports both tasks using an efficient hashing-based 
algorithm implemented in the `PositionMap` class.

In the example below, as you hover your mouse, you can see that the `hitTest`
returns at most one mark that contains the mouse location. The `marksNear` function
can return multiple marks that are within 50 pixels of the mouse.

<div>
    <p>hitTest: <span id="hittest">none</span>. marksNear: <span id="marksnear">none</span>.</p>
    <canvas id="hit-test-canvas" style="width: 300px; height: 300px; border: 1px solid #999;"></canvas>
    <script>
        import('https://cdn.jsdelivr.net/npm/counterpoint-vis@latest/dist/counterpoint-vis.es.js').then(({ Mark, Ticker, MarkRenderGroup, PositionMap }) => {
            const canvas = document.getElementById("hit-test-canvas");
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            
            let marks = new MarkRenderGroup(new Array(25).fill(0).map((_, i) => new Mark(i, {
                x: Math.random() * 300,
                y: Math.random() * 300,
                alpha: 1.0,
                lineWidth: 2.0
            }))).configure({
                animationDuration: 200,
                hitTest (mark, location) {
                    let x = mark.attr('x');
                    let y = mark.attr('y');
                    return Math.sqrt((x - location[0]) * (x - location[0]) + (y - location[1]) * (y - location[1])) <= 20;
                }
            }).onEvent('hittest', (m, hitTest) => {
                let newWidth = m.id == hitTest?.id ? 5.0 : 2.0;
                if (newWidth != m.data('lineWidth'))
                    m.animateTo('lineWidth', newWidth);
            }).onEvent('marksnear', (m, marksNear) => {
                let newAlpha = marksNear.length == 0 || marksNear.includes(m) ? 1.0 : 0.2;
                if (newAlpha != m.data('alpha'))
                    m.animateTo('alpha', newAlpha);
            });
            let positionMap = new PositionMap().add(marks);

            function draw() {
                const ctx = canvas.getContext('2d');

                // scaling for 2x devices
                ctx.resetTransform();
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

                marks.forEach((mark) => {
                    let { x, y, lineWidth, alpha } = mark.get();
                    ctx.save();
                    ctx.strokeStyle = '#2563eb';
                    ctx.lineWidth = lineWidth;
                    ctx.fillStyle = 'white';
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.ellipse(x, y, 20, 20, 0, 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = 'black';
                    ctx.font = "12pt 'Helvetica Neue'";
                    ctx.textAlign = 'center';
                    ctx.fillText(mark.id, x, y + 6);
                    ctx.restore();
                });
            }

            let ticker = new Ticker(marks).onChange(() => draw());

            canvas.addEventListener('mousemove', (e) => {
                let location = [
                    e.pageX - canvas.getBoundingClientRect().left,
                    e.pageY - canvas.getBoundingClientRect().top,
                ];
                let hitTest = positionMap.hitTest(location);
                document.getElementById("hittest").innerText = !!hitTest ? `${hitTest.id}` : 'none';
                marks.animateTo('lineWidth', (m) => m.id == hitTest?.id ? 5.0 : 2.0, { overrideIfIdentical: false });
                // marks.dispatch('hittest', hitTest);
                let marksNear = positionMap.marksNear(location, 50);
                document.getElementById("marksnear").innerText = marksNear.length > 0 ? marksNear.map((m) => `${m.id}`).join(', ') : 'none';
                // marks.dispatch('marksnear', marksNear);
                marks.animateTo('alpha', (m) => marksNear.length == 0 || marksNear.includes(m) ? 1.0 : 0.2, { overrideIfIdentical: false });
            });
            canvas.addEventListener('mouseleave', (e) => {
                marks.animateTo('lineWidth', 2.0);
                marks.animateTo('alpha', 1.0);
            })

            draw();
        });
    </script>
</div>

To use hit-testing, first define a hit-test function for each mark. This determines
whether a location is contained within the mark. For example, if we have circular marks,
we could use a Euclidean distance function:
```javascript
renderGroup.configure({
    ...,
    hitTest: (mark, location) => {
        let x = mark.attr('x');
        let y = mark.attr('y');
        let r = mark.attr('radius');
        return Math.sqrt(Math.pow(x - location[0], 2.0) + Math.pow(y - location[1], 2.0)) <= r;
    }
});
```

Then, we create a position map and add the render group to it:
```javascript
let positionMap = new PositionMap().add(renderGroup);
```

When we want to query the position map, we can call the `hitTest` function, with
an array of coordinates, e.g.:
```javascript
function handleMouseMove(event) {
    let location = [
        event.pageX - canvas.getBoundingClientRect().left,
        event.pageY - canvas.getBoundingClientRect().top,
    ];
    let hit = positionMap.hitTest(location);
    if (hit) {
        // do something...
    }
}
```

To simply get the marks within a given radius of a location, the logic is very
similar, and a hit-test function is not required:
```javascript
let marksInRadius = positionMap.marksNear(location, radius);
```

**IMPORTANT:** When using a Position Map, the internal memory of where points are
located is *not* automatically updated. Call the `invalidate` method to notify
the position map that it needs to be recomputed:
```javascript
// some code to modify point locations...
positionMap.invalidate();
```

### `PositionMap` Options

| Option | Description |
|:-------|:-----------:|
| `coordinateAttributes: string[]` | The names of the attributes to use for coordinates from each mark |
| `marksPerBin: number` | The approximate average number of marks to place in each bin. This is used to determine the bin size. If the number of marks will be very large, it is recommended to set this to a higher number to prevent a very sparse hash map.|
| `transformCoordinates: boolean` | Whether or not to run the transform function on each coordinate. If set to `false`, this can allow the position map to run in untransformed coordinates and thus be invariant to pan and zoom interactions, if the transform function performs pan/zoom scaling. |
| `maximumHitTestDistance: number` | The default maximum distance to search when hit-testing. Set this to the largest distance from mark coordinates that would be expected to result in a match. |

## Pan and Zoom

Counterpoint offers pan and zoom transforms in a `Scales` class, which uses 
Counterpoint attributes under the hood so it can respond reactively to other 
attributes. These scales are interoperable with [D3's zoom framework](https://d3js.org/d3-zoom).

Try zooming and panning the scatterplot below to see how it works. You can also
click the buttons to zoom to or follow specific points as you animate the plot.
([See the code on GitHub.](https://github.com/cmudig/counterpoint/tree/main/examples/zoomable_scatter))

<div>
      <canvas style="width: 500px; height: 500px;" id="pan-zoom-canvas"></canvas>
        <div>
            <button id="animatePoints">Animate</button>
            <button id="centerPoint">Center Random Point</button>
            <button id="zoomToPoints">Zoom to 2 Points</button>
            <button id="followPoints">Follow 2 Points</button>
            <button id="resetZoom">Reset Zoom</button>
        </div>
    <p>Selected indexes: <span id="sel-idxs">none</span></p>
    <script>
        import('https://cdn.jsdelivr.net/npm/d3@7/+esm').then((d3) => {
            import('https://cdn.jsdelivr.net/npm/counterpoint-vis@latest/dist/counterpoint-vis.es.js').then(({ Mark, Ticker, MarkRenderGroup, Scales, curveEaseInOut, markBox, centerOn }) => {
                const canvas = document.getElementById("pan-zoom-canvas");
                canvas.width = canvas.offsetWidth * window.devicePixelRatio;
                canvas.height = canvas.offsetHeight * window.devicePixelRatio;
                
                let scales = new Scales({ animationDuration: 500 })
                    .xRange([0, 500])
                    .yRange([0, 500])
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

                    // for demo purposes, animate the color to show that the follow behavior changed
                    if (!scales.controller && zoomedIdxs.length > 0) {
                        markSet.wait('color').then(() => {
                        zoomedIdxs = [];
                        markSet.animate('color', { delay: 2000 });
                        });
                    }
                    });

                let markSet = new MarkRenderGroup(
                    new Array(100).fill(0).map(
                    (_, i) =>
                        new Mark(i, {
                        x: {
                            value: Math.random(),
                            transform: scales.xScale,
                        },
                        y: {
                            value: Math.random(),
                            transform: scales.yScale,
                        },
                        color: {
                            valueFn: (m) => (zoomedIdxs.includes(m.id) ? '#7dd3fc' : '#9f1239'),
                            lazy: true,
                        },
                        })
                    )
                ).configure({
                    animationDuration: 500,
                    animationCurve: curveEaseInOut,
                });

                let ticker = new Ticker([markSet, scales]).onChange(draw);

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

                let zoomedIdxs = [];

                function draw() {
                    if (!!canvas) {
                    let ctx = canvas.getContext('2d');

                    if (!!ctx) {
                        ctx.resetTransform();
                        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 1.0;
                        markSet.forEach((mark) => {
                        let x = mark.attr('x');
                        let y = mark.attr('y');
                        let color = mark.attr('color');
                        ctx.fillStyle = color;
                        ctx?.beginPath();
                        ctx?.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI, false);
                        ctx?.fill();
                        ctx?.stroke();
                        ctx?.closePath();
                        });
                    }
                    }

                    document.getElementById("sel-idxs").innerText = zoomedIdxs.length > 0 ? zoomedIdxs.join(', ') : "none";
                }

                document.getElementById("animatePoints").addEventListener("click", () => {
                    markSet
                    .animateTo('x', () => Math.random(), { duration: 5000 })
                    .animateTo('y', () => Math.random(), { duration: 5000 });
                });

                document.getElementById("resetZoom").addEventListener("click", () => {
                    scales.reset(true);
                    zoomedIdxs = [];
                    markSet.animate('color');
                });

                document.getElementById("zoomToPoints").addEventListener("click", () => {
                    // select two random points
                    zoomedIdxs = [
                    Math.round(Math.random() * markSet.count()),
                    Math.round(Math.random() * markSet.count()),
                    ];
                    markSet.animate('color');
                    scales.zoomTo(markBox(zoomedIdxs.map((i) => markSet.get(i))));
                });

                document.getElementById("followPoints").addEventListener("click", () => {
                    // select two random points
                    zoomedIdxs = [
                    Math.round(Math.random() * markSet.count()),
                    Math.round(Math.random() * markSet.count()),
                    ];
                    markSet.animate('color');
                    scales.follow(markBox(zoomedIdxs.map((i) => markSet.get(i))));
                });

                document.getElementById("centerPoint").addEventListener("click", () => {
                    zoomedIdxs = [Math.round(Math.random() * markSet.count())];
                    markSet.animate('color');
                    scales.follow(centerOn(markSet.get(zoomedIdxs[0])));
                });

                // set up the d3 zoom object
                d3.select(canvas).call(zoom);

                draw();
            });
        });
    </script>
</div>

To initialize the `Scales`, you provide the X and Y domains and ranges. Domains
represent the extent of values in your mark coordiantes, while ranges represent
the extent of values they should be mapped to on the screen. For example, to
display values ranging from -1 to 1 in a plot that is 600 x 600 pixels, we can use:
```javascript
let scales = (new Scales()
    .xDomain([-1, 1])
    .yDomain([-1, 1])
    .xRange([0, 600])
    .yRange([0, 600])
);
```

Then, you can pass the `scales.xScale` and `scales.yScale` properties as-is to
the `transform` options of your marks' coordinate attributes:
```javascript
let mark = new Mark(id, {
    x: {
        value: ...,
        transform: scales.xScale
    },
    y: {
        value: ...,
        transform: scales.yScale
    }
});
```

Importantly, you must add the `scales` to your Ticker so that the view will be
redrawn when the scales change.

Now, you can simply implement zooming and panning using gestures (or use D3-zoom),
and update the `scales` object as needed. Below we provide example code for
implementing basic zoom and pan with native JavaScript event handlers and with
D3-zoom:

**Native JavaScript** (supports scroll wheel and click+drag only)

```javascript
let lastMousePos: [number, number] | null = null;

function onMousedown(e: MouseEvent) {
    lastMousePos = [
        e.clientX - canvas.getBoundingClientRect().left,
        e.clientY - canvas.getBoundingClientRect().top,
    ];
}

function onMousemove(e: MouseEvent) {
    if (lastMousePos != null) {
        let newMousePos: [number, number] = [
            e.clientX - canvas.getBoundingClientRect().left,
            e.clientY - canvas.getBoundingClientRect().top,
        ];
        scales.translateBy(
            newMousePos[0] - lastMousePos[0],
            newMousePos[1] - lastMousePos[1]
        );
        lastMousePos = newMousePos;
        e.preventDefault();
    }
}

function onMouseup(e: MouseEvent) {
    lastMousePos = null;
}

function onMouseWheel(e: WheelEvent) {
    let ds = -0.01 * e.deltaY;

    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    scales.scaleBy(ds, [mouseX, mouseY]);

    e.preventDefault();
}
```

**D3 Zoom**

```javascript
let zoom = d3
    .zoom()
    .scaleExtent([0.1, 10])
    .on('zoom', (e) => {
        // important to make sure the source event exists, filtering out our
        // programmatic changes
        if (e.sourceEvent != null) {
            // tell the scales the zoom transform has changed
            scales.transform(e.transform);
        }
    });
d3.select(canvas).call(zoom);

scales.onUpdate(() => {
    // When the scales update, we also need to let the d3 zoom object know that
    // the zoom transform has changed
    let sel = d3.select(canvas);
    let currentT = d3.zoomTransform(canvas);
    let t = scales.transform();
    if (t.k != currentT.k || t.x != currentT.x || t.y != currentT.y) {
        sel.call(zoom.transform, new d3.ZoomTransform(t.k, t.x, t.y));
    }
});
```

### Reactive Zoom Behavior

As shown in the demo above, the `Scales` class can update dynamically in response
to marks that you provide. There are two main types of updates you can perform:

1. **Zoom Once** (`Scales.zoomTo`): Update the transform to focus on a given set
    of marks in their current locations. If these marks move later, the scales
    will not change.
2. **Follow** (`Scales.follow`/`Scales.unfollow`): Update the transform to remain
    focused on a given set of marks, even if they change locations.

With either of these updates, you can specify how to compute the desired zoom 
transform by passing an instance of `MarkFollower` to the `zoomTo` or `follow`
methods. There are two easy ways to define a `MarkFollower`:

1. **Center on a Point** (`centerOn`): This global helper function takes a single
    mark as input, and it computes a box in which the given mark is centered. It
    also provides options to set the padding, etc.
    For example:
    ```javascript
    scales.follow(centerOn(myMark, { padding: 50 }));
    ```

2. **Contain a set of Marks** (`markBox`): This function takes an array of marks
    as input, and computes a box that contains all of the marks. For example:
    ```javascript
    scales.zoomTo(markBox(myFavoriteMarks, { padding: 50 }));
    ```

> **TIP: Custom Coordinate Names**
>
> If your marks use names other than 'x' and 'y' to represent their coordinates,
> you can specify which attributes should be used to compute the mark box using
> the `xAttr` and `yAttr` options.
> 
{: .block-tip }

