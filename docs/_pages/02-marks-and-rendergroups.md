---
layout: post
title: 'Attributes, Marks and Render Groups'
---

To start using Counterpoint, you need to describe the data you plan to render
in terms of **marks** and **attributes**. This page explains how to create marks
and attributes, as well as to control how and when attribute values are calculated.
Note that how you render these marks and attributes is entirely up to you - see
the available examples to learn how to render marks using Canvas and WebGL APIs.

> **TIP: Custom Attribute Collections**
> 
> A mark is essentially a convenient wrapper around a collection of attributes
> that works well with other classes used in Counterpoint, like `MarkRenderGroup`
> and `PositionMap`. But you can easily create other data structures to wrap
> collections of attributes that you want to animate. The `Scales` class is one
> example of this, using attributes to represent the scale and translate factors.
> 
{: .block-tip }

## Basic Mark Usage

A `Mark` instance can be initialized using a unique ID and an object
containing attributes, such as the following:

```javascript
let mark = new Mark(1, {
    x: new Attribute(15),
    y: new Attribute(37),
    color: new Attribute('steelblue')
});
```

Here, the mark was initialized with three attributes (named `x`, `y`, and `color`),
each set to a static value. You can retrieve the value of the `x` attribute with
`mark.attr('x')` (or if you have a direct reference to the attribute, `attribute.get()`).
To set the attribute's value instantaneously, you can call `mark.setAttr('x', newValue)` (or
`attribute.set(newValue)`). Animating attribute values uses a similar API,
described in [Animations, Timing, and Sequencing]({{ site.baseurl }}/pages/03-animation-timing).

Attribute values don't have to be static. For instance, we can define a function
to return the color of the mark, and pass that to the attribute constructor:

```javascript
function getColor(mark) { ... }

let mark = new Mark(1, {
    ...
    color: new Attribute(getColor)
})
```

Now, `getColor` will be called every time the attribute's value is retrieved
using `Mark.attr` or `Attribute.get`. (What if you don't want this function to
be called every time? Check out <a href="#controlling-attribute-computation">When Attributes
Change</a> below.)

You can also pass an object of options to the attribute constructor, including
the attribute's value under either the `value` (for a static value) or `valueFn`
(for a function) keys. The options you can pass are listed in the 
<a href="#Attribute-constructor">API Reference</a> below. For example:

```javascript
new Attribute({
    valueFn: (mark) => getCoordinate(mark, 'x'),
    transform: (value) => scaleX(value),
    lazy: true
})
```

## Combining Marks in a Render Group

The `MarkRenderGroup` class allows you to manage animations and updates across
a potentially large set of marks using less code. All marks contained within a
render group are expected to have the same set of attribute names. Initialize 
a render group with an array of marks:

```javascript
let renderGroup = new MarkRenderGroup(marks);
let renderGroup = createRenderGroup(marks); // equivalent
```

Now, updating and animating attributes across the entire set of marks can be
accomplished with a few (chainable) function calls on the render group. For
instance, to add 100 to all marks' *x*-coordinates and randomize their 
*y*-coordinates:

```javascript
renderGroup
  .update('x', (mark) => mark.attr('x') + 100)
  .update('y', (mark) => Math.random() * 500);
```

We can animate an attribute using identical notation but replacing `update` with
`animateTo`. Note that if the attribute has a value *function* that you want to
use as the new value or final animation value, you can simply call `update` 
without a second argument or use the `animate` function, respectively:

```javascript
renderGroup.update('color'); // instantaneously updates color
renderGroup.animate('color', { duration: 1000 }); // animates color to its new computed value over 1 second
```

We can also find a subset of marks in the render group using `filter`, and the
result will transparently behave like a render group containing the new subset:

```javascript
renderGroup.filter((mark) => mark.id % 2 == 0).animate('color');
```

You can dynamically add and remove marks from a render group using the `addMark`
and `removeMark` methods. However, using these methods directly typically only
works well when there is no risk of overwriting marks with the same ID. For use
cases in which the same mark might need to be reused (e.g. animating connection
lines between points when hovering), it's best to use a `StageManager` (see
[Staging Marks]({{ site.baseurl }}/pages/04-staging)).

## Controlling Attribute Computation

If you're working with large sets of marks or would like to use a computationally
expensive function to compute attribute values, Counterpoint allows you the
flexibility to decide how and when attribute computation should be performed. 
Understanding when your value function will be run depends both on the options
listed below and the behavior of the ticker instance you are using (see 
[Configuring Ticker Behavior]({{ site.baseurl }}/pages/07-optimizing-performance#configuring-ticker-behavior)).

By default, all attributes with value functions are recomputed whenever their 
`get()` or `advance()` methods are called. This likely means that when the canvas
needs to be drawn every frame, the value function will be called *twice* per frame.

> **TIP: Ticker Behavior**
> Counterpoint's tickers don't actually call your drawing function every frame!
> Ticker `onChange` callbacks are only run when the `advance()` method of the 
> objects they manage (e.g. the render group) returns `true`. So if the render 
> group has no active animations or queued updates, the canvas won't need to be
> redrawn.
> 
{: .block-tip }

Nevertheless, it can be helpful to set the following options to reduce the number
of calls to potentially expensive functions:

* Set the attributes' [`recompute`](#Attribute-recompute) option to 
  `AttributeRecompute.WHEN_UPDATED`. This ensures that the value function will
  only be called once when you start an animation or update on the render group.
* Set the attributes' [`cacheTransform`](#Attribute-cacheTransform) option to
  `true` if your transform function is usually constant. Then, if the transform
  does change, you can call `updateTransform` on the render group, mark, or
  attribute.

## API Reference

### Attribute

<h4 id="Attribute-constructor"><code>constructor(value | valueFn | options)</code></h4>

Constructs an `Attribute` using either a single value, value function, or a 
dictionary of options. If using an options dictionary, the available options are
listed below: 

| Option | Description |
|:-------|:-----------:|
| `value` | The value of the attribute, if it is not updated using a dynamic function. |
| `valueFn` | A function that takes the attribute's compute argument and returns the attribute's value. This overrides a static `value` property value. |
| `computeArg` | An argument to be passed to the attribute's `valueFn` and `transform` functions. If `undefined`, the attribute itself is passed as the argument. (This only applies to attributes *not* being used inside `Mark` instances. Marks pass themselves as their attributes' compute arguments.) |
| `transform` | A function that transforms the value of the attribute before being returned. It should take the raw attribute value and (optionally) the attribute's compute argument, and return a transformed value. |
| <span id="Attribute-recompute"></span>`recompute` | Defines the behavior of the attribute's computation when specified using a value function. The default value of `AttributeRecompute.DEFAULT` causes the value function to be called every time `get()`, `compute()`, or `animate()` is called. If set to `AttributeRecompute.ALWAYS`, the value function is called every time the `advance()` method is called (i.e. every tick). If set to `AttributeRecompute.WHEN_UPDATED`, it will only be called when `compute()` or `animate()` is called. See <a href="#controlling-attribute-computation">Controlling Attribute Computation</a> for more details. |
| <span id="Attribute-cacheTransform"></span>`cacheTransform` | If `true`, specifies that the transformed value should be cached and reused when the raw value does not change (suitable when the transform function is fixed). If `false`, specifies that the transform should be rerun every time the value is requested - suitable when the transform function's behavior may change from frame to frame. When the value is cached, the transform can be updated by calling `updateTransform()` on the attribute. |

### Mark

### MarkRenderGroup

