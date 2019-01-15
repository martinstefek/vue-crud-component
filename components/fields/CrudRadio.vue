<template>
    <div class="form-group">
        <label v-text="fieldName"></label>
        <div v-text="itemValue"></div>
    </div>
</template>

<script>
    export default {
        props: {
            itemValue: {
                required: true
            },

            fieldName: {
                required: true
            }
        },

        data() {
            return {

            }
        }
    }
</script>