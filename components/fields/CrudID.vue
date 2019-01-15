<template>
    <div class="form-group">
        <label v-text="fieldName"></label>
        <div v-text="value" class="fake-form-control"></div>
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
    }
</script>