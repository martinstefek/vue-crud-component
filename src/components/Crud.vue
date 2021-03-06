<template>
    <div>
        <notifications group="main" />

        <div v-if="!selectedRecord">
            <div class="clearfix">
                <h2 v-text="entityPlural" class="mt-2 float-left"></h2>

                <button class="btn btn-primary mt-2 float-right" @click="create" type="button" v-if="allowCreate">
                    Create {{ entitySingular }}
                </button>
            </div>

            <div class="card">
                <div class="card-body">
                    <div class="row pb-2 mb-2 clearfix">
                        <div class="col-sm-6 col-md-4" v-if="allowSearch">
                            <input type="text" v-model="search" class="form-control" placeholder="Search...">
                        </div>

                        <div class="col" v-if="allowFilter">
                            <div class="btn-group float-right" v-click-outside="() => filtersOpened = false">
                                <button type="button" class="btn btn-link dropdown-toggle"
                                        @click="filtersOpened = !filtersOpened">
                                    Filters
                                </button>
                                <div class="dropdown-menu dropdown-menu-right"
                                     :class="{show: filtersOpened}">
                                    <template v-for="(filterValues, key) in filterData">
                                        <div class="dropdown-item">
                                            <strong v-text="fieldsConfig[key].title || key"></strong>
                                        </div>

                                        <label v-for="value in filterValues" class="dropdown-item">
                                            <input type="checkbox" v-model="selectedFilters[key]" :value="value">

                                            {{ value }}
                                        </label>

                                        <div class="dropdown-divider"></div>
                                    </template>

                                    <button @click="resetAllFilters" class="btn btn-link pl-4 pr-4" type="button">
                                        Reset all filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <slot name="preview" :preview-fields="fieldsPreview" :records="recordsFiltered">
                        <table class="table">
                            <thead>
                            <tr class="bg-light">
                                <th v-for="(field, key) in fieldsPreview">
                                    <div @click="sort(key, field)" class="row m-0 align-items-center flex-nowrap" :style="{'cursor': field.sortable ? 'pointer' : false}">
                                        <span class="mr-1">
                                            {{ field.title }}
                                        </span>
                                        <icon-sort v-if="field.sortable" :value="key === selectedSorting ? sortDirection : null"></icon-sort>
                                    </div>
                                </th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="(field, index) in recordsFiltered">
                                <td v-for="(value, key, index) in fieldsPreview" v-text="field[key]"></td>
                                <td class="text-right"><button @click="edit(field, index)" class="btn btn-link p-0" type="button">Edit</button></td>
                            </tr>
                            </tbody>
                        </table>
                    </slot>
                </div>
            </div>
        </div>

        <!-- Edit -->
        <div v-if="selectedRecord">
            <crud-form></crud-form>
        </div>
    </div>
</template>

<script>
// TODO: Think about more customisable preview and form views
// TODO: Add loading to the delete, create and update buttons
// TODO: Try to add deeper fields config eg. type.name or type['name']
// TODO: Use location ['preview', 'update', 'create'] instead of ['preview', 'form']
import config from '../config/Crud.js'
import { lodash } from '../config/helpers'
import CrudForm from './CrudForm'
import IconSort from './icons/Sort'
import axios from 'axios'
import ClickOutside from 'vue-click-outside'

export default {
    directives: { ClickOutside },
    components: { CrudForm, IconSort },

    props: {
        data: {
            type: [Object, Array]
        },

        fields: {
            type: Object,
            required: true
        },

        httpGet: {
            type: String
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

        httpHeaders: {
            type: Object,
            default: {}
        },

        httpDataMap: {
            type: Object,
            default: () => {}
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
        },

        extraValidationRules: {
            type: Object,
            default: () => {}
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
            sortDirection: 'ASC',
            filtersOpened: false,
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
            if (!this.records) return

            let output = this.records

            // Search
            if (this.search.length > 0) {
                output = output.filter(item => {
                    let itemIncluded = false

                    for (const [key, value] of Object.entries(item)) {
                        if (value && this.fieldsSearchable.includes(key) && JSON.stringify(value).toString().toLowerCase().includes(this.search.toLowerCase())) {
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
                // Need to create deep copy of the data because otherwise Array.sort() modifies original data
                output = this.deepCopy(output)

                let sortNumber = ['ID', 'Number'].includes(this.fieldsConfig[this.selectedSorting].type)

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
            if (!this.records) return

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

            this.filtersOpened = false
        },

        /**
         * Selects record so it can be edited
         */
        edit(record, index = null) {
            let output = {}
            Object.keys(this.fieldsConfig).forEach(key => output[key] = this.fieldsConfig[key].default)
            this.selectedRecord = {...output, ...record}
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
        },

        updateRecord(data) {
            this.records[this.selectedRecordIndex] = data
        }
    },

    created() {
        if (!this.data && !this.httpGet) {
            console.error('You have to provide either static data in data prop or url for ajax request in httpGet prop ')
        }

        if (this.httpGet) {
            axios.get(this.httpGet, {
                headers: this.httpHeaders
            }).then(({data}) => this.records = lodash.get(data, this.httpDataMap.get, data))
        }
    },
}
</script>
