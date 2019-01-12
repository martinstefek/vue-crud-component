<template>
    <div class="form-group">
        <label v-text="itemName"></label>
        <div v-text="itemValue"></div>
    </div>
</template>

<script>
    export default {
        props: {
            itemKey: {
                required: true,
            },

            itemValue: {
                required: true
            },

            itemName: {
                required: true
            }
        },

        data() {
            return {

            }
        }
    }
</script>