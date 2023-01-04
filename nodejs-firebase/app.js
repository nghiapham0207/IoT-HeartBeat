import pkg from 'express'
const express = pkg;
// import { BodyParser } from "body-parser";
// import { cors } from "cors";
// import { firebase } from "firebase";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue, get, set, child } from "firebase/database";
import * as csv from "csv";
import * as fs from "fs";
import * as parser from 'csv-parse'
import * as xl from "xlsx";
import * as ejs from "ejs";
import path, { dirname } from 'path';
import { fileURLToPath } from "url";
import * as nodemailer from "nodemailer";
import bodyParser from "body-parser";


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//     apiKey: "AIzaSyB9kGz6N1ZSRnMNjbslbAmUVpFTmJjR5Ec",
//     authDomain: "iot2022-cad90.firebaseapp.com",
//     databaseURL: "https://iot2022-cad90-default-rtdb.asia-southeast1.firebasedatabase.app",
//     projectId: "iot2022-cad90",
//     storageBucket: "iot2022-cad90.appspot.com",
//     messagingSenderId: "1000746324923",
//     appId: "1:1000746324923:web:6a3ba42873be0923336a9e",
//     measurementId: "G-ZMEP6HBQ0R"
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

let configOptions = {
    host: "smtp.example.com",
    port: 587,
    tls: {
        rejectUnauthorized: true,
        minVersion: "TLSv1.2"
    }
}
let pass = 'agpmmzmqmqqxrcvf'
const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "luffschloss@gmail.com",
        pass: 'agpmmzmqmqqxrcvf'
    }
})

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const starCountRef = ref(db, 'heart/realtime');
// onValue(starCountRef, (snapshot) => {
//     const data = snapshot.val();
//     console.log(data);
//     console.log(new Date(data.time));
// });
// updateStarCount(postElement, data); 
//const analytics = getAnalytics(firebaseApp);


const app = express();
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
// app.engine('ejs', ejs)
// app.use(bodyParser.json())

// app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.urlencoded({ extended: true }))


const middleAuth = (req, res, next) => {
    if (app.locals.username != undefined) next();
    else res.redirect('/login')
}

onValue(ref(db, "heart/realtime"), (snapshot) => {
    let data = snapshot.val();
    let heart = Number.parseFloat(data.heartbeat)
    let heartmin = Number.parseFloat(data.heartmin)
    let heartmax = Number.parseFloat(data.heartmax)
    // let oxy = Number.parseFloat(data.oxy)
    // let oxymin = Number.parseFloat(data.oxymin)
    // let oxymax = Number.parseFloat(data.oxymax)
    let oxy = Number.parseInt(data.oxy)
    let oxymin = Number.parseInt(data.oxymin)
    let oxymax = Number.parseInt(data.oxymax)
    if (heart > 0 && heart > heartmax) set(ref(db, `heart/realtime/heartmax`), heart.toString())
    if (heart > 0 && heart < heartmin) set(ref(db, `heart/realtime/heartmin`), heart.toString())
    if (oxy > 0 && oxy > oxymax) set(ref(db, `heart/realtime/oxymax`), oxy.toString())
    if (oxy > 0 && oxy < oxymin) set(ref(db, `heart/realtime/oxymin`), oxy.toString())
});

app.get('/', middleAuth, (req, res) => {
    res.render('index/index');
});

app.get('/login', (req, res) => {
    res.render('index/login')
})
app.post('/login', (req, res) => {
    let body = req.body;
    let refDb = ref(db);
    get(child(refDb, `heart/user/${body.username}`))
        .then((snapshot) => {
            let data = snapshot.val();
            if (data != null) {
                if (data.password == body.password) {
                    app.locals.username = body.username;
                    res.redirect('/')
                } else {
                    res.render('index/login', { error: 'Mật khẩu không chính xác!' })
                }
            } else {
                res.render('index/login', { error: 'Username không tồn tại!' })
            }
        })
        .catch(() => { console.log('error') })
})
//
app.get('/signup', (req, res) => {
    res.render('index/signup')
})
app.post('/signup', (req, res) => {
    let body = req.body;
    let refDb = ref(db);
    get(child(refDb, `heart/user/${body.username}`))
        .then((snapshot) => {
            let data = snapshot.val();
            if (data != null) {
                res.render('index/signup', { error: 'Tên đăng nhập đã tồn tại' })
            } else {
                set(ref(db, `heart/user/${body.username}`),
                    {
                        username: body.username,
                        email: body.email,
                        password: body.password,
                        age: body.age,
                        gender: body.gender,
                        name: body.name
                    })
                res.redirect('/login')
            }
        })
        .catch(() => { console.log('error') })
})
//
app.get('/confirm-result', middleAuth, (req, res) => {
    let refDb = ref(db);
    get(child(refDb, `heart/user/${app.locals.username}`))
        .then((snapshot) => {
            let data = snapshot.val();
            if (data != null) {
                get(child(refDb, `heart/realtime`))
                    .then(snapshot1 => {
                        let data1 = snapshot1.val()
                        res.render('index/confirm', { age: data.age, gender: data.gender, heart: data1.heartmax, oxy: data1.oxymax })
                    })
                    .catch(() => { })
            } else {
                res.send('error when call db')
            }
        })
        .catch(() => { })
})
app.post('/confirm-result', middleAuth, (req, res) => {
    let body = req.body;
    console.log(body)
    let date = new Date();
    let refDb = ref(db);
    const {daunguc} = req.body
    let messDauNguc = ""
    switch (daunguc) {
        case "3":
            messDauNguc = "Không có dấu hiệu"
            break;
        case "2":
            messDauNguc = "Đau ngực nhẹ"
            break;
        case "1":
            messDauNguc = "Đau ngực vừa"
            break;
        case "0":
            messDauNguc = "Đau ngực nặng"
            break;        
        default:
            break;
    }
    get(child(refDb, `heart/user/${app.locals.username}`))
        .then((snapshot) => {
            let data = snapshot.val();
            console.log('user data ', data)
            if (data != null) {
                const mailOption = {
                    from: "luffschloss@gmail.com",
                    to: data.email,
                    subject: `Thông báo kết quả đo nhịp tim ngày ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`,
                    html: `
                <div>Tên: ${data.name}</div>
                <div>Tuổi: ${body.tuoi}</div>
                <div>Giới tính: ${body.gioitinh}</div>
                <div>Tình trạng đau ngực: ${messDauNguc} </div>
                <div>Huyết áp: ${body.huyetap}</div>
                <div>Nhịp tim cao nhất: ${body.nhiptim}</div>
                <div>Oxy cao nhất: ${body.oxy}</div>
                <div><h4>Dự đoán: ${body.canhbao}</h4></div>
                    `
                }
                transport.sendMail(mailOption)
                    .then(() => {
                         set(ref(db, 'heart/realtime/heartmin'), "1000")
                         set(ref(db, 'heart/realtime/heartmax'), "0")
                         set(ref(db, 'heart/realtime/oxymin'), "1000")
                         set(ref(db, 'heart/realtime/oxymax'), "0")
                        // set(ref(db, 'heart/heartlogs'), {})
                        // set(ref(db, 'heart/realtime/h'), { time: "", heartbeat: "0" })
                        res.json({ success: true })
                    })
                    .catch((e) => {

                    })
            } else {

            }
        })
        .catch(() => { })
})
//
app.post('/logout', middleAuth, (req, res) => {
    app.locals.username = undefined
    res.redirect('/login')
})
//


app.use(express.static(__dirname + '/public'))
app.listen(3222, () => {
    console.log("Open port 3222");
})

