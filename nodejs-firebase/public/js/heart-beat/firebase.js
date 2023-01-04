import { MIN_BEAT, MAX_BEAT, MIN_OXY, MAX_OXY, MIN_BEAT_OK, MAX_BEAT_OK, MIN_OXY_OK, MAX_OXY_OK } from './constants.js';
import { showToastMessage, closeToastMessage } from './toast-message.js';
import { pauseChart } from './chart.js';
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
// 	apiKey: "AIzaSyB9kGz6N1ZSRnMNjbslbAmUVpFTmJjR5Ec",
// 	authDomain: "iot2022-cad90.firebaseapp.com",
// 	databaseURL: "https://iot2022-cad90-default-rtdb.asia-southeast1.firebasedatabase.app",
// 	projectId: "iot2022-cad90",
// 	storageBucket: "iot2022-cad90.appspot.com",
// 	messagingSenderId: "1000746324923",
// 	appId: "1:1000746324923:web:6a3ba42873be0923336a9e",
// 	measurementId: "G-ZMEP6HBQ0R"
// };

const firebaseConfig = {
	apiKey: "AIzaSyCG_mx5O24vSBnVy8YlB3GXVv-bW0nGecI",
	authDomain: "heartbeat-f8957.firebaseapp.com",
	databaseURL: "https://heartbeat-f8957-default-rtdb.firebaseio.com",
	projectId: "heartbeat-f8957",
	storageBucket: "heartbeat-f8957.appspot.com",
	messagingSenderId: "230581473834",
	appId: "1:230581473834:web:423c150ac8c986eab4a953",
	measurementId: "G-7DE46B6GXV"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
// const starCountRef = ref(db, 'heart/realtime');
const starCountRef = ref(db, 'heart/realtime');

pauseChart(true);

//
var btnStartStatus = 0
$('#btn_start_program').on('click', () => {
	document.getElementById('btn_end_program').removeAttribute('disabled');
	if (btnStartStatus == 0) {
		set(ref(db, 'heart/init'), { run: 1 })
		// $('#btn_start_program').prop('innerText', 'Tạm dừng');
		$('#btn_start_program').prop('innerHTML', '<i class="fa fa-pause me-2"></i>Tạm dừng');
		btnStartStatus = 1;
		pauseChart(false);
	} else {
		set(ref(db, 'heart/init'), { run: 0 })
		// $('#btn_start_program').prop('innerText', 'Tiếp tục');
		$('#btn_start_program').prop('innerHTML', '<i class="fa fa-play me-2"></i>Tiếp tục');
		btnStartStatus = 0;
		pauseChart(true);
	}
	// $('#btn_start_program').prop('disabled', true)
})
$('#btn_end_program').on('click', () => {
	btnStartStatus = 0;
	set(ref(db, 'heart/init'), { run: 0 });

	//set(ref(db, 'heart/realtime/heartmax'), { heartbeat: 0 });
	// set(ref(db, 'heart/realtime'), { oxy: 0 });

	location.href = 'http://localhost:3222/confirm-result';
})

window.onunload = function () {
	set(ref(db, 'heart/init'), { run: 0 })
}
//
// function setValueMonitor(beatValue, oxyValue) {
// 	var str = '';
// 	str = `Nhịp tim: ${beatValue} BPM\nSpO2: ${oxyValue} %`;
// 	document.getElementById('chartText').innerText = str;
// 	console.log(document.getElementById('chartText'));
// }

var Beat = {
	value: 0,
	oxy: 0,
	getValue() {
		onValue(starCountRef, async (snapshot) => {
			const beatValue = Number.parseInt(await snapshot.val().heartbeat);
			// console.log('beat', beatValue);
			// const oxyValue = await snapshot.val().oxy;
			// console.log('oxy', oxyValue);
			Beat.value = beatValue;
			console.log('gọi hàm getBeatValue()');
			if (window.isPaused) {
				closeToastMessage('toast2-beat');
			} else {
				if (beatValue == 0) {
					showToastMessage('toast2-beat', 'Không tìm thấy nhịp tim!');
				} else if (beatValue > MAX_BEAT_OK) {
					showToastMessage('toast2-beat', 'Nhịp tim cao hơn mức bình thường!');
				} else if (beatValue < MIN_BEAT_OK) {
					showToastMessage('toast2-beat', 'Nhịp tim thấp hơn mức bình thường!');
				} else {
					closeToastMessage('toast2-beat');
				}
			}
		});
		return Beat.value;
	},
	getOxy() {
		onValue(starCountRef, async (snapshot) => {
			const oxyValue = Number.parseInt(await snapshot.val().oxy);
			Beat.oxy = oxyValue;
			console.log('gọi hàm getOxy()');
			if (window.isPaused) {
				closeToastMessage('toast2-oxy');
			} else {
				if (oxyValue == 0) {
					showToastMessage('toast2-oxy', 'Không tìm thấy oxygen!');
				} else if (oxyValue > MAX_OXY_OK) {
					showToastMessage('toast2-oxy', 'Nồng độ oxy cao hơn mức bình thường!');
				} else if (oxyValue < MIN_OXY_OK) {
					showToastMessage('toast2-oxy', 'Nồng độ oxy thấp hơn mức bình thường!');
				} else if (oxyValue >= 97 && oxyValue <= 99) {

				}
				else {
					closeToastMessage('toast2-oxy');
				}
			}
		});
		return Beat.oxy;
	}
}

//<![CDATA[
function updateGauge(id, min, max, displayValue) {
	if (displayValue < min)
		displayValue = min
	if (displayValue > max)
		displayValue = max
	const newGaugeValue = Math.floor(((displayValue - min) / (max - min)) * 100);
	document.getElementById(id).style.setProperty('--gauge-display-value', displayValue);
	document.getElementById(id).style.setProperty('--gauge-value', newGaugeValue);
	// if (displayValue > 100) {
	// 	document.getElementById('beat-value').style.setProperty('--gauge-color', 'red')
	// 	document.getElementById('oxy-value').style.setProperty('--gauge-color', 'red')
	// } else if (displayValue < 90) {

	// }
	// else {
	// 	document.getElementById('beat-value').style.setProperty('--gauge-color', 'white')
	// 	document.getElementById('oxy-value').style.setProperty('--gauge-color', 'white')
	// }
}
//]]>

onValue(starCountRef, (snapshot) => {
	const beatValue = Number.parseInt(snapshot.val().heartbeat);
	const oxyValue = Number.parseInt(snapshot.val().oxy);
	Beat.value = beatValue;
	Beat.oxy = oxyValue;
	// console.log(beatValue, oxyValue);
	console.log('trong hàm onvalue, updategauge');
	if (window.isPaused) {
		closeToastMessage('toast1-beat');
		// showToastMessage('toast1-beat', 'Đang tạm dừng!')
		updateGauge('beatGauge', MIN_BEAT, MAX_BEAT, 0);
		updateGauge('oxyGauge', MIN_OXY, MAX_OXY, 0);
	} else {
		updateGauge('beatGauge', MIN_BEAT, MAX_BEAT, beatValue);
		updateGauge('oxyGauge', MIN_OXY, MAX_OXY, oxyValue);

		if (beatValue == 0) {
			showToastMessage('toast1-beat', 'Không tìm thấy nhịp tim!');
		} else if (beatValue > MAX_BEAT_OK) {
			showToastMessage('toast1-beat', 'Nhịp tim cao hơn mức bình thường!');
		} else if (beatValue < MIN_BEAT_OK) {
			showToastMessage('toast1-beat', 'Nhịp tim thấp hơn mức bình thường!');
		} else {
			closeToastMessage('toast1-beat');
		}

		if (oxyValue == 0) {
			showToastMessage('toast1-oxy', 'Không tìm thấy nồng độ oxy!');
		} else if (oxyValue > MAX_OXY_OK) {
			showToastMessage('toast1-oxy', 'Nồng độ oxy cao hơn mức bình thường!');
		} else if (oxyValue < MIN_OXY_OK) {
			showToastMessage('toast1-oxy', 'Nồng độ thấp hơn mức bình thường!');
		} else {
			closeToastMessage('toast1-oxy');
		}
	}
});
// setInterval(() => {
// 	updateGauge('demoGauge', MIN_BEAT, MAX_BEAT, Math.floor(Math.random() * (MAX_BEAT - MIN_BEAT)) + MIN_BEAT);
// }, 500);
export { Beat };

function setToolTipGauge(id, tooltip) {
	document.getElementById(id).title = tooltip;
}
setToolTipGauge('ticks', `Nhịp tim có giá trị từ ${MIN_BEAT} - ${MAX_BEAT} bpm`)
setToolTipGauge('ticks-2', `Nồng độ có giá trị từ ${MIN_OXY} - ${MAX_OXY} %`)
