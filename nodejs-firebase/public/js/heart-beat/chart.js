import { Beat } from './firebase.js'
import { MIN_BEAT, MAX_BEAT } from './constants.js';

// setup
const data = {
    labels: ['Beat', 'Oxygen'],
    datasets: [
        {
            label: '# Beat',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            yAxisID: 'Beat',
        },
        {
            label: '# Oxygen',
            data: [],
            borderColor: '#36A2EB',
            backgroundColor: '#9BD0F5',
            borderWidth: 1,
            yAxisID: 'Oxygen',
        },
    ]
}
// console.log('chart.js', btnStartStatus);
function pauseChart(isPaused) {
    config.options.plugins.streaming.pause = isPaused;
    window.isPaused = isPaused;
    // myChart.options.plugins.streaming.pause = isPaused
    // myChart.update({delay: 0});
}

function setValueMonitor(beatValue, oxyValue) {
    var str = '';
    str = `Nhịp tim: ${beatValue} BPM\nSpO2: ${oxyValue} %`;
    document.getElementById('chartText').innerText = str;
    console.log(document.getElementById('chartText'));
}

export { pauseChart }
// config
const config = {
    type: 'line',
    data,
    options: {
        responsive: true,
        plugins: {
            streaming: {
                pause: false
            },
            title: {
                display: true,
                text: 'Heart Rate Monitoring'
            },
        },
        interaction: {
            intersect: false
        },
        scales: {
            x: {
                type: 'realtime',
                realtime: {
                    onRefresh: chart => {
                        if (window.isPaused) {
                            setValueMonitor(0, 0);
                        } else {
                            setValueMonitor(Beat.value, Beat.oxy);
                        }
                        chart.data.datasets.forEach(dataset => {
                            switch (dataset.label) {
                                case '# Beat':
                                    dataset.data.push({
                                        x: Date.now(),
                                        y: Beat.getValue(),
                                        // y: Math.floor(Math.random() * (MAX_BEAT - MIN_BEAT)) + MIN_BEAT,
                                    });
                                    break;
                                case '# Oxygen':
                                    dataset.data.push({
                                        x: Date.now(),
                                        // y: Math.floor(Math.random() * (100 - 0)) + 0,
                                        y: Beat.getOxy(),
                                    });
                                    break;
                                default:
                                    break;
                            }
                        })
                    }
                },
            },
            Beat: {
                type: 'linear',
                min: MIN_BEAT,
                max: MAX_BEAT,
                position: 'left',
                ticks: {
                    stepSize: 20
                },
                // label: "test"
            },
            Oxygen: {
                type: 'linear',
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20
                },
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
            }
        }
    }
}
// render
// document.querySelector('#btn_start_program').onclick = () => { alert('click') }
const ctx = document.getElementById('myChart')
const myChart = new Chart(ctx, config)
console.log('myChart', myChart);
// myChart.height = '300px';
// myChart.width = '300px';