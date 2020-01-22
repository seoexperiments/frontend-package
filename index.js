"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _axios = _interopRequireDefault(require("axios"));

var AWS_LAMBDA_URL_PATH = 'luoqll1mnc.execute-api.us-west-2.amazonaws.com/production/get-cohort-and-log';

var SEOExperiment = function SEOExperiment(_ref) {
  var _this = this;

  var experimentIdentifier = _ref.experimentIdentifier;
  (0, _classCallCheck2["default"])(this, SEOExperiment);
  (0, _defineProperty2["default"])(this, "getCohort",
  /*#__PURE__*/
  function () {
    var _ref3 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee(_ref2) {
      var referrer, pageURL, response;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              referrer = _ref2.referrer, pageURL = _ref2.pageURL;
              _context.prev = 1;
              _context.next = 4;
              return _axios["default"].get("https://".concat(AWS_LAMBDA_URL_PATH, "?url=").concat(pageURL, "&referrer=").concat(referrer, "&experimentId=").concat(_this.experimentId));

            case 4:
              response = _context.sent;

              if (!(response.status === 200)) {
                _context.next = 9;
                break;
              }

              return _context.abrupt("return", response.data.cohort);

            case 9:
              console.log('seoexperiments.io lambda function unresponsive');
              return _context.abrupt("return", null);

            case 11:
              _context.next = 16;
              break;

            case 13:
              _context.prev = 13;
              _context.t0 = _context["catch"](1);
              return _context.abrupt("return", null);

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[1, 13]]);
    }));

    return function (_x) {
      return _ref3.apply(this, arguments);
    };
  }());
  this.experimentId = experimentIdentifier;
};

exports["default"] = SEOExperiment;
