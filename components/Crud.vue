<template>
    <div class="vue-crud-component">
        <div class="vcc-preview">
            <h2 class="vcc-main-title" v-text="entityPlural"></h2>

            <div class="vcc-box-preheader">
                <div class="vcc-search">
                    <input type="text" v-model="search" class="form-control" placeholder="Search...">
                </div>

                <button type="button" class="btn-primary vcc-add-entity" @click="create">Create {{ entitySingular }}</button>
            </div>

            <div class="vcc-box">
                <div class="vcc-box-header">
                    <div class="vcc-filters">
                        <div v-for="(filterValues, key) in filterData" class="vcc-filter-item">
                            <span v-text="fieldsConfig[key].title || key"></span>
                            <div v-for="value in filterValues" class="vcc-filter-value">
                                <label>
                                    <input type="checkbox" v-model="selectedFilters[key]" :value="value">

                                    {{ value }}
                                </label>
                            </div>
                        </div>

                        <button @click="resetAllFilters" type="button" class="vcc-filters-reset">Reset all filters
                        </button>
                    </div>
                </div>

                <slot name="preview" :preview-fields="fieldsPreview" :records="recordsFiltered">
                    <table class="vcc-record-list">
                        <thead>
                        <tr>
                            <th v-for="(field, key) in fieldsPreview" v-text="field.title"
                                @click="sort(key, field)"></th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(field, index) in recordsFiltered">
                            <td v-for="(value, key, index) in fieldsPreview" v-text="field[key]"></td>
                            <td><span @click="edit(field, index)">Edit</span></td>
                        </tr>
                        </tbody>
                    </table>
                </slot>
            </div>
        </div>

        <!-- Edit -->
        <div v-if="selectedRecord">
            <crud-form></crud-form>
        </div>
    </div>
</template>

<script>
// TODO: Clean the code, remove unnecessary Lodash functions
// TODO: Switch between Form and preview + back button from form
// TODO: Remove delete button from Form view when create entity is triggered
// TODO: Think about more customisable preview and form views
// TODO: Add styles (some css library)
import config from '~/config/Crud.js'
import CrudForm from '~/components/CrudForm'

const lodash = {
    // get: require('lodash.get'),
    pickBy: require('lodash.pickby'),
    // filter: require('lodash.filter'),
    // keyBy: require('lodash.keyby'),
}

export default {
    components: { CrudForm },

    props: {
        data: {
            type: [Object, Array],
            required: true
        },

        fields: {
            type: Object,
            required: true
        },

        httpCreate: {
            type: String,
            default: () => (location.pathname + '/create').replace('//', '/'),
        },

        httpUpdate: {
            type: String,
            default: () => (location.pathname + '/{id}').replace('//', '/')
        },

        httpDelete: {
            type: String,
            default: () => (location.pathname + '/{id}').replace('//', '/')
        },

        allowSearch: {
            type: Boolean,
            default: true,
        },

        allowFilter: {
            type: Boolean,
            default: true,
        },

        allowCreate: {
            type: Boolean,
            default: true,
        },

        allowUpdate: {
            type: Boolean,
            default: true,
        },

        allowDelete: {
            type: Boolean,
            default: true,
        },

        entitySingular: {
            default: 'Record'
        },

        entityPlural: {
            default: 'Records'
        },

        uniqueIdentifier: {
            default: 'id'
        }
    },

    data() {
        return {
            /**
             * This property is used to filter the records
             */
            records: this.data,

            /**
             * This property is used as model for search input
             * It is used to filter the records
             */
            search: '',

            /**
             * This property is used to "Keep alive selectedFilters computed propert"
             * otherwise the computed property is not reactive
             * @see selectedFilters
             */
            selectedFiltersData: {},

            selectedRecord: null,
            selectedRecordIndex: null,

            selectedSorting: null,
            sortDirection: 'ASC'
        }
    },

    computed: {
        /**
         * Creates a full config of all specified fields based on their type
         * @returns {Object}
         */
        fieldsConfig() {
            let newObject = {}

            for (const [key, value] of Object.entries(this.fields)) {
                if (!config.types[value.type]) {
                    return console.error(value.type + ' is not valid type of field. In property fields')
                }

                newObject[key] = { ...config.types[value.type], ...this.fields[key] }
            }

            return newObject
        },

        /**
         * Returns Array of field keys available in preview mode
         * it is used in default preview only
         * @returns {Array}
         */
        fieldsPreview() {
            return lodash.pickBy(this.fieldsConfig, (item) => item.location.indexOf('preview') > -1)
        },

        /**
         * Returns Array of field keys available in form mode
         * @returns {Array}
         */
        fieldsForm() {
            return lodash.pickBy(this.fieldsConfig, (item) => item.location.indexOf('form') > -1)
        },

        /**
         * Returns Array of searchable field keys
         * Searchable field keys are defined in this.config.searchableTypes
         * @returns {Array}
         */
        fieldsSearchable() {
            return Object.keys(lodash.pickBy(this.fieldsConfig, (item) => item.searchable))
        },

        /**
         * Returns Array of filterable fields
         * @returns {Array}
         */
        fieldsFilterable() {
            return Object.keys(lodash.pickBy(this.fields, (item) => item.filterable))
        },

        /**
         * Returns filtered records
         * @returns {Object, Array}
         */
        recordsFiltered() {
            let output = this.deepCopy(this.records)

            // Search
            if (this.search.length > 0) {
                output = output.filter(item => {
                    let itemIncluded = false

                    for (const [key, value] of Object.entries(item)) {
                        if (this.fieldsSearchable.includes(key) && value.toString().toLowerCase().includes(this.search.toLowerCase())) {
                            itemIncluded = true
                            // If item was already found stop the for loop
                            break
                        }
                    }

                    return itemIncluded
                })
            }

            // Filters
            if (Object.values(this.selectedFilters).some(item => item.length > 0)) {
                output = output.filter(item => {
                    let itemIncluded = false

                    for (const [key, value] of Object.entries(this.selectedFilters)) {
                        if (value.includes(item[key])) {
                            itemIncluded = true
                            break
                        }
                    }

                    return itemIncluded
                })
            }

            // Sorting
            if (this.selectedSorting) {
                let sortNumber = ['ID', 'NUMBER'].includes(this.fieldsConfig[this.selectedSorting].type)

                if (sortNumber) {
                    output = output.sort((a, b) => {
                        if (this.sortDirection === 'ASC') {
                            return a[this.selectedSorting] - b[this.selectedSorting]
                        } else {
                            return b[this.selectedSorting] - a[this.selectedSorting]
                        }
                    })
                } else {
                    output = output.sort((a, b) => {
                        if (this.sortDirection === 'ASC') {
                            return a[this.selectedSorting].localeCompare(b[this.selectedSorting])
                        } else {
                            return b[this.selectedSorting].localeCompare(a[this.selectedSorting])
                        }
                    })
                }
            }

            return output
        },

        /**
         * It is used in reactive property selectedFilters
         * It is also used to generate html of filters
         * @see selectedFilters
         * @returns {Object} of all possible values of filterable fields
         */
        filterData() {
            let output = {}

            this.fieldsFilterable.forEach(item => {
                let uniqueFilterValues = [...new Set(this.records.map(record => record[item]))]

                if (uniqueFilterValues.length > 1) {
                    output[item] = uniqueFilterValues
                }
            })

            return output
        },

        /**
         * This is reactive property for filters
         * @returns {Object} of selected type values
         */
        selectedFilters: {
            // I had to use selectedFiltersData property in order to make this computed property reactive
            // So, do not remove it from function because it is essential
            get() {
                let newObject = {}
                Object.keys(this.filterData).forEach(item => newObject[item] = [])
                this.selectedFiltersData = newObject
                return newObject
            },

            set(newValue) {
                this.selectedFiltersData = newValue
            }
        }
    },

    methods: {
        /**
         * Creates deep copy of some data
         * @param val {any}
         * @returns {any}
         */
        deepCopy(val) {
            return JSON.parse(JSON.stringify(val))
        },

        /**
         * Resets all of the filters and therefore all of the fields will be visible
         */
        resetAllFilters() {
            for (const [key, value] of Object.entries(this.selectedFilters)) {
                this.selectedFilters[key] = []
            }
        },

        /**
         * Selects record so it can be edited
         */
        edit(record, index = null) {
            let output = {}
            Object.keys(this.fieldsConfig).forEach(key => output[key] = this.fieldsConfig[key].default)
            this.selectedRecord = {...output, ...this.deepCopy(record)}
            this.selectedRecordIndex = index
        },

        editReset() {
            this.selectedRecord = null
            this.selectedRecordIndex = null
        },

        create() {
            let output = {}
            Object.keys(this.fieldsConfig).forEach(key => {
                if (this.fieldsConfig[key].canBeCreated) {
                    output[key] = this.fieldsConfig[key].default
                }
            })
            this.selectedRecord = output
            this.selectedRecordIndex = 'CREATE'
        },

        /**
         * If the selected field is sortable, then set the selectedSorting property
         * New field has always ASC but additional click on the same field changes it to DESC
         * or ASC but only if previous value was DESC
         */
        sort(key, field, oldKey = this.selectedSorting) {
            if (field.sortable)  {
                this.selectedSorting = key

                if (key === oldKey) {
                    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC'
                }  else {
                    this.sortDirection = 'ASC'
                }
            }
        },

        sortReset() {
            this.selectedSorting = null
        }
    },

    created() {

    },

    watch: {

    }
}
</script>

<style lang="scss">
.vue-crud-component {
    font-family: sans-serif;

    .form-control {
        background: #fff;
        border: 1px solid #e3e3de;
        box-shadow: 1px 1px 1px rgba(110, 110, 110, 0.1);
        padding: 10px 15px;
        font-size: 16px;
        border-radius: 4px;
    }

    select.form-control {
        height: 40px;
    }

    .fake-form-control {
        padding: 12px 15px 0px;
        font-size: 16px;
    }

    .checkbox-radio-wrap {
        padding: 12px 0;
        font-size: 16px;
    }

    .btn-primary {
        padding: 10px 15px;
        background: #05282e;
        color: #ffffff;
        font-size: 16px;
    }

    .vcc-search {
        margin-bottom: 15px;
        float: left;
        width: 100%;
        max-width: 240px;

        .form-control {
            display: block;
            width: 100%;
        }
    }

    .vcc-add-entity {
        float: right;
    }

    .vcc-box {
        background: #ffffff;
        padding: 15px;
        clear: both;
    }

    .vcc-box-header {
        margin-bottom: 15px;
    }

    .vcc-record-list {
        width: 100%;
        text-align: left;
        color: #313135;
        border-collapse: collapse;

        thead {
            tr {
                background-color: #e7edef;
            }

            th {
                padding: 10px 4px;
            }
        }

        tbody {
            td {
                padding: 10px 4px;
            }

            tr {
                border-bottom: 1px solid rgba(0,0,0,0.1);
            }
        }
    }
}
</style>