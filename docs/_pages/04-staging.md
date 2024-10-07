---
layout: post
title: 'Animating Mark Entry and Exit'
---

Counterpoint's **stage** concept allows you to choreograph the animated entry and 
exit of marks from a render group. 

For example, in the demo below, click around the canvas to create points, then
click some existing points to remove them. You should see that the number of points
in the render group changes instantly when you remove a point. However, the number of points
in the *stage* (i.e., points that are being rendered) changes only after the fade-out animation completes. That's
because the stage keeps track of marks that are being animated in and out *separately*
from those that are part of the render group. This allows you to reuse marks that
have are exiting, and to separately manage the *specified* and *momentary* states
of the visualization.

<div>
    <p>Points in render group: <span id="render-group-ct">0</span>. Points in stage: <span id="stage-ct">0</span>.</p>
    <canvas id="stage-tile-canvas" style="width: 300px; height: 300px; border: 1px solid #999;"></canvas>
    <script>
        import('https://cdn.jsdelivr.net/npm/counterpoint-vis@latest/dist/counterpoint-vis.es.js').then(({ Mark, Ticker, MarkRenderGroup, PositionMap }) => {
            const canvas = document.getElementById("stage-tile-canvas");
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            
            let marks = new MarkRenderGroup().configure({
                hitTest (mark, location) {
                    let x = mark.attr('x');
                    let y = mark.attr('y');
                    return Math.sqrt((x - location[0]) * (x - location[0]) + (y - location[1]) * (y - location[1])) <= 20;
                }
            }).configureStaging({
                initialize: (element) => element.setAttr('alpha', 0.0),
                enter: async (element) => await element.animateTo('alpha', 1.0, { duration: 1000 }).wait('alpha'),
                exit: async (element) => await element.animateTo('alpha', 0.0, { duration: 1000 }).wait('alpha')
            });
            let positionMap = new PositionMap().add(marks);

            function draw() {
                const ctx = canvas.getContext('2d');

                // scaling for 2x devices
                ctx.resetTransform();
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

                if (marks.stage.count() == 0) {
                    ctx.fillStyle = '#999';
                    ctx.font = "14pt 'Helvetica Neue'";
                    ctx.textAlign = 'center';
                    ctx.fillText('Click to add and remove points', 150, 150);
                }
                marks.stage.forEach((mark) => {
                    let { x, y, alpha } = mark.get();
                    ctx.save();
                    ctx.strokeStyle = '#2563eb';
                    ctx.lineWidth = 2;
                    ctx.fillStyle = 'white';
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.ellipse(x, y, 20, 20, 0, 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = 'black';
                    ctx.font = "14pt 'Helvetica Neue'";
                    ctx.textAlign = 'center';
                    ctx.fillText(mark.id, x, y + 7);
                    ctx.restore();
                })

                document.getElementById('render-group-ct').innerText = `${marks.count()}`;
                document.getElementById('stage-ct').innerText = `${marks.stage.count()}`;
            }

            let ticker = new Ticker(marks).onChange(() => draw());

            canvas.addEventListener('click', (e) => {
                let location = [
                    e.pageX - canvas.getBoundingClientRect().left,
                    e.pageY - canvas.getBoundingClientRect().top,
                ];
                let nearest = marks.count() > 0 ? positionMap.hitTest(location) : null;
                if (!!nearest) {
                    marks.deleteMark(nearest);
                } else {
                    marks.addMark(new Mark(Math.floor(Math.random() * 100), {
                        x: location[0],
                        y: location[1],
                        alpha: 0.0
                    }));
                }
                positionMap.invalidate();
            });

            draw();
        });
    </script>
</div>

## Configuring Staging Behavior

You define how the stage should animate the entry and exit of marks using a simple
configuration method. For example, to animate the alpha and radius of a point
when it is added to the render group, we might configure our render group as follows:

```javascript
renderGroup.configureStaging({
    initialize: (mark) => mark.setAttr('alpha', 0.0).setAttr('radius', 0.0),
    enter: async (mark) => await (mark
        .animate('alpha', 1.0)
        .animate('radius', 20.0)
        .wait(['alpha', 'radius'])),
    exit: async (mark) => await (mark
        .animate('alpha', 0.0)
        .animate('radius', 0.0)
        .wait(['alpha', 'radius'])),
});
```

Here, we used three callback functions to specify the animation behavior:

- **`initialize`**: Static changes to the mark before it enters, i.e. setting it
    up for an entrance animation.
- **`enter`**: Animations to the mark to enter it onscreen. Note that this function
    should return a Promise that resolves when the animation completes, which we
    can easily provide using the <a href="{{ site.baseurl }}/pages/03-animation-timing#waiting-for-an-animation-to-complete">wait</a>
    function.
- **`exit`**: Animations to the mark to remove it from the screen. Similar to `enter`, 
    this function should return a Promise that resolves when the animation completes.

> **WARNING**
>
> If your `enter` and `exit` functions don't return Promises, the stage can exhibit
> unintended behavior. Be sure to call `wait()` after any animation calls.
> 
{: .block-warning }

## Adding and Removing Marks

Once your staging behavior is configured, you can simply add and remove marks from
the render group. The entry and exit animations will automatically be applied.

There are two ways to add and delete marks. The first way requires 
that you have a reference to the Mark you wish to add or remove:
```javascript
let mark = ...
// Add the mark
renderGroup.addMark(mark);
// Delete the mark
renderGroup.deleteMark(mark);
```
This method makes no assumptions about mark IDs and is purely imperative, so 
you can freely add or remove marks with the same ID.

In cases where you know that the mark IDs will be unique, you can use convenience
methods to add and remove marks just based on their IDs. To delete a mark by its
ID, simply call:
```javascript
renderGroup.delete(id);
```
To add a mark by its ID, the render group needs to know how to construct a new
mark based on the ID you give it. To do so, we can initialize the render group
using a factory function:
```javascript
renderGroup = new MarkRenderGroup((id) => new Mark(id, {
    x: ...,
    y: ...,
    color: 'green',
    alpha: 0
}));
```
Now, when we want to add a mark later, we can simply use the `add` method:
```javascript
renderGroup.add(id);
```

What if we want to customize the mark after adding it? We can just get the mark
and update it:
```javascript
(renderGroup.add(id).get(id)
 .setAttr('x', 200)
 .setAttr('y', 100));
```
