<template>
    <select :value="content" @input="$emit('input', $event.target.value)" class="form-control">
        <option value=""></option>
        <option v-for="(optionName, optionKey) in options" :value="optionKey" v-text="optionName"></option>
    </select>
</template>

<script>
    export default {
        props: {
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