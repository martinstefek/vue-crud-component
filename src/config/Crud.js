const COMMON_TYPES_CONFIG = {
    title: null,
    location: ['preview', 'form'],
    rules: null,
    component: null,
    editable: true,
    sortable: false,
    searchable: false,
    filterable: false,
    default: null,
    componentProps: {},
    canBeCreated: true,
}

export default {
    types: {
        ID: {
            ...COMMON_TYPES_CONFIG,
            title: 'ID',
            editable: false,
            searchable: true,
            component: require('../components/fields/CrudID'),
            canBeCreated: false,
        },

        Email: {
            ...COMMON_TYPES_CONFIG,
            title: 'Email',
            searchable: true,
            component: require('../components/fields/CrudEmail')
        },

        Text: {
            ...COMMON_TYPES_CONFIG,
            searchable: true,
            component: require('../components/fields/CrudText')
        },

        Number: {
            ...COMMON_TYPES_CONFIG,
            component: require('../components/fields/CrudNumber')
        },

        Select: {
            ...COMMON_TYPES_CONFIG,
            component: require('../components/fields/CrudSelect')
        },

        Status: {
            ...COMMON_TYPES_CONFIG,
            component: require('../components/fields/CrudSelect')
        },

        Checkbox: {
            ...COMMON_TYPES_CONFIG,
            component: require('../components/fields/CrudCheckbox')
        },

        Radio: {
            ...COMMON_TYPES_CONFIG,
            component: require('../components/fields/CrudRadio')
        },

        DateTime: {
            ...COMMON_TYPES_CONFIG,
            component: require('../components/fields/CrudDateTime')
        },

        Custom: {
            ...COMMON_TYPES_CONFIG
        }
    }
}
