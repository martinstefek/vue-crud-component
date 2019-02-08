<template>
    <div>
        <h2 v-text="heading" class="mt-2"></h2>

        <button @click="backToPreview" class="btn btn-link p-0 mb-3" type="button">
            Back to list of the {{ $parent.entityPlural }}
        </button>

        <div class="card">
            <div class="card-body clearfix">
                <div v-for="(value, key) in record" v-if="fieldsConfig[key]" class="form-group row border-bottom pb-3">
                    <label v-text="fieldsConfig[key].title || key" class="col-sm-3 col-md-2 col-form-label"></label>

                    <div class="col-sm-9 col-md-10">
                        <component :is="fieldsConfig[key].component"
                                   :component-props="fieldsConfig[key].componentProps"
                                   :key="'form_field_' + key + '_' + recordIndex"
                                   v-bind="fieldsConfig[key].componentProps"
                                   v-model="$parent.selectedRecord[key]"
                                   @input="updateValidationRules(key); validator.validate(key)"
                        ></component>

                        <span v-if="errors[key]" v-text="errors[key]" class="text-danger"></span>
                    </div>
                </div>

                <button v-if="recordIndex !== 'CREATE'" @click="remove" type="button" class="btn btn-outline-danger">
                    Delete
                </button>

                <button v-if="(recordIndex !== 'CREATE' && $parent.allowUpdate) || (recordIndex === 'CREATE' && $parent.allowCreate)"
                        @click="recordIndex === 'CREATE' ? create() : update()"
                        type="button"
                        class="btn btn-primary float-right">
                    {{ recordIndex === 'CREATE' ? 'Create' : 'Update' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    // import Vue from 'vue'
    import axios from 'axios'
    import { Validator } from 'vee-validate'

    export default {

        /**
         * On created life hook, create Validator instance and attach every field with value, getter, alias...
         */
        created() {
            this.validator = new Validator()

            for (const [key, value] of Object.entries(this.$parent.extraValidationRules)) {
                this.validator.extend(key, value)
            }

            this.getValidationRules((key, value, alias, rules, getter) => {
                this.validator.attach({
                    initialValue: value,
                    name: key,
                    alias: alias,
                    rules: rules,
                    getter: getter
                })
            })
        },

        data() {
            return {
                /**
                 * Reactive VeeValidate Validator instance
                 */
                validator: new Validator()
            }
        },

        computed: {
            conditionalValidationFields() {
                return Object.values(this.fieldsConfig).map(item => item.conditionalRules).filter(item => item !== undefined).map(item => Object.keys(item)).flat(1)
            },

            /**
             * Currently selected record
             */
            record() {
                let object = {}

                for (const [key, value] of Object.entries(this.$parent.selectedRecord)) {
                    if (this.fieldsConfig[key] && this.fieldsConfig[key].restrictedTo) {
                        for (const [restKey, restVal] of Object.entries(this.fieldsConfig[key].restrictedTo)) {
                            if (restVal.includes(this.$parent.selectedRecord[restKey])) {
                                object[key] = value
                            }
                        }

                    } else {
                        object[key] = value
                    }
                }

                return object
            },

            /**
             * FieldsConfig inherited from parent
             */
            fieldsConfig() {
                return this.$parent.fieldsConfig
            },

            /**
             * Index of the selected record
             */
            recordIndex() {
                return this.$parent.selectedRecordIndex
            },

            /**
             * List of all errors. Used for showing error messages
             */
            errors() {
                let output = {}
                this.validator.errors.items.forEach(item => output[item.field] = item.msg)
                return output
            },

            /**
             * Heading of the form view
             */
            heading() {
                if (this.recordIndex === 'CREATE') {
                    return 'Creating ' + this.$parent.entitySingular
                }

                return 'Editing ' + this.$parent.entitySingular + ' ' + this.record[this.$parent.uniqueIdentifier]
            }
        },

        methods: {
            async create() {
                if (!await this.validator.validateAll())
                    return this.toast('error', 'Oops...', 'Some of the fields in form are invalid. Please, correct them.')

                axios.post(this.$parent.httpCreate, this.record, {
                    headers: this.$parent.httpHeaders
                })
                    .then(({data}) => {
                        this.toast('success', 'Great job!', (this.$parent.entitySingular + ' has been successfully created.'))
                        this.$parent.records.push(this.$parent.httpDataMap.create ? data[this.$parent.httpDataMap.create] : data)
                        this.backToPreview()
                    })
                    .catch((e) => {
                        return this.toast('error', 'Oops...', 'Something went wrong!')
                        console.error(e)
                    })
            },

            async update() {
                if (!await this.validator.validateAll())
                    return this.toast('error', 'Oops...', 'Some of the fields in form are invalid. Please, correct them.')

                axios.put(this.$parent.httpUpdate.replace('{id}', this.record[this.$parent.uniqueIdentifier]), this.record, {
                    headers: this.$parent.httpHeaders
                })
                    .then(({data}) => {
                        this.toast('success', 'Great job!', (this.$parent.entitySingular + ' has been successfully updated.'))
                        this.$parent.updateRecord(this.$parent.httpDataMap.update ? data[this.$parent.httpDataMap.update] : data)
                        this.backToPreview()
                    })
                    .catch((e) => {
                        return this.toast('error', 'Oops...', 'Something went wrong!')
                        console.error(e)
                    })
            },

            /**
             * If prompt is accepted, then removes record and show roast
             */
            async remove() {
                return this.$swal({
                    title: 'Are you sure?',
                    text: 'You won\'t be able to revert this action',
                    type: 'warning',
                    showCancelButton: true,
                }).then((result) => {
                    if (result.value) {
                        axios.delete(this.$parent.httpDelete.replace('{id}', this.record[this.$parent.uniqueIdentifier]), {
                            headers: this.$parent.httpHeaders
                        })
                            .then(({data}) => {
                                this.toast('success', 'Great job!', (this.$parent.entitySingular + ' has been successfully removed.'))
                                this.$delete(this.$parent.records, this.recordIndex)
                                this.backToPreview()
                            })
                            .catch((e) => {
                                return this.toast('error', 'Oops...', 'Something went wrong!')
                                console.error(e)
                            })
                    }
                })
            },

            toast(type, title, text) {
                this.$notify({
                    group: 'main',
                    type: type,
                    title: title,
                    text: text,
                    position: 'top right',
                });
            },

            backToPreview() {
                this.$parent.editReset()
            },

            updateValidationRules(field) {
                if (this.conditionalValidationFields.includes(field)) {
                    this.getValidationRules((key, value, alias, rules, getter) => {
                        let findField = this.validator.fields.find({ name: key })
                            if (findField) {
                                findField.update({ rules: rules })

                            } else {
                                this.validator.attach({
                                    initialValue: value,
                                    name: key,
                                    alias: alias,
                                    rules: rules,
                                    getter: getter
                                })
                            }
                    })

                    if (this.recordIndex !== 'CREATE') {
                        this.validator.validateAll()
                    }
                }
            },

            getValidationRules(callback) {
                for (const [key, value] of Object.entries(this.record)) {
                    var extraRules = {}

                    if (this.fieldsConfig[key]) {
                        if (this.fieldsConfig[key].conditionalRules) {
                            for (const [condKey, condVal] of Object.entries(this.fieldsConfig[key].conditionalRules)) {
                                let field = this.fieldsConfig[key].conditionalRules[condKey][this.record[condKey]]
                                if (field) {
                                    extraRules = { ...extraRules, ...condVal[this.record[condKey]] }
                                }
                            }
                        }

                        callback(key, value, this.fieldsConfig[key].title || key, { ...this.fieldsConfig[key].rules, ...extraRules }, () => this.record[key])
                    }
                }
            }
        },
    }
</script>
