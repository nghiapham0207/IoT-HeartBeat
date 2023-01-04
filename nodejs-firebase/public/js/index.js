$('btn_start_program').click(() => {
    alert('click')
})

// setInterval(() => {
//     $.ajax({
//         url: "/api/get-heart-beat",
//         method: "get",
//     })
//         .done((data) => {
//             console.log(data.data)
//             //$('#heart_beat').val(data.data.heartbeat)
//             let percent = parseInt(data.data.heartbeat)
//             setGaugeValue(gaugeElement, percent / 250);
//         })
//         .fail(err => {
//             console.log(err)
//         })
//     //let percent = Math.floor(Math.random() * 200)

// }, 500)

// const gaugeElement = document.querySelector(".gauge");

// function setGaugeValue(gauge, value) {
//     if (value < 0 || value > 1) {
//         return;
//     }

//     gauge.querySelector(".gauge__fill").style.transform = `rotate(${value / 2
//         }turn)`;
//     gauge.querySelector(".gauge__cover").textContent = `${Math.round(
//         value * 250
//     )}BPM`;
// }

