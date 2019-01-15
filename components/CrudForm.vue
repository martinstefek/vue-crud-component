<template>
    <div>
        <div class="vcc-box vcc-form">
            <div v-for="(value, key) in record">
                <component :is="fieldsConfig[key].component"
                           :field-name="fieldsConfig[key].title || key"
                           :component-props="fieldsConfig[key].componentProps"
                           :key="'form_field_' + key + '_' + recordIndex"
                           v-bind="fieldsConfig[key].componentProps"
                           v-model="$parent.selectedRecord[key]"
                           @input="validator.validate(key)"
                ></component>
                <span v-if="errors[key]" v-text="errors[key]"></span>
            </div>

            <button type="button" class="btn-primary" v-if="recordIndex === 'CREATE'" v-text="'Create'" @click="create"></button>
            <button type="button" class="btn-primary" v-if="recordIndex !== 'CREATE'" v-text="'Update'" @click="update"></button>
        </div>

        <div class="vcc-box">
            <button type="button" class="btn-primary" @click="remove">Delete</button>
        </div>

        <notifications group="main" />
    </div>
</template>

<script>
    import Vue from 'vue'
    import axios from 'axios'
    import { Validator } from 'vee-validate'
    import VueSweetalert2 from 'vue-sweetalert2'
    import Notifications from 'vue-notification'

    Vue.use(VueSweetalert2)
    // https://www.npmjs.com/package/vue-sweetalert2

    Vue.use(Notifications)
    // https://www.npmjs.com/package/vue-notification

    export default {
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
                validator: new Validator()
            }
        },

        computed: {
            record() {
                return this.$parent.selectedRecord
            },

            fieldsConfig() {
                return this.$parent.fieldsConfig
            },

            recordIndex() {
                return this.$parent.selectedRecordIndex
            },

            errors() {
                let output = {}
                this.validator.errors.items.forEach(item => output[item.field] = item.msg)
                return output
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
        },
    }
</script>

<style lang="scss">
.vue-crud-component {
    .vcc-form {
        .form-group {
            display: flex;
            align-items: flex-start;
            padding: 10px 0;
            border-bottom: 1px solid #e3e3de;

            > label {
                flex: 0 0 200px;
                padding: 12px 15px 0;
                color: rgba(0, 0, 0, .6);
            }

            > label + *, .form-control {
                width: 100%;
                max-width: 300px;
            }
        }

        .vcc-input-spacer {
            margin-bottom: 15px;

            &:last-of-type {
                margin-bottom: 0;
            }
        }
    }
}
</style>