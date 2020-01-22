import axios from 'axios'


const AWS_LAMBDA_URL_PATH = 'luoqll1mnc.execute-api.us-west-2.amazonaws.com/production/get-cohort-and-log'

export default class SEOExperiment {
  constructor({
    experimentIdentifier
  }) {
    this.experimentId = experimentIdentifier
  }

  getCohort = async ({
    referrer,
    pageURL 
  }) => {
    try {
      const response = await axios.get(
	`https://${AWS_LAMBDA_URL_PATH}?url=${pageURL}&referrer=${referrer}&experimentId=${this.experimentId}`
      )
      if (response.status === 200) {
	return response.data.cohort
      } else {
	console.log('seoexperiments.io lambda function unresponsive')
	return null
      }
    } catch (err) {
      // If something broke, do not show treatment
      return null
    }
  }
}
