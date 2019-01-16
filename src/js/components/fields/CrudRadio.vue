<template>
    <div v-text="itemValue"></div>
</template>

<script>
    export default {
        props: {
            itemValue: {
                required: true
            },
        },

        data() {
            return {

            }
        }
    }
</script>
