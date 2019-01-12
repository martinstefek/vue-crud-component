<template>
    <div>
        <div v-for="(value, key) in record">
            <component :is="fieldsConfig[key].component" :itemKey="key" :itemValue="value" :itemName="fieldsConfig[key].title || key"></component>
            <!--{{ value }}-->
        </div>
    </div>
</template>

<script>
    const lodash = {
        get: require('lodash.get'),
        pickBy: require('lodash.pickby'),
        filter: require('lodash.filter'),
        keyBy: require('lodash.keyby'),
    }

    export default {
        props: {

        },

        data() {
            return {

            }
        },

        computed: {
            record() {
                return this.$parent.selectedRecord
            },

            fieldsConfig() {
                return this.$parent.fieldsConfig
            }
        },

        methods: {

        }
    }
</script>

<style lagn="scss">

</style>