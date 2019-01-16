<template>
    <input type="tel" :value="content" @input="$emit('input', $event.target.value)" class="form-control">
</template>

<script>
    export default {
        props: {
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