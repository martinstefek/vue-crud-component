
## Introduction
Vue Crud Component is a Vue.js component which do all the annoying repetitive administration views for you. This component uses Bootstrap classes. So, if you wish you can add bootstrap css or style it by yourself. 

## Installation
`yarn add vue-crud-component`
or
`npm install --save vue-crud-component`
	
    //JS
    import CrudComponent from 'vue-crud-component'
    Vue.use(CrudComponent)
	
	// HTML
	<template>
	<crud-component></crud-component>
	</template>

You can set your own name of the component by passing name property within object in a second argument of the `Vue.use()` method.
`Vue.use(CrudComponent, {name: 'custom-component-name'})`

The default component name is `crud-component`. 

Since this component is using bootstrap classes I recommend you to include bootstrap css. [Here is a manual](https://getbootstrap.com/docs/4.2/getting-started/introduction/).

## Setup

### Parameters
| Parameter | type | required | default | description |
|-----------|------|----------|---------|-------------|
| data | `Array` | `true` | `null` | It expects Array of Objects which are used to show data in a table. |
| fields | `Object` | `true` | `null` | In this Object you can specify type of the specific fields. eg. birthdate can be set to DateTime. **You can find more detailed documentation of this parameter at Fields parameter documentation.** |
| http-create | `String` | `false` | `currentPage/create` | Post request URL for create action. **{id} will be replaced with unique-identifier parameter** |
| http-update | `String` | `false` | `currentPage/{id}` | Put request URL for update action. **{id} will be replaced with unique-identifier parameter** |
| http-delete | `String` | `false` | `currentPage/{id}` | Delete request URL for delete action. **{id} will be replaced with unique-identifier parameter** |
| allow-search | `Boolean` | `false` | `true` | If set to true search input is visible. |
| allow-filter | `Boolean` | `false` | `true` | If set to true filter button is visible. |
| allow-create | `Boolean` | `false` | `true` | If set to true create button is visible. |
| allow-update | `Boolean` | `false` | `true` | If set to true update button is visible and record is editable. |
| allow-delete | `Boolean` | `false` | `true` | If set to true delete button is visible. |
| entity-singular | `String` | `false` | `Record` | It expects Array of Objects which are used to show data in a table. |
| entity-plural | `String` | `false` | `Records` | It expects Array of Objects which are used to show data in a table. |
| unique-identifier | `String` | `true` | `id` | It expects Array of Objects which are used to show data in a table. It is name of the property in object of data parameter. |

## Fields parameter documentation
Field is a parameter of the component that is expected to be an `Object`. In fields parameter are specified types and additional configuration of values inside every single record of the **data parameter**.

Every field key in the fields parameter has to be equal to some key in data parameter. If the field key isn't found in data, it's value is considered as null and can be updated or created in form.

### Fields can contain following options

| Key  | type | Required | Default | Extra info | 
-------|------|------|------|-----|
| type | String | true | null | Available values: `ID, Email, Text, Number, Select, Checkbox, Radio, DateTime, Custom`
| title | String | false | key of the field
| location | Array | false | `['preview', 'form']`
| rules | Object | false | Since validation is made by [vee-validate](https://baianat.github.io/vee-validate/guide/rules.html#after) you can use their's validation options. Bear in mind that options has to be in Object format. eg. {required: true, min: 3}
| component | `String`, `VueComponent` | true | By default every type has it's on component except `Custom` | This component is used while editing / creating record. It has to emit `input` event because it has set v-model attribute.
| sortable | Boolean | false | false | If set to true the column in table will be sortable.
| searchable | Boolean | false | false | If set to true input search will look up for string in this column.
| filterable | Boolean | false | false | If set to true the column values will appear in the filter button.
| canBeCreated | Boolean | false | true | If set to false this field won't appear in form while creating of the record.
| componentProps | Object | false | empty Object | you can pass any required props down to the component (or custom component) in Object. eg. {options: {name: 'Default Name'}}

Example:

    <crud-component :data="[{
	    "id": 88,  
	    "first_name": "Wilhelm",  
    	"last_name": "McCahey",  
    	"email": "wmccahey2f@microsoft.com",  
    	"credit_card": "maestro"
    }, ...]"
    :fields="{
	    id: {
		    type: 'ID',
		    title: 'ID',
		    sortable: true
	    },
	    first_name: {
		    type: 'Text',
		    title: 'First Name',
		    sortable: true
	    },
	    last_name: {
		    type: 'Text',
		    title: 'Last Name',
		    sortable: true
	    },
	    credit_card: {
		    type: 'Select',
		    title: 'Credit Card Type',
		    filterable: true,
		    componentProps: {
			    options: {
				    maestro: 'Maestro',
				    master_card: 'Master Card',
				    visa: 'Visa'
			    }
		    }
	    },
	    email: {
		    type: 'Email',
		    title: 'Email'
	    }
    }"
  
  
## Customization
At the moment the only customizable thing is preview of the records. I will provide more information soon... 


### Vue Crud Component uses following packages:
 - [vee-validate](https://github.com/baianat/vee-validate) for validation of the fields
 - [Vue.js notifications](https://github.com/euvl/vue-notification) for showing the success / error notifications
 - [axios](https://github.com/axios/axios) for sending the create/update/delete requests of the entity
 - [SweetAlert2](https://github.com/avil13/vue-sweetalert2) for showing the prompt before removing of the entity.