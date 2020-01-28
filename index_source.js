import axios from 'axios'
import sha256 from 'js-sha256'
import url from 'url'


export const AWS_LAMBDA_GET_COHORT_AND_LOG_URL_PATH = 'luoqll1mnc.execute-api.us-west-2.amazonaws.com/production/get-cohort-and-log'
export const AWS_LAMBDA_LOG_COHORT_PATH = 'luoqll1mnc.execute-api.us-west-2.amazonaws.com/production/log-cohort'
const SEO_EXPERIMENTS_SERVER_ERROR = 'seoexperiments.io lambda function unresponsive'

export default class SEOExperiment {
  constructor({
    experimentIdentifier,
    cohortAllocations,
    experimentName,
    urlFilter,
  }) {
    this.experimentId = experimentIdentifier
    this.cohortAllocations = cohortAllocations
    this.experimentName = experimentName
    this.urlFilter = urlFilter
  }

  getCohort = async ({
    referrer,
    pageURL,
  }) => {
    try {
      const response = await axios.get(
	`https://${AWS_LAMBDA_GET_COHORT_AND_LOG_URL_PATH}?url=${pageURL}&referrer=${referrer}&experimentId=${this.experimentId}`
      )
      if (response.status === 200) {
	return response.data.cohort
      } else {
	console.log(SEO_EXPERIMENTS_SERVER_ERROR)
	return null
      }
    } catch (err) {
      // If something broke, do not show treatment
      return null
    }
  }

  getCohortSync = ({
    referrer,
    pageURL,
  }) => {
    if (pageIsFilteredOut(pageURL, this.urlFilter)) return null

    const identifier = getIdentifierFromUrl(pageURL)
    const cohort = getBucketForExperiment(this.cohortAllocations, pageURL, this.experimentName)

    // non blocking
    try {
      axios.get(
	`https://${AWS_LAMBDA_LOG_COHORT_PATH}?url=${pageURL}&referrer=${referrer}&experimentId=${this.experimentId}&cohortName=${cohort.name}`
      )
    } catch {}

    return cohort.name
  }
}

const sha256TopValue = Math.pow(2, 256)
const getBucketForExperiment = (cohorts, url_identifier, experimentName) => { 
  // Get random and deterministic number in inclusive range 0 - 99
  const allocation = Math.floor(parseInt(sha256(experimentName + url_identifier), 16) / sha256TopValue * 100)
  let lowerBound = 0 
  for (const cohort of cohorts) {
    if (allocation <= lowerBound + cohort.allocation_percent - 1) {
      return cohort
    }
    lowerBound += cohort.allocation_percent
  }
}

const pageIsFilteredOut = ({url, urlFilter}) => {
  /* find out if page EXCLUDED from the experiment population
   * returns true if the page should not be shown treatment
   * :param urlFilter: str, regex that if the URL matches it will be included (whitelist)
   * :return: bool
  */
  if (!urlFilter) {
    // if no filter is supplied let the page be in the experiment
    return false // not filtered out
  }
  // if filter is provided, then the URL has to match the urlFilter, otherwise it should be filtered out
  const regex = new RegExp(urlFilter)
  const urlMatchesFilter = Boolean(url.match(regex))
  return !urlMatchesFilter
}

const getIdentifierFromUrl = urlString => {
  // :param urlString: str, url of the request
  // :returns: str, identifier to hash. Strip off url params so it is just:
  // hostname + path
  // 'www.radish.dog/poop/bark?hungry=0' => www.radish.dog/poop/bark
  if (!urlString) return ''
  const url_parts = url.parse(urlString)
  if (!url_parts) return ''
  return `${url_parts.hostname}${url_parts.pathname}`
}
