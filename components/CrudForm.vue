<template>
    <div>
        <h2 v-text="heading" class="mt-2"></h2>

        <button @click="backToPreview" class="btn btn-link p-0 mb-3" type="button">
            Back to list of the {{ $parent.entityPlural }}
        </button>

        <div class="card">
            <div class="card-body clearfix">
                <div v-for="(value, key) in record" class="form-group row border-bottom pb-3">
                    <label v-text="fieldsConfig[key].title || key" class="col-sm-3 col-md-2 col-form-label"></label>

                    <div class="col-sm-9 col-md-10">
                        <component :is="fieldsConfig[key].component"
                                   :component-props="fieldsConfig[key].componentProps"
                                   :key="'form_field_' + key + '_' + recordIndex"
                                   v-bind="fieldsConfig[key].componentProps"
                                   v-model="$parent.selectedRecord[key]"
                                   @input="validator.validate(key)"
                        ></component>

                        <span v-if="errors[key]" v-text="errors[key]" class="text-danger"></span>
                    </div>
                </div>

                <button v-if="recordIndex !== 'CREATE'" @click="remove" type="button" class="btn btn-outline-danger">
                    Delete
                </button>

                <button @click="recordIndex === 'CREATE' ? create() : update()" type="button" class="btn btn-primary float-right">
                    {{ recordIndex === 'CREATE' ? 'Create' : 'Update' }}
                </button>
            </div>
        </div>

        <notifications group="main" />
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

            for (const [key, value] of Object.entries(this.record)) {
                this.validator.attach({
                    initialValue: value,
                    name: key,
                    alias: this.fieldsConfig[key].title || key,
                    rules: this.fieldsConfig[key].rules,
                    getter: () => this.record[key]
                })
            }
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
            /**
             * Currently selected record
             */
            record() {
                return this.$parent.selectedRecord
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

                axios.post(this.$parent.httpCreate, this.record)
                    .then((response) => {
                        this.toast('success', 'Great job!', (this.$parent.entitySingular + ' has been successfully created.'))
                        this.$parent.records.push(response.data)
                    })
                    .catch((e) => {
                        return this.toast('error', 'Oops...', 'Something went wrong!')
                        console.error(e)
                    })
            },

            async update() {
                if (!await this.validator.validateAll())
                    return this.toast('error', 'Oops...', 'Some of the fields in form are invalid. Please, correct them.')

                axios.put(this.$parent.httpUpdate.replace('{id}', this.record[this.$parent.uniqueIdentifier]), this.record)
                    .then((response) => {
                        this.toast('success', 'Great job!', (this.$parent.entitySingular + ' has been successfully updated.'))
                        this.$parent.records.push(response.data)
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
                        axios.delete(this.$parent.httpDelete.replace('{id}', this.record[this.$parent.uniqueIdentifier]))
                            .then((response) => {
                                this.toast('success', 'Great job!', (this.$parent.entitySingular + ' has been successfully removed.'))
                                this.$delete(this.$parent.records), this.recordIndex
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
            }
        },
    }
</script>