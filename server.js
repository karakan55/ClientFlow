const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// DEMO ADMİN BİLGİLERİ
const env = fs.readFileSync(".env", "utf8")
    .split("\n")
    .reduce((obj, line) => {
        const [key, ...value] = line.trim().split("=");
        if (key) obj[key] = value.join("=");
        return obj;
    }, {});

const ADMIN_USERNAME = env.ADMIN_USERNAME;
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

const appointmentsFile = path.join(__dirname, "appointments.json");

const serviceDurations = {
    "sac-kesimi": 30,
    "fon": 30,
    "boya": 120,
    "manikur": 60
};

const openingTime = "09:00";
const closingTime = "19:00";

function readAppointments() {
    try {
        if (!fs.existsSync(appointmentsFile)) {
            fs.writeFileSync(appointmentsFile, "[]");
        }

        return JSON.parse(
            fs.readFileSync(appointmentsFile, "utf8")
        );
    } catch (error) {
        return [];
    }
}

function saveAppointments(appointments) {
    fs.writeFileSync(
        appointmentsFile,
        JSON.stringify(appointments, null, 2)
    );
}

function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60)
        .toString()
        .padStart(2, "0");

    const mins = (minutes % 60)
        .toString()
        .padStart(2, "0");

    return `${hours}:${mins}`;
}

function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
    });

    res.end(JSON.stringify(data));
}

function sendHTML(res) {
    const html = fs.readFileSync(
        path.join(__dirname, "index.html"),
        "utf8"
    );

    res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
    });

    res.end(html);
}

function sendAdminHTML(res) {
    const html = fs.readFileSync(
        path.join(__dirname, "admin.html"),
        "utf8"
    );

    res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
    });

    res.end(html);
}

function sendLoginPage(res, message = "") {

    res.writeHead(401, {
        "Content-Type": "text/html; charset=utf-8"
    });

    res.end(`
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Admin Girişi</title>

<style>

body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #f5f5f5;
}

.box {
    width: 90%;
    max-width: 400px;
    margin: 100px auto;
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

h1 {
    text-align: center;
}

input {
    width: 100%;
    padding: 13px;
    margin-top: 10px;
    margin-bottom: 15px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 16px;
}

button {
    width: 100%;
    padding: 13px;
    border: none;
    border-radius: 8px;
    background: #555;
    color: white;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
}

.error {
    color: #b00000;
    text-align: center;
    margin-bottom: 15px;
}

</style>
</head>

<body>

<div class="box">

<h1>Admin Girişi</h1>

${message ? `<div class="error">${message}</div>` : ""}

<form method="POST" action="/admin-login">

<label>Kullanıcı adı</label>

<input
    type="text"
    name="username"
    required
>

<label>Şifre</label>

<input
    type="password"
    name="password"
    required
>

<button type="submit">
    Giriş Yap
</button>

</form>

</div>

</body>
</html>
`);
}

const server = http.createServer((req, res) => {

    // ANA SAYFA
    if (
        req.method === "GET" &&
        req.url === "/"
    ) {
        return sendHTML(res);
    }

    // ADMİN GİRİŞ SAYFASI
    if (
        req.method === "GET" &&
        req.url === "/admin"
    ) {
        return sendLoginPage(res);
    }

    // ADMİN GİRİŞ
    if (
        req.method === "POST" &&
        req.url === "/admin-login"
    ) {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            const params =
                new URLSearchParams(body);

            const username =
                params.get("username");

            const password =
                params.get("password");

            if (
                username === ADMIN_USERNAME &&
                password === ADMIN_PASSWORD
            ) {

                res.writeHead(302, {
                    "Location": "/admin-panel"
                });

                return res.end();
            }

            return sendLoginPage(
                res,
                "Kullanıcı adı veya şifre yanlış."
            );

        });

        return;
    }

    // ADMİN PANELİ
    if (
        req.method === "GET" &&
        req.url === "/admin-panel"
    ) {
        return sendAdminHTML(res);
    }

    // TEST
    if (
        req.method === "GET" &&
        req.url === "/api/test"
    ) {
        return sendJSON(res, 200, {
            message: "Client Flow API çalışıyor"
        });
    }

    // MÜSAİT SAATLER
    if (
        req.method === "GET" &&
        req.url.startsWith("/api/available-slots")
    ) {

        const url = new URL(
            req.url,
            `http://localhost:${PORT}`
        );

        const staff =
            url.searchParams.get("staff");

        const date =
            url.searchParams.get("date");

        const service =
            url.searchParams.get("service");

        if (!staff || !date || !service) {

            return sendJSON(res, 400, {
                success: false,
                message:
                    "Personel, tarih ve hizmet bilgisi gerekli."
            });
        }

        const duration =
            serviceDurations[service];

        if (!duration) {

            return sendJSON(res, 400, {
                success: false,
                message: "Geçersiz hizmet."
            });
        }

        const appointments =
            readAppointments();

        const availableSlots = [];

        const openingMinutes =
            timeToMinutes(openingTime);

        const closingMinutes =
            timeToMinutes(closingTime);

        for (
            let startMinutes = openingMinutes;
            startMinutes + duration <= closingMinutes;
            startMinutes += 30
        ) {

            const endMinutes =
                startMinutes + duration;

            const conflict =
                appointments.some(item => {

                    if (item.staff !== staff)
                        return false;

                    if (item.date !== date)
                        return false;

                    const existingDuration =
                        item.duration || 30;

                    const existingStart =
                        timeToMinutes(item.time);

                    const existingEnd =
                        existingStart +
                        existingDuration;

                    return (
                        startMinutes < existingEnd &&
                        endMinutes > existingStart
                    );
                });

            if (!conflict) {

                availableSlots.push({

                    time:
                        minutesToTime(startMinutes),

                    endTime:
                        minutesToTime(endMinutes)

                });
            }
        }

        return sendJSON(res, 200, {
            success: true,
            slots: availableSlots
        });
    }

    // RANDEVU LİSTESİ
    if (
        req.method === "GET" &&
        req.url === "/api/appointments"
    ) {

        const appointments =
            readAppointments();

        return sendJSON(
            res,
            200,
            appointments
        );
    }

    // RANDEVU İPTAL
    if (
        req.method === "DELETE" &&
        req.url.startsWith("/api/appointments/")
    ) {

        const id =
            req.url.split("/").pop();

        const appointments =
            readAppointments();

        const oldLength =
            appointments.length;

        const newAppointments =
            appointments.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );

        if (
            newAppointments.length ===
            oldLength
        ) {

            return sendJSON(res, 404, {
                success: false,
                message:
                    "Randevu bulunamadı."
            });
        }

        saveAppointments(
            newAppointments
        );

        return sendJSON(res, 200, {
            success: true,
            message:
                "Randevu başarıyla iptal edildi."
        });
    }

    // RANDEVU OLUŞTURMA
    if (
        req.method === "POST" &&
        req.url === "/api/appointments"
    ) {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            try {

                const appointment =
                    JSON.parse(body);

                const requiredFields = [
                    "name",
                    "phone",
                    "service",
                    "staff",
                    "date",
                    "time"
                ];

                for (
                    const field of requiredFields
                ) {

                    if (!appointment[field]) {

                        return sendJSON(
                            res,
                            400,
                            {
                                success: false,
                                message:
                                    `${field} alanı gerekli.`
                            }
                        );
                    }
                }

                const duration =
                    serviceDurations[
                        appointment.service
                    ];

                if (!duration) {

                    return sendJSON(
                        res,
                        400,
                        {
                            success: false,
                            message:
                                "Geçersiz hizmet."
                        }
                    );
                }

                const appointments =
                    readAppointments();

                const startMinutes =
                    timeToMinutes(
                        appointment.time
                    );

                const endMinutes =
                    startMinutes +
                    duration;

                const openingMinutes =
                    timeToMinutes(
                        openingTime
                    );

                const closingMinutes =
                    timeToMinutes(
                        closingTime
                    );

                if (
                    startMinutes <
                        openingMinutes ||
                    endMinutes >
                        closingMinutes
                ) {

                    return sendJSON(
                        res,
                        400,
                        {
                            success: false,
                            message:
                                "Randevu saatleri 09:00 - 19:00 arasındadır."
                        }
                    );
                }

                const conflict =
                    appointments.some(item => {

                        if (
                            item.staff !==
                            appointment.staff
                        ) {
                            return false;
                        }

                        if (
                            item.date !==
                            appointment.date
                        ) {
                            return false;
                        }

                        const existingDuration =
                            item.duration || 30;

                        const existingStart =
                            timeToMinutes(
                                item.time
                            );

                        const existingEnd =
                            existingStart +
                            existingDuration;

                        return (
                            startMinutes <
                                existingEnd &&
                            endMinutes >
                                existingStart
                        );
                    });

                if (conflict) {

                    return sendJSON(
                        res,
                        409,
                        {
                            success: false,
                            message:
                                "Bu personelin seçtiğiniz saat aralığı dolu."
                        }
                    );
                }

                appointment.duration =
                    duration;

                appointment.endTime =
                    minutesToTime(
                        endMinutes
                    );

                appointment.id =
                    Date.now();

                appointment.createdAt =
                    new Date().toISOString();

                appointments.push(
                    appointment
                );

                saveAppointments(
                    appointments
                );

                return sendJSON(
                    res,
                    201,
                    {
                        success: true,
                        message:
                            "Randevunuz başarıyla oluşturuldu.",
                        appointment
                    }
                );

            } catch (error) {

                return sendJSON(
                    res,
                    400,
                    {
                        success: false,
                        message:
                            "Geçersiz veri."
                    }
                );
            }
        });

        return;
    }

    res.writeHead(404, {
        "Content-Type":
            "application/json; charset=utf-8"
    });

    res.end(JSON.stringify({
        success: false,
        message:
            "Sayfa bulunamadı."
    }));

});

server.listen(PORT, () => {

    console.log(
        `Client Flow çalışıyor: http://localhost:${PORT}`
    );

});