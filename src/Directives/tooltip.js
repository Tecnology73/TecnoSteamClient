import Vue from 'vue';

Vue.directive('tooltip', {
	inserted(e, binding, vnode) {
		const data = binding.value;
		const $tt  = vnode.context.$root.app.tooltip;

		$(e).hover(function () {
			$tt.setData(data)
			   .show({
				   element: this,
				   offset : data.position,
			   });
		}, function () {
			$tt.hide();
		});
	},
});
