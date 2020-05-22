# hof-behaviour-loop

HOF behaviour supporting adding 0..n sections of a given type. E.G. when declaring information about children/dependants. 

## Installation

```javascript
npm install [--save] hof-behaviour-loop;
```

## Usage

### hof app initialisation (top level index.js, )

#### Use the provided hogan partials
```javascript
const app = hof({
  ...
  routes: [
    ...
  ],
  views: require('hof-behaviour-loop').views
  ...
});
```

or

```javascript
const app = hof({
  ...
  routes: [
    ...
  ],
  views: ['path/to/my/common/custom/views', require('hof-behaviour-loop').views]
  ...
});
```

### app/myapp/index.js

#### Set up parameter mapping:
```javascript
module.exports = {
  ...
  params: '/:action?/:id?/:edit?',
  ...
```

#### Importing behaviours

```javscript
const LoopBehaviour = require('hof-behaviour-loop');      
const Loop = LoopBehaviour.Loop;                          
const LoopSummary = LoopBehaviour.SummaryWithLoopItems;   
```

#### Defining loops

The example below demonstrates a simple 2 step loop, representing a summary page and a standard data entry page.

Longer data entry sections can be defined by simply adding more steps.
    
*N.B.* because of the way the wider HOF framework works it is important to keep field names distinct where using 
multiple loops within a project.
    
```javascript
module.exports = {
  ...
  steps: {
    ...
       '/dependent-details': { 
         behaviours: Loop,
         loopData: {
           storeKey: 'dependentDetails',
           sectionKey: 'dependent-details',
           confirmStep: '/confirm',
           firstFieldAsHeader: true,
           editFieldsIndividually: false
         },
         fields: [
           'dependentFullName',
           'dependentDateOfBirth',
           'dependentRelationship',
           'addAnotherDependant'
         ],
         firstStep: 'dependant',
         subSteps: {
           dependant: { //data entry step
             fields: ['dependentFullName', 'dependentDateOfBirth', 'dependentRelationship'],
             next: 'add-another'
           },
           'add-another': { //summary step
             fields: [
               'addAnotherDependant'
             ],
             template: 'dependents-add-another'
           }
         },
         loopCondition: { //when do we go round again
           field: 'addAnotherDependant',
           value: 'yes'
         },
        ...
       }
  }
}
```



#### Submission types

##### Email via GovUK Notify

```javascript
feedbackConfig: {
  notify: {
    apiKey: config.govukNotify.notifyApiKey,
    email: {
      templateId: config.govukNotify.templateFormFeedback, 
      emailAddress: config.govukNotify.feedbackEmail,
      fieldMappings: { 
          'feedbackText': 'feedback',
          'feedbackName' : 'name',
          'feedbackEmail' : ' email'
      },
      includeBaseUrlAs : "process",
      includeSourcePathAs : "path"
    }
  }
}
```

* **apiKey** - the notify api key.
* **templateId** - id of the GovUk notify email template.
* **emailAddress** - address the feedback email should be sent to.
* **fieldMappings** - associative array of input names to the corresponding variable name in the notify email template. Any inputs which are not explicitly mapped here will not be sent to notify.
* **includeBaseUrlAs** (Optional) - if included the application base url will be sent to notify with the given variable name.
* **includeSourcePathAs** (Optional) - if included the originating page path (i.e. the page the user was on before they clicked the feedback link) will be sent to notify with the given variable name.  




