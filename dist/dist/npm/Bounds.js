'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseBoundCurves = exports.calculatePaddingBoxPath = exports.calculateBorderBoxPath = exports.parsePathForBorder = exports.parseDocumentSize = exports.calculateContentBox = exports.calculatePaddingBox = exports.parseBounds = exports.Bounds = void 0;

var _Vector = _interopRequireDefault(require("./drawing/Vector"));

var _BezierCurve = _interopRequireDefault(require("./drawing/BezierCurve"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TOP = 0;
var RIGHT = 1;
var BOTTOM = 2;
var LEFT = 3;
var H = 0;
var V = 1;

var Bounds =
/*#__PURE__*/
function () {
  function Bounds(x, y, w, h) {
    _classCallCheck(this, Bounds);

    this.left = x;
    this.top = y;
    this.width = w;
    this.height = h;
  }

  _createClass(Bounds, null, [{
    key: "fromClientRect",
    value: function fromClientRect(clientRect, scrollX, scrollY) {
      return new Bounds(clientRect.left + scrollX, clientRect.top + scrollY, clientRect.width, clientRect.height);
    }
  }]);

  return Bounds;
}();

exports.Bounds = Bounds;

var parseBounds = function parseBounds(node, scrollX, scrollY) {
  return Bounds.fromClientRect(node.getBoundingClientRect(), scrollX, scrollY);
};

exports.parseBounds = parseBounds;

var calculatePaddingBox = function calculatePaddingBox(bounds, borders) {
  return new Bounds(bounds.left + borders[LEFT].borderWidth, bounds.top + borders[TOP].borderWidth, bounds.width - (borders[RIGHT].borderWidth + borders[LEFT].borderWidth), bounds.height - (borders[TOP].borderWidth + borders[BOTTOM].borderWidth));
};

exports.calculatePaddingBox = calculatePaddingBox;

var calculateContentBox = function calculateContentBox(bounds, padding, borders) {
  // TODO support percentage paddings
  var paddingTop = padding[TOP].value;
  var paddingRight = padding[RIGHT].value;
  var paddingBottom = padding[BOTTOM].value;
  var paddingLeft = padding[LEFT].value;
  return new Bounds(bounds.left + paddingLeft + borders[LEFT].borderWidth, bounds.top + paddingTop + borders[TOP].borderWidth, bounds.width - (borders[RIGHT].borderWidth + borders[LEFT].borderWidth + paddingLeft + paddingRight), bounds.height - (borders[TOP].borderWidth + borders[BOTTOM].borderWidth + paddingTop + paddingBottom));
};

exports.calculateContentBox = calculateContentBox;

var parseDocumentSize = function parseDocumentSize(document) {
  var body = document.body;
  var documentElement = document.documentElement;

  if (!body || !documentElement) {
    throw new Error(process.env.NODE_ENV !== "production" ? "Unable to get document size" : '');
  }

  var width = Math.max(Math.max(body.scrollWidth, documentElement.scrollWidth), Math.max(body.offsetWidth, documentElement.offsetWidth), Math.max(body.clientWidth, documentElement.clientWidth));
  var height = Math.max(Math.max(body.scrollHeight, documentElement.scrollHeight), Math.max(body.offsetHeight, documentElement.offsetHeight), Math.max(body.clientHeight, documentElement.clientHeight));
  return new Bounds(0, 0, width, height);
};

exports.parseDocumentSize = parseDocumentSize;

var parsePathForBorder = function parsePathForBorder(curves, borderSide) {
  switch (borderSide) {
    case TOP:
      return createPathFromCurves(curves.topLeftOuter, curves.topLeftInner, curves.topRightOuter, curves.topRightInner);

    case RIGHT:
      return createPathFromCurves(curves.topRightOuter, curves.topRightInner, curves.bottomRightOuter, curves.bottomRightInner);

    case BOTTOM:
      return createPathFromCurves(curves.bottomRightOuter, curves.bottomRightInner, curves.bottomLeftOuter, curves.bottomLeftInner);

    case LEFT:
    default:
      return createPathFromCurves(curves.bottomLeftOuter, curves.bottomLeftInner, curves.topLeftOuter, curves.topLeftInner);
  }
};

exports.parsePathForBorder = parsePathForBorder;

var createPathFromCurves = function createPathFromCurves(outer1, inner1, outer2, inner2) {
  var path = [];

  if (outer1 instanceof _BezierCurve.default) {
    path.push(outer1.subdivide(0.5, false));
  } else {
    path.push(outer1);
  }

  if (outer2 instanceof _BezierCurve.default) {
    path.push(outer2.subdivide(0.5, true));
  } else {
    path.push(outer2);
  }

  if (inner2 instanceof _BezierCurve.default) {
    path.push(inner2.subdivide(0.5, true).reverse());
  } else {
    path.push(inner2);
  }

  if (inner1 instanceof _BezierCurve.default) {
    path.push(inner1.subdivide(0.5, false).reverse());
  } else {
    path.push(inner1);
  }

  return path;
};

var calculateBorderBoxPath = function calculateBorderBoxPath(curves) {
  return [curves.topLeftOuter, curves.topRightOuter, curves.bottomRightOuter, curves.bottomLeftOuter];
};

exports.calculateBorderBoxPath = calculateBorderBoxPath;

var calculatePaddingBoxPath = function calculatePaddingBoxPath(curves) {
  return [curves.topLeftInner, curves.topRightInner, curves.bottomRightInner, curves.bottomLeftInner];
};

exports.calculatePaddingBoxPath = calculatePaddingBoxPath;

var parseBoundCurves = function parseBoundCurves(bounds, borders, borderRadius) {
  var tlh = borderRadius[CORNER.TOP_LEFT][H].getAbsoluteValue(bounds.width);
  var tlv = borderRadius[CORNER.TOP_LEFT][V].getAbsoluteValue(bounds.height);
  var trh = borderRadius[CORNER.TOP_RIGHT][H].getAbsoluteValue(bounds.width);
  var trv = borderRadius[CORNER.TOP_RIGHT][V].getAbsoluteValue(bounds.height);
  var brh = borderRadius[CORNER.BOTTOM_RIGHT][H].getAbsoluteValue(bounds.width);
  var brv = borderRadius[CORNER.BOTTOM_RIGHT][V].getAbsoluteValue(bounds.height);
  var blh = borderRadius[CORNER.BOTTOM_LEFT][H].getAbsoluteValue(bounds.width);
  var blv = borderRadius[CORNER.BOTTOM_LEFT][V].getAbsoluteValue(bounds.height);
  var factors = [];
  factors.push((tlh + trh) / bounds.width);
  factors.push((blh + brh) / bounds.width);
  factors.push((tlv + blv) / bounds.height);
  factors.push((trv + brv) / bounds.height);
  var maxFactor = Math.max.apply(Math, factors);

  if (maxFactor > 1) {
    tlh /= maxFactor;
    tlv /= maxFactor;
    trh /= maxFactor;
    trv /= maxFactor;
    brh /= maxFactor;
    brv /= maxFactor;
    blh /= maxFactor;
    blv /= maxFactor;
  }

  var topWidth = bounds.width - trh;
  var rightHeight = bounds.height - brv;
  var bottomWidth = bounds.width - brh;
  var leftHeight = bounds.height - blv;
  return {
    topLeftOuter: tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left, bounds.top, tlh, tlv, CORNER.TOP_LEFT) : new _Vector.default(bounds.left, bounds.top),
    topLeftInner: tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borders[LEFT].borderWidth, bounds.top + borders[TOP].borderWidth, Math.max(0, tlh - borders[LEFT].borderWidth), Math.max(0, tlv - borders[TOP].borderWidth), CORNER.TOP_LEFT) : new _Vector.default(bounds.left + borders[LEFT].borderWidth, bounds.top + borders[TOP].borderWidth),
    topRightOuter: trh > 0 || trv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top, trh, trv, CORNER.TOP_RIGHT) : new _Vector.default(bounds.left + bounds.width, bounds.top),
    topRightInner: trh > 0 || trv > 0 ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width + borders[LEFT].borderWidth), bounds.top + borders[TOP].borderWidth, topWidth > bounds.width + borders[LEFT].borderWidth ? 0 : trh - borders[LEFT].borderWidth, trv - borders[TOP].borderWidth, CORNER.TOP_RIGHT) : new _Vector.default(bounds.left + bounds.width - borders[RIGHT].borderWidth, bounds.top + borders[TOP].borderWidth),
    bottomRightOuter: brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh, brv, CORNER.BOTTOM_RIGHT) : new _Vector.default(bounds.left + bounds.width, bounds.top + bounds.height),
    bottomRightInner: brh > 0 || brv > 0 ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - borders[LEFT].borderWidth), bounds.top + Math.min(rightHeight, bounds.height + borders[TOP].borderWidth), Math.max(0, brh - borders[RIGHT].borderWidth), brv - borders[BOTTOM].borderWidth, CORNER.BOTTOM_RIGHT) : new _Vector.default(bounds.left + bounds.width - borders[RIGHT].borderWidth, bounds.top + bounds.height - borders[BOTTOM].borderWidth),
    bottomLeftOuter: blh > 0 || blv > 0 ? getCurvePoints(bounds.left, bounds.top + leftHeight, blh, blv, CORNER.BOTTOM_LEFT) : new _Vector.default(bounds.left, bounds.top + bounds.height),
    bottomLeftInner: blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borders[LEFT].borderWidth, bounds.top + leftHeight, Math.max(0, blh - borders[LEFT].borderWidth), blv - borders[BOTTOM].borderWidth, CORNER.BOTTOM_LEFT) : new _Vector.default(bounds.left + borders[LEFT].borderWidth, bounds.top + bounds.height - borders[BOTTOM].borderWidth)
  };
};

exports.parseBoundCurves = parseBoundCurves;
var CORNER = {
  TOP_LEFT: 0,
  TOP_RIGHT: 1,
  BOTTOM_RIGHT: 2,
  BOTTOM_LEFT: 3
};

var getCurvePoints = function getCurvePoints(x, y, r1, r2, position) {
  var kappa = 4 * ((Math.sqrt(2) - 1) / 3);
  var ox = r1 * kappa; // control point offset horizontal

  var oy = r2 * kappa; // control point offset vertical

  var xm = x + r1; // x-middle

  var ym = y + r2; // y-middle

  switch (position) {
    case CORNER.TOP_LEFT:
      return new _BezierCurve.default(new _Vector.default(x, ym), new _Vector.default(x, ym - oy), new _Vector.default(xm - ox, y), new _Vector.default(xm, y));

    case CORNER.TOP_RIGHT:
      return new _BezierCurve.default(new _Vector.default(x, y), new _Vector.default(x + ox, y), new _Vector.default(xm, ym - oy), new _Vector.default(xm, ym));

    case CORNER.BOTTOM_RIGHT:
      return new _BezierCurve.default(new _Vector.default(xm, y), new _Vector.default(xm, y + oy), new _Vector.default(x + ox, ym), new _Vector.default(x, ym));

    case CORNER.BOTTOM_LEFT:
    default:
      return new _BezierCurve.default(new _Vector.default(xm, ym), new _Vector.default(xm - ox, ym), new _Vector.default(x, y + oy), new _Vector.default(x, y));
  }
};