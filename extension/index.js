'use strict';
const request = require('request');

module.exports = function (nodecg) {
	nodecg.Replicant('settings', { defaultValue: {name: "Coffee", currentAmount: 0, goalAmount: 50, trigger: "Alert1", alertMessage: "  Goal has been reached!", progressCol: "#46e65a", textCol: "#000000", backgroundCol: "#dddddd", customCSS: ""}});
	nodecg.Replicant('goalReached', {defaultValue: {goalReached: false}});

	const router = nodecg.Router();
	const settings = nodecg.Replicant('settings');
	const goalReached = nodecg.Replicant('goalReached');

	function activateAlert(alertname, message) {
		var myJSONObject = {"name": alertname, "message": message};
		request({
				url: 'http://localhost:9090/simple-alerts/alert',
				method: "POST",
				json: true,
				body: myJSONObject
		}, function (error, response, body){
				console.log("Sent Alert to simple-alerts");
		});
	}

	router.post('/goal', (req, res) => {
			const amount = req.body.amount;
			res.send("Amount will be added to progress bar.");
			settings.value.currentAmount = parseFloat(settings.value.currentAmount) + parseFloat(amount);
	});

		nodecg.mount('/simple-goals', router); // The route '/my-bundle/customroute` is now available

		settings.on('change', v => {
			nodecg.log.info("settings changed");
			if (parseFloat(v.currentAmount) >= parseFloat(v.goalAmount) && goalReached.value.goalReached == false) {
				activateAlert(v.trigger, v.alertMessage);
				goalReached.value.goalReached = true;
			}
			else {
				goalReached.value.goalReached = false;
			}
		});
};
