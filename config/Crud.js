const COMMON_TYPES_CONFIG = {
    title: null,
    location: ['preview', 'form'],
    rules: null,
    component: null,
    editable: true,
    sortable: false,
    searchable: false,
    filterable: false,
}

export default {
    types: {
        ID: {
            ...COMMON_TYPES_CONFIG,
            title: 'ID',
            editable: false,
            searchable: true,
            component: require('~/components/fields/CrudID')
        },

        Email: {
            ...COMMON_TYPES_CONFIG,
            title: 'Email',
            searchable: true,
            component: require('~/components/fields/CrudEmail')
        },

        Text: {
            ...COMMON_TYPES_CONFIG,
            searchable: true,
            component: require('~/components/fields/CrudText')
        },

        Number: {
            ...COMMON_TYPES_CONFIG,
            component: require('~/components/fields/CrudNumber')
        },

        Select: {
            ...COMMON_TYPES_CONFIG,
            options: null,
            optionsMap: null,
            component: require('~/components/fields/CrudSelect')
        },

        Status: {
            ...COMMON_TYPES_CONFIG,
            options: null,
            optionsMap: null,
            component: require('~/components/fields/CrudStatus')
        },

        Checkbox: {
            ...COMMON_TYPES_CONFIG,
            options: null,
            optionsMap: null,
            component: require('~/components/fields/CrudCheckbox')
        },

        Radio: {
            ...COMMON_TYPES_CONFIG,
            options: null,
            optionsMap: null,
            component: require('~/components/fields/CrudRadio')
        },

        Datepicker: {
            ...COMMON_TYPES_CONFIG,
            allowTime: true,
            component: require('~/components/fields/CrudDatepicker')
        }
    }
}