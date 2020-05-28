# hof-behaviour-loop

HOF behaviour allowing forms to collect multiple, unbounded, data items. E.G. When we need to collect information about
the dependants a person has, or other names someone has been known by.   

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
(multiple views config available since v15.1.0 of the hof library)

### Steps configuration (app/myapp/index.js)

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

The example below demonstrates a simple 2 step loop, representing an item listing page and a standard data entry page.

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
         loop: {
           storeKey: 'dependentDetails',
           subSteps: {
             dependant: { //data entry step
               fields: ['dependentFullName', 'dependentDateOfBirth', 'dependentRelationship'],
               next: 'add-another'
             },
             'add-another': { //item listing page
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
           itemTable: { 
             headerField: 'dependentFullName',
             editFieldsIndividually: false
           },
           summary: { 
             applySpacer: false
           }
         },
        ...
       }
  }
}
```

##### Generated values

* **sectionKey** - this is the top-level route without any '/' characters (dependent-details in the example above).
* **pagePath** - this is a composite key of {sectionKey}-{subStep.name} - e.g. dependent-details-add-another

##### Configuration items
  
* **storeKey** (optional) - defines the key against which completed loop items for this step will be stored.
  defaults to '${sectionKey}-items'.
* **subSteps** - steps forming the loop path. Supports forking between sub-steps.
  * The first step is the initial entry point for the loop, so if it's a data collection page entry to the loop should 
  be guarded by a previous step.
  * The penultimate step is the 'submission' page for the loop - the point at which an item will be stored against 
  'storeKey'.
  * The last step is expected to be an item listing page - showing the user the items they have entered so far, and
  establishing whether the user needs to add further items. Submission from this page is the point at which 
  'loopCondition' is evaluated.
* **loopCondition** - Defines under what circumstances the user is sent back to the first step on submission from the 
item listing page.   
* **itemTable** - Controls presentation of items within the item listing page (or any loop page including 
partials/items-table). See 'Configuring the item listing table'
* **summary** - Controls presentation of items within the summary ('Check your answers') page (or any page implementing
the summary behaviour and including partials/summary-table). See 'Configuring the summary'


##### Configuring the item listing table

The item listing table, presented in any page within the loop that references partials/items-table is designed to give
users an overview of the data that they've entered so far along with the ability to edit and change the data.

By default the item listing table displays data in a format similar to the 'check your answers' / summary page from the 
GovUk design system.

![Default item listing](/examples/Multi-field%20default.png?raw=true)

The following options are available for altering the display of information in this table as part of the 'itemTable' 
element.

```javascript
module.exports = {
  ...
  steps: {
    ...
    '/dependent-details': { 
      behaviours: Loop,
      loop: {
        itemTable: { 
          ...
        }
      },
     ...
    }
  }
}
```

  * **headerField** (optional) - If present the specified field will be used as the heading for each item in the table.
  ![Dependants summary with field as header](/examples/Multi%20field-header%20as%20field.png?raw=true)
  
  * **editFieldsIndividually** (optional, defaults to true unless headerField is specified and there is only one 
  field per item) - controls whether the change link appears for an item or for each field within that item. Setting the 
  flag to false results in:
  ![Dependants summary editing individual fields](/examples/multi-field%20edit%20record%20level.png?raw=true)
  
Combining the two gives us something suitable for editing entries where all fields are entered in one page:

![Item listing with field as header and record level editing](/examples/multi-field%20first%20field%20as%20title%20edit%20record%20level.png?raw=true)

Or for a single field:

![Item listing with single field as header](/examples/single%20field.png?raw=true)


##### Configuring the summary

The summary view is intended to be part of the 'Check your answers' page at the end of a form. It incorporates the 
behaviour of the hof-behaviour-summary-page and enhances it to support display of items created in a loop.

By default the summary display will include a space between each item created in a loop.

![Summary listing with space between entries](/examples/Summary%20with%20spacer.png?raw=true)

The following options are available for altering the display of information in this table as part of the 'summary' 
element.

```javascript
module.exports = {
  ...
  steps: {
    ...
    '/dependent-details': { 
      behaviours: Loop,
      loop: {
        summary: { 
          ...
        }
      },
     ...
    }
  }
}
```

* **applySpacer** (optional, defaults to true) - If set to false the spacer will not be applied
  ![Summary listing with no space between entries](/examples/Summary%20no%20spacer.png?raw=true)
  
### Fields configuration

#### Sections configuration (integrating with hof-behaviour-summary-page sections)

The loop module supports the 'sections' concept from hof-behaviour-summary-page in a limited fashion. Other fields are
still fully configurable via the sections property of your confirm step. 
If you wish for entities from a loop to be included in the summary then the section config should include an entry
for {sectionKey} listing the fields you wish to be included.

#### Field level Configuration (app/myapp/fields/index.js)

It is possible to configure display behaviour for both the item list view and summary view via the field config in 
fields/index.js.

The following options are available:

* **omitFromSummary** (optional, defaults to false) - If set the field will not be displayed in the summary or item list
  views.
  
* **parse** (optional) - if provided, this is expected to be a function which converts the value as entered by the user
  into a value suitable for display.  
  
##### Example field level configurations 
  
```javascript
...
addAnotherDependant: {
  omitFromSummary: true```
}, 
dependentFullName: {
  validate: 'required'
},
dependentDateOfBirth: dateComponent('dependentDateOfBirth', {
  validate: ['required', 'before', after1900Validator],
  parse: d => d && moment(d).format(config.PRETTY_DATE_FORMAT)
}),
... 
```

### Translations

Where multiple translation properties are available they are evaluated in the order they appear in the array, so the
first one to match will be displayed.

#### Loop pages (app/myapp/translations/src/en/pages.json)

Pages displayed as substeps of a loop look up their properties for display based on their pagePath / sectionKey.

* Header: `['pages.{pagePath}.item-{n}-header', 'pages.{pagePath}.header']` (n is 1 indexed)
* Intro: `['pages.pagePath.item-{n}-intro', 'pages.{pagePath}.intro']` (n is 1 indexed)

##### Item listing table

* Text of the 'delete' link in the item summary: `pages.{sectionKey}.delete-text`
* Text to display for each item if headerField is not set: `pages.{sectionKey}.summary-item`. Note that for multiple 
  items the item index 'n' is displayed after this text.
  
##### Summary (Check your answers) table

* Section header: `['pages.confirm.sections.${sectionKey}.header', 'pages.${sectionKey}.header']`

##### Example loop page properties
  
```javascript 
...
"dependent-details": {
  "summary-item": "Dependent",
  "delete-text": "Delete"
},
"dependent-details-dependent": {
  "item-1-header": "Enter details of your dependant",
  "header": "Add details of another dependant",
  "item-1-intro": "You can add more dependants later."
},
"dependent-details-add-another": {
  "header": "Dependants summary"
},
...
```

#### Fields (app/myapp/translations/src/en/fields.json)

##### Item listing table

* Field label `['fields.{field}.summary', 'fields.{field}.label', 'fields.{field}.legend']`

##### Summary (Check your answers) table                                                           
                                                                                                   
* Field label: `['pages.confirm.fields.{field}.label', 'fields.{field}.summary', 'fields.{field}.label',
                 'fields.{field}.legend']`                                              
                                                                                                   
* Change link description (hidden value for screen readers inside the change link): 
  `['pages.confirm.fields.${field}.changeLinkDescription', 'fields.${field}.changeLinkDescription',
    'pages.confirm.fields.${field}.label', 'fields.${field}.summary', 'fields.${field}.label', 'fields.${field}.legend']`
    
##### Example field properties:

```javascript
  "dependentFullName": {
    "label": "Full name",
    "changeLinkDescription": "Dependant full name"
  },
  "dependentDateOfBirth": {
    "legend": "Date of Birth",
    "hint": "For example, 31 3 1980",
    "changeLinkDescription": "Dependant date of birth"
  },
  "dependentRelationship": {
    "label": "Relationship to you",
    "changeLinkDescription": "Dependant relationship to you"
  },
```
