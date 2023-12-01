import { Advanceable } from './ticker';

export enum ContrastPreference {
  none = 'no-preference',
  more = 'more',
  less = 'less',
}

export enum ColorSchemePreference {
  light = 'light',
  dark = 'dark',
}

/**
 * A class that contains information about the context in which marks are
 * rendered, as well as user-defined properties of the context.
 */
export class RenderContext implements Advanceable {
  private _prefersReducedMotion: boolean;
  private _prefersReducedTransparency: boolean;
  private _contrastPreference: ContrastPreference;
  private _colorSchemePreference: ColorSchemePreference;

  private _hasChanged: boolean = false;

  constructor() {
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._prefersReducedMotion = reducedMotion.matches;
    reducedMotion.addEventListener('change', (e) => this._handleMotion(e));

    let reducedTransparency = window.matchMedia(
      '(prefers-reduced-transparency: reduce)'
    );
    this._prefersReducedTransparency = reducedTransparency.matches;
    reducedTransparency.addEventListener('change', (e) =>
      this._handleTransparency(e)
    );

    let contrastNone = window.matchMedia('(prefers-contrast: none)');
    this._contrastPreference = ContrastPreference.none;
    contrastNone.addEventListener('change', (e) => this._handleContrastNone(e));

    let contrastMore = window.matchMedia('(prefers-contrast: more)');
    if (contrastMore.matches)
      this._contrastPreference = ContrastPreference.more;
    contrastMore.addEventListener('change', (e) => this._handleContrastMore(e));

    let contrastLess = window.matchMedia('(prefers-contrast: less)');
    if (contrastMore.matches)
      this._contrastPreference = ContrastPreference.less;
    contrastLess.addEventListener('change', (e) => this._handleContrastLess(e));

    let colorLight = window.matchMedia('(prefers-color-scheme: light)');
    this._colorSchemePreference = ColorSchemePreference.light;
    colorLight.addEventListener('change', (e) =>
      this._handleColorSchemeLight(e)
    );

    let colorDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (colorDark.matches)
      this._colorSchemePreference = ColorSchemePreference.dark;
    colorDark.addEventListener('change', (e) => this._handleColorSchemeDark(e));
  }

  _handleMotion(e: MediaQueryListEvent) {
    this._prefersReducedMotion = e.matches;
    this._hasChanged = true;
  }

  _handleTransparency(e: MediaQueryListEvent) {
    this._prefersReducedTransparency = e.matches;
    this._hasChanged = true;
  }

  _handleContrastMore(e: MediaQueryListEvent) {
    if (e.matches) this._contrastPreference = ContrastPreference.more;
    this._hasChanged = true;
  }

  _handleContrastLess(e: MediaQueryListEvent) {
    if (e.matches) this._contrastPreference = ContrastPreference.less;
    this._hasChanged = true;
  }

  _handleContrastNone(e: MediaQueryListEvent) {
    if (e.matches) this._contrastPreference = ContrastPreference.none;
    this._hasChanged = true;
  }

  _handleColorSchemeLight(e: MediaQueryListEvent) {
    if (e.matches) this._colorSchemePreference = ColorSchemePreference.light;
    this._hasChanged = true;
  }

  _handleColorSchemeDark(e: MediaQueryListEvent) {
    if (e.matches) this._colorSchemePreference = ColorSchemePreference.dark;
    this._hasChanged = true;
  }

  get prefersReducedMotion() {
    return this._prefersReducedMotion;
  }
  get prefersReducedTransparency() {
    return this._prefersReducedTransparency;
  }
  get contrastPreference() {
    return this._contrastPreference;
  }
  get colorSchemePreference() {
    return this._colorSchemePreference;
  }

  advance(dt: number): boolean {
    if (this._hasChanged) {
      this._hasChanged = false;
      return true;
    }
    return false;
  }
}

let _ctx: RenderContext | undefined;

export function getRenderContext(): RenderContext {
  if (!_ctx) _ctx = new RenderContext();
  return _ctx;
}
