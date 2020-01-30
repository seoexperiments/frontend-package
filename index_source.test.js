import axios from 'axios'

import SEOExperiment, {
  AWS_LAMBDA_LOG_COHORT_PATH,
  AWS_LAMBDA_GET_COHORT_AND_LOG_URL_PATH,
  TWO_WEEKS,
  isExperimentActive,
} from './index_source.js'


const ONE_DAY_MS = 86400000

axios.get = jest.fn(() => 
  new Promise(
    (resolve, reject) => {
      const MOCK_NETWORK_TIME_MS = 10
      setTimeout(() => resolve({status:200, data: {cohort: 'status_quo'}}), MOCK_NETWORK_TIME_MS)
    }
  )
)

const mockCohortAllocations = [
  {
    name: 'status_quo', 
    allocation_percent: 50,
    is_status_quo: true,
  },
  {
    name: 'treatment', 
    allocation_percent: 50,
    is_status_quo: false,
  },
]

test('get cohort', async () => {
  const experiment = new SEOExperiment({
    experimentIdentifier: 29,
  })

  for (const [pageURL, referrer] of [
    ['shit.com/fuk', 'google.com'],
    ['shit.com/shit', 'google.com'],
  ]) {
    const cohort = await experiment.getCohort({
      referrer,
      pageURL,
    })
    expect(cohort).toBe('status_quo')
    expect(axios.get).toHaveBeenLastCalledWith(
      `https://${AWS_LAMBDA_GET_COHORT_AND_LOG_URL_PATH}?url=${pageURL}&referrer=${referrer}&experimentId=${experiment.experimentId}`
    )
  }
})

const todayStr = new Date().toISOString().slice(0,-14)
test('experiment is inactive', () => {
  expect(
     isExperimentActive({startDateStr: todayStr})
  ).toBe(false)
})

test('experiment is active', () => {
  const twoWeeksPlusOneDayMs = Date.now() + TWO_WEEKS + ONE_DAY_MS
  jest
    .spyOn(global.Date, 'now')
    .mockImplementationOnce(() => twoWeeksPlusOneDayMs)
  expect(
     isExperimentActive({startDateStr: todayStr})
  ).toBe(true)
})

test('experiment is past active', () => {
  const fourWeeksPlusOneDayMs = Date.now() + TWO_WEEKS * 2 + ONE_DAY_MS
  jest
    .spyOn(global.Date, 'now')
    .mockImplementationOnce(() => fourWeeksPlusOneDayMs)
    .mockImplementationOnce(() => fourWeeksPlusOneDayMs)
  expect(
     isExperimentActive({startDateStr: todayStr})
  ).toBe(false)
})

test('get cohort sync', () => {
  const experiment = new SEOExperiment({
    experimentIdentifier: 29,
    cohortAllocations: mockCohortAllocations,
    experimentName: 'performance_experiment',
    urlFilter: null,
    startDate: todayStr,
  })

  for (const [pageURL, referrer, expectedCohort] of [
    ['shit.com/fuk', 'google.com', 'status_quo'],
    ['shit.com/shit', 'google.com', 'treatment'],
  ]) {

    const twoWeeksPlusOneDayMs = Date.now() + TWO_WEEKS + ONE_DAY_MS
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() => twoWeeksPlusOneDayMs)

    const cohort = experiment.getCohortSync({
      referrer,
      pageURL,
    })
    expect(cohort).toBe(expectedCohort)
    expect(axios.get).toHaveBeenLastCalledWith(
      `https://${AWS_LAMBDA_LOG_COHORT_PATH}?url=${pageURL}&referrer=${referrer}&experimentId=${experiment.experimentId}&cohortName=${cohort}&isActive=true`
    )
  }
})

test('get cohort sync, before active', () => {
  const experiment = new SEOExperiment({
    experimentIdentifier: 29,
    cohortAllocations: mockCohortAllocations,
    experimentName: 'performance_experiment',
    urlFilter: null,
    startDate: todayStr,
  })

  for (const [pageURL, referrer, expectedCohort] of [
    ['shit.com/fuk', 'google.com', 'status_quo'],
    ['shit.com/shit', 'google.com', 'treatment'],
  ]) {

    const twoWeeksMinusOneDayMs = Date.now() + TWO_WEEKS - ONE_DAY_MS
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() => twoWeeksMinusOneDayMs)

    const outputCohort = experiment.getCohortSync({
      referrer,
      pageURL,
    })

    expect(outputCohort).toBe(null)

    // during baseline, the cohort returned is always null, but the log is the bucketed cohort
    expect(axios.get).toHaveBeenLastCalledWith(
      `https://${AWS_LAMBDA_LOG_COHORT_PATH}?url=${pageURL}&referrer=${referrer}&experimentId=${experiment.experimentId}&cohortName=${expectedCohort}&isActive=false`
    )
  }
})
