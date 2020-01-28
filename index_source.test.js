import axios from 'axios'

import SEOExperiment, {
  AWS_LAMBDA_LOG_COHORT_PATH,
  AWS_LAMBDA_GET_COHORT_AND_LOG_URL_PATH,
} from './index_source.js'


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

test('get cohort sync', () => {
  const experiment = new SEOExperiment({
    experimentIdentifier: 29,
    cohortAllocations: mockCohortAllocations,
    experimentName: 'performance_experiment',
    urlFilter: null,
  })

  for (const [pageURL, referrer, expectedCohort] of [
    ['shit.com/fuk', 'google.com', 'status_quo'],
    ['shit.com/shit', 'google.com', 'treatment'],
  ]) {
    const cohort = experiment.getCohortSync({
      referrer,
      pageURL,
    })
    expect(cohort).toBe(expectedCohort)
    expect(axios.get).toHaveBeenLastCalledWith(
      `https://${AWS_LAMBDA_LOG_COHORT_PATH}?url=${pageURL}&referrer=${referrer}&experimentId=${experiment.experimentId}&cohortName=${cohort}`
    )
  }
})
