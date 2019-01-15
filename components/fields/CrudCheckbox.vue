<template>
    <div class="form-group">
        <label v-text="fieldName"></label>
        <div class="checkbox-radio-wrap">
            <div v-for="(optionName, optionKey) in options" class="vcc-input-spacer">
                <label>
                    <input v-model="content" type="checkbox" :value="optionKey">
                    <span v-text="optionName"></span>
                </label>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            fieldName: {
                required: true
            },

            options: {
                required: true
            },

            value: {
                type: [Array, String]
            }
        },

        data() {
            return {
                content: this.defaultContentValue()
            }
        },

        methods: {
            defaultContentValue() {
                if (this.value === null) {
                    return []
                }
                else if (this.value.constructor === Object) {
                    return {...this.value}
                }
                else if (this.value.constructor === Array) {
                    return [...this.value]
                }
                else {
                    return [this.value]
                }
            }
        },

        watch: {
            value(newValue) {
                this.content = newValue
            },

            content(newValue) {
                this.$emit('input', newValue)
            }
        }
    }
</script>