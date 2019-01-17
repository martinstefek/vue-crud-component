<template>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16px"
	 height="16px" viewBox="0 0 2.6 4.01" xml:space="preserve" style="fill: rgb(87, 96, 105);">
<path :style="{ opacity: getOpacity('ASC')} " d="M1.11,0.08L0.08,1.11c-0.11,0.11-0.11,0.28,0,0.39c0.11,0.11,0.28,0.11,0.39,0L1.3,0.67L2.14,1.5
	c0.11,0.11,0.28,0.11,0.39,0C2.58,1.45,2.6,1.38,2.6,1.31c0-0.07-0.03-0.14-0.08-0.19L1.49,0.08C1.39-0.03,1.22-0.03,1.11,0.08z"/>
<path :style="{ opacity: getOpacity('DESC')} " d="M1.49,3.93L2.52,2.9c0.11-0.11,0.11-0.28,0-0.39c-0.11-0.11-0.28-0.11-0.39,0L1.3,3.35L0.47,2.51
	c-0.11-0.11-0.28-0.11-0.39,0C0.02,2.56,0,2.63,0,2.7S0.03,2.85,0.08,2.9l1.03,1.03C1.21,4.04,1.39,4.04,1.49,3.93z"/>
</svg>
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

        methods: {
            getOpacity(value) {
                return this.content === value ? '1' : '0.5'
            }
        },

        watch: {
            value(newValue) {
                this.content = newValue
            }
        }
    }
</script>