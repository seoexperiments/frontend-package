# @seoexperiments/frontend-package

[![N|Solid](https://i.imgur.com/X77GEfb.png)](https://seoexperiments.io)

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://seoexperiments.io)

### Use case
The frontend-package allows for easy access of your seoexperiment.io experiment cohort using JavaScript!

The package will:
  1. Make a call to seoexperiments servers 
  2. Get the cohort that the current page being loaded is in 
  3. Return that cohort to you


### Installation

@seoexperiments/frontend-package is an npm package and can be installed in many different ways. The easiest though is through npm 

```sh
$ npm install @seoexperiments/frontend-package --save
```

### Usage
Pull the package into the area of your codebase that has the logic you want to test. 
The following example is a noindex experiment. The SEO Experiment will change the output of the function shouldPageBeNoindexed, as we want to noindex pages based upon the experiment cohort.
```js
import SEOExperiment from '@seoexperiments/frontend-package'

export const shouldPageBeNoindexed = async () => {
    const noindexExperiment = new SEOExperiment({
        experimentIdentifier: 42
    })
    const cohort = await noindexExperiment.getCohort({
        referrer: document.referrer,
        pageURL: window.location.href
    })
    if (cohort === 'enabled') {
        return true
    }
    return false
}
```

### Development

Want to contribute? Great!

If you find a bug, please open an issue on github and feel free to make a pull request.
https://github.com/seoexperiments/frontend-package

Setup:
  1. Clone repo from https://github.com/seoexperiments/frontend-package
  2. npm install
  3. Make changes to index_source.js
  4. 'npm run build' to run babel and output new build to index.js

Deploy:
  1. git tag with new version
  2. bump version in package.json
  3. 'npm publish --access public'
License
----

MIT
