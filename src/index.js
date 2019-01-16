import CrudComponent from './components/Crud'
import VueSweetalert2 from 'vue-sweetalert2'
import Notifications from 'vue-notification'

exports.install = function(Vue, options = {}) {
    Vue.use(VueSweetalert2)
    Vue.use(Notifications)
    Vue.component(options.name || 'crud-component', CrudComponent)
}
