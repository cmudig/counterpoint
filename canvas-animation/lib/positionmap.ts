import { Mark } from './mark';
import { MarkRenderGroup } from './rendergroup';

type MarkCollectionType =
  | MarkRenderGroup<any>
  | Mark<any>
  | Mark<any>[]
  | (() => Mark<any>)
  | (() => Mark<any>[]);

/**
 * A class that manages a hash table of positioned marks. After adding a
 * collection of marks from either render group(s) or other mark sets, you can
 * query the interaction map for the marks within a radius of a given point.
 * In order for the interaction map to produce correct results, you must call
 * the `invalidate` function when the mark set changes, such as by adding it as
 * an `onChange` listener to a `Ticker` instance.
 */
export class PositionMap {
  private markCollections: MarkCollectionType[] = [];
  private _coordinateAttributes: string[];
  private _positionMap: Map<number, Mark<any>[]> | null = null;
  private _binSizes: number[] | null = null;
  private _extents: [number, number][] | null = null;
  private _numBins: number | null = null;
  private _numMarks: number | null = null;
  private _transformCoordinates: boolean;

  private _avgMarksPerBin: number = 2;

  constructor(
    coordinateAttrs: string[] = ['x', 'y'],
    transformCoordinates: boolean = true
  ) {
    this._coordinateAttributes = coordinateAttrs;
    this._transformCoordinates = transformCoordinates;
  }

  /**
   * Adds a mark collection to the position map so that the coordinates of the
   * marks it contains will be tracked, and its marks can be returned by
   * `{@link marksNear}`.
   *
   * @param markCollection A collection of marks, such as a render group, a
   *  single mark, an array of marks, or a function returning a mark or array of
   *  marks.
   * @returns this `PositionMap` instance
   */
  add(markCollection: MarkCollectionType): PositionMap {
    this.markCollections.push(markCollection);
    return this;
  }

  /**
   * Removes a mark collection from the position map.
   *
   * @param markCollection The collection to remove (must be identical by ===
   *  to the mark collection that was originally added)
   * @returns This `PositionMap` instance
   */
  remove(markCollection: MarkCollectionType): PositionMap {
    let idx = this.markCollections.indexOf(markCollection);
    if (idx < 0)
      console.error(
        'Tried to remove mark collection which does not exist:',
        markCollection
      );
    this.markCollections.splice(idx, 1);
    return this;
  }

  /**
   * Notifies the position map that positions have changed and the mark positions
   * need to be recalculated. This does not recalculate the positions immediately.
   *
   * @returns this `PositionMap` instance
   */
  invalidate(): PositionMap {
    this._positionMap = null;
    this._binSizes = null;
    this._extents = null;
    this._numBins = null;
    this._numMarks = null;
    return this;
  }

  /**
   * Retrieves the mark positions and produces the internal representation to
   * calculate distances. This method should most likely not be called by user
   * code, as it will automatically be called when `marksNear` is called.
   *
   * @returns this `PositionMap` instance
   */
  compute(): PositionMap {
    // First traverse the marks and get the extents
    console.log('computing interaction map');
    this._extents = new Array(this._coordinateAttributes.length).fill([
      1e12, -1e12,
    ]);
    this._numMarks = 0;
    this._forEachMark((mark) => {
      this._coordinateAttributes.forEach((c, i) => {
        let coord = mark.attr(c, this._transformCoordinates);
        if (coord < this._extents[i][0]) this._extents[i][0] = coord;
        if (coord > this._extents[i][1]) this._extents[i][1] = coord;
      });
      this._numMarks += 1;
    });

    if (this._numMarks == 0) return this;

    // Calculate bin sizes based on _avgMarksPerBin
    this._numBins = Math.round(this._numMarks / this._avgMarksPerBin);
    this._binSizes = this._extents.map((e) =>
      Math.ceil((e[1] - e[0]) / this._numBins)
    );

    // Place marks into bins
    this._positionMap = new Map();
    this._forEachMark((mark) => {
      let markCoord = this._coordinateAttributes.map((c) =>
        mark.attr(c, this._transformCoordinates)
      );
      let binID = this._getPositionID(markCoord);
      if (this._positionMap.has(binID)) this._positionMap.get(binID).push(mark);
      else this._positionMap.set(binID, [mark]);
    });

    return this;
  }

  _forEachMark(cb: (mark: Mark<any>) => void) {
    this.markCollections.forEach((collection) => {
      if (collection instanceof MarkRenderGroup) {
        collection.forEach(cb);
      } else if (collection instanceof Mark) {
        cb(collection);
      } else if (Array.isArray(collection)) {
        collection.forEach(cb);
      } else if (typeof collection === 'function') {
        let marks = collection();
        if (marks instanceof Mark) cb(marks);
        else marks.forEach(cb);
      }
    });
  }

  _getPositionID(coords: number[]): number {
    if (this._numBins === null || !this._extents || !this._binSizes)
      console.error('Cannot hash position without computing first');
    if (coords.length != this._coordinateAttributes.length)
      console.error(
        `Need exactly ${this._coordinateAttributes.length} coordinates, got ${coords.length}`
      );
    return coords.reduce(
      (prev, c, i) =>
        prev * this._numBins! +
        Math.floor((c - this._extents![i][0]) / this._binSizes![i]),
      0
    );
  }

  /**
   * Retrieves all marks that are within the given distance of the given set of
   * coordinates.
   *
   * @param location The coordinates of a point to search by.
   * @param distance The maximum Euclidean distance allowed for points to be
   *  included in the results.
   * @param exact If `false`, return a list of candidates that is guaranteed to
   *  include all points within `distance` of `location`, but may include some
   *  false positives.
   *
   * @returns a list of marks whose coordinates are within `distance` of `location`,
   *  as well as potentially some false positives if `exact` is set to `false`.
   *  If `exact` is `true`, the returned array is sorted by Euclidean distance.
   */
  marksNear(
    location: number[],
    distance: number,
    exact: boolean = true
  ): Mark<any>[] {
    if (!this._positionMap) this.compute();
    if (this._numMarks == 0) return [];

    let candidates = this._recursiveBinWalk(location, distance);
    if (!exact) return candidates;
    let withDistances = candidates.map((mark) => {
      let markCoord = this._coordinateAttributes.map((c) =>
        mark.attr(c, this._transformCoordinates)
      );
      return [
        mark,
        Math.sqrt(
          markCoord.reduce(
            (prev, curr, i) =>
              prev + (curr - location[i]) * (curr - location[i]),
            0
          )
        ),
      ] as [Mark<any>, number];
    });
    return withDistances
      .filter(([_, dist]) => dist <= distance)
      .map(([mark, _]) => mark);
  }

  _recursiveBinWalk(
    location: number[],
    distance: number,
    coordSubset: number[] = []
  ): Mark<any>[] {
    let coordIdx = coordSubset.length;
    if (coordIdx == location.length) {
      return this._positionMap.get(this._getPositionID(coordSubset)) ?? [];
    }
    let numBinsEachDirection = Math.ceil(distance / this._binSizes[coordIdx]);
    let binsToWalk = new Array(numBinsEachDirection * 2 + 1)
      .fill(0)
      .map(
        (_, i) =>
          (i - numBinsEachDirection) * this._binSizes[coordIdx] +
          location[coordIdx]
      );
    let result: Mark<any>[] = [];
    binsToWalk.forEach((binLocation) => {
      result = [
        ...result,
        ...this._recursiveBinWalk(location, numBinsEachDirection, [
          ...coordSubset,
          binLocation,
        ]),
      ];
    });
    return result;
  }
}
