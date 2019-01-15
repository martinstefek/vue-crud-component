<template>
    <div class="form-group">
        <label v-text="fieldName"></label>
        <Datetime v-model="content" input-class="form-control" v-bind="componentProps"></Datetime>
    </div>
</template>

<script>
    // Datepicker component Link
    // https://github.com/mariomka/vue-datetime?ref=madewithvuejs.com
    import { Datetime } from 'vue-datetime';
    import 'vue-datetime/dist/vue-datetime.css'

    export default {
        components: { Datetime },

        props: {
            fieldName: {
                required: true
            },

            value: {},

            componentProps: {}
        },

        data() {
            return {
                content: this.value
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