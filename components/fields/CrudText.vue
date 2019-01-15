<template>
    <div class="form-group">
        <label v-text="fieldName"></label>
        <input type="text" :value="content" @input="$emit('input', $event.target.value)" class="form-control">
    </div>
</template>

<script>
    export default {
        props: {
            fieldName: {
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