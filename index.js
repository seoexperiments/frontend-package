"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.isExperimentActive = exports.TWO_WEEKS = exports.AWS_LAMBDA_LOG_COHORT_PATH = exports.AWS_LAMBDA_GET_COHORT_AND_LOG_URL_PATH = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _axios = _interopRequireDefault(require("axios"));

var _jsSha = _interopRequireDefault(require("js-sha256"));

var _url = _interopRequireDefault(require("url"));

var AWS_LAMBDA_GET_COHORT_AND_LOG_URL_PATH = 'luoqll1mnc.execute-api.us-west-2.amazonaws.com/production/get-cohort-and-log';
exports.AWS_LAMBDA_GET_COHORT_AND_LOG_URL_PATH = AWS_LAMBDA_GET_COHORT_AND_LOG_URL_PATH;
var AWS_LAMBDA_LOG_COHORT_PATH = 'luoqll1mnc.execute-api.us-west-2.amazonaws.com/production/log-cohort';
exports.AWS_LAMBDA_LOG_COHORT_PATH = AWS_LAMBDA_LOG_COHORT_PATH;
var SEO_EXPERIMENTS_SERVER_ERROR = 'seoexperiments.io lambda function unresponsive';
var TWO_WEEKS = 1209600000;
exports.TWO_WEEKS = TWO_WEEKS;

var isExperimentActive = function isExperimentActive(_ref) {
  var startDateStr = _ref.startDateStr;
  if (startDateStr === undefined) return false;
  var activationDate = new Date(new Date(startDateStr).getTime() + TWO_WEEKS);
  var disableDate = new Date(activationDate.getTime() + TWO_WEEKS); // current time is after activation date and before disable date

  return Date.now() > activationDate.getTime() && Date.now() < disableDate.getTime();
};

exports.isExperimentActive = isExperimentActive;

var SEOExperiment = function SEOExperiment(_ref2) {
  var _this = this;

  var experimentIdentifier = _ref2.experimentIdentifier,
      cohortAllocations = _ref2.cohortAllocations,
      experimentName = _ref2.experimentName,
      urlFilter = _ref2.urlFilter,
      startDate = _ref2.startDate;
  (0, _classCallCheck2["default"])(this, SEOExperiment);
  (0, _defineProperty2["default"])(this, "getCohort",
  /*#__PURE__*/
  function () {
    var _ref4 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee(_ref3) {
      var referrer, pageURL, response;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              referrer = _ref3.referrer, pageURL = _ref3.pageURL;
              _context.prev = 1;
              _context.next = 4;
              return _axios["default"].get("https://".concat(AWS_LAMBDA_GET_COHORT_AND_LOG_URL_PATH, "?url=").concat(pageURL, "&referrer=").concat(referrer, "&experimentId=").concat(_this.experimentId));

            case 4:
              response = _context.sent;

              if (!(response.status === 200)) {
                _context.next = 9;
                break;
              }

              return _context.abrupt("return", response.data.cohort);

            case 9:
              console.log(SEO_EXPERIMENTS_SERVER_ERROR);
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
      return _ref4.apply(this, arguments);
    };
  }());
  (0, _defineProperty2["default"])(this, "getCohortSync", function (_ref5) {
    var referrer = _ref5.referrer,
        pageURL = _ref5.pageURL;
    if (pageIsFilteredOut(pageURL, _this.urlFilter)) return null;
    var identifier = getIdentifierFromUrl(pageURL);
    var cohort = getBucketForExperiment(_this.cohortAllocations, pageURL, _this.experimentName); // non blocking

    try {
      _axios["default"].get("https://".concat(AWS_LAMBDA_LOG_COHORT_PATH, "?url=").concat(pageURL, "&referrer=").concat(referrer, "&experimentId=").concat(_this.experimentId, "&cohortName=").concat(cohort.name));
    } catch (_unused) {}

    if (isExperimentActive({
      startDateStr: _this.startDate
    })) return cohort.name;
    return null;
  });
  this.experimentId = experimentIdentifier;
  this.cohortAllocations = cohortAllocations;
  this.experimentName = experimentName;
  this.urlFilter = urlFilter;
  this.startDate = startDate;
};

exports["default"] = SEOExperiment;
var sha256TopValue = Math.pow(2, 256);

var getBucketForExperiment = function getBucketForExperiment(cohorts, url_identifier, experimentName) {
  // Get random and deterministic number in inclusive range 0 - 99
  var allocation = Math.floor(parseInt((0, _jsSha["default"])(experimentName + url_identifier), 16) / sha256TopValue * 100);
  var lowerBound = 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = cohorts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var cohort = _step.value;

      if (allocation <= lowerBound + cohort.allocation_percent - 1) {
        return cohort;
      }

      lowerBound += cohort.allocation_percent;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

var pageIsFilteredOut = function pageIsFilteredOut(_ref6) {
  var url = _ref6.url,
      urlFilter = _ref6.urlFilter;

  /* find out if page EXCLUDED from the experiment population
   * returns true if the page should not be shown treatment
   * :param urlFilter: str, regex that if the URL matches it will be included (whitelist)
   * :return: bool
  */
  if (!urlFilter) {
    // if no filter is supplied let the page be in the experiment
    return false; // not filtered out
  } // if filter is provided, then the URL has to match the urlFilter, otherwise it should be filtered out


  var regex = new RegExp(urlFilter);
  var urlMatchesFilter = Boolean(url.match(regex));
  return !urlMatchesFilter;
};

var getIdentifierFromUrl = function getIdentifierFromUrl(urlString) {
  // :param urlString: str, url of the request
  // :returns: str, identifier to hash. Strip off url params so it is just:
  // hostname + path
  // 'www.radish.dog/poop/bark?hungry=0' => www.radish.dog/poop/bark
  if (!urlString) return '';

  var url_parts = _url["default"].parse(urlString);

  if (!url_parts) return '';
  return "".concat(url_parts.hostname).concat(url_parts.pathname);
};
