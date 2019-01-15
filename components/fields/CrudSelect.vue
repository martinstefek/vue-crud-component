<template>
    <div class="form-group">
        <label v-text="fieldName"></label>
        <select :value="content" @input="$emit('input', $event.target.value)" class="form-control">
            <option value=""></option>
            <option v-for="(optionName, optionKey) in options" :value="optionKey" v-text="optionName"></option>
        </select>
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

            value: {}
        },

        data() {
            return {
                content: this.value
            }
        },

        watch: {
            value(newValue) {
                this.content = newValue
            }
        }
    }
</script>