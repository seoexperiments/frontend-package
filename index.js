function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import axios from 'axios';
AWS_LAMBDA_URL_PATH = 'luoqll1mnc.execute-api.us-west-2.amazonaws.com/production/get-cohort-and-log';

class SEOExperiment {
  constructor({
    experimentIdentifier
  }) {
    _defineProperty(this, "getCohort", async ({
      referrer,
      pageURL
    }) => {
      try {
        const response = await axios.get(`https://${AWS_LAMBDA_URL_PATH}?url=${pageURL}&referrer=${referrer}&experimentId=${this.experimentId}`);

        if (response.status === 200) {
          const cohort = response.cohort;
          return cohort;
        } else {
          console.log('seoexperiments.io lambda function unresponsive');
          return null;
        }
      } catch (err) {
        // If something broke, do not show treatment
        return null;
      }
    });

    this.experimentId = experimentIdentifier;
  }

}
