// ======================================
// HADIRYUK - DIGITAL ATTENDANCE
// ======================================

document.addEventListener("DOMContentLoaded", function () {

    // ==================================
    // DATA SISWA
    // ==================================

    const siswaAwal = [
        "Abiansyah Fahmi Izhar",
        "Ade Andri Yuanda",
        "Adelia Putri",
        "Adhitya Firmansyah",
        "Afni Nurul Ramadani Saragih",
        "Aidil Azmi",
        "Aji Surya Pratama",
        "Akbar Maulana",
        "Alfandi Saputra",
        "Arif Wibowo",
        "Andre Saputra",
        "Balqis Larasati",
        "Chila Salsabilah",
        "Dhea Ananda Nur Kholillah",
        "Dika Dwi Ranata Silitongah",
        "Elisabeth Fitrianda Simbolon",
        "Enzel Amalia",
        "Fahri Arba’i",
        "Fannisya Chairani",
        "Firziawan Prasetiyo",
        "Fahriz Arkan Syahputra",
        "Gara Gusti Lestari",
        "Illa Natasya",
        "Khairunnisa",
        "Mila Kanaya Putri Sinaga",
        "Muhammad Solliul Anwar",
        "Nayla Putri",
        "Nazla Sabrina Saragih",
        "Novita Sari",
        "Nurul Khonita",
        "Putri Aulia Ramadhani",
        "Reyhan Kurniawan",
        "Richo Rifaldi",
        "Royhan Zahir",
        "Sella Dwi Yanti",
        "Sella Aulia",
        "Siti Adira Nurhasanah",
        "Sry Muliani Damanik",
        "Zaura Qisi Anggun"
    ];


    // ==================================
    // PENYIMPANAN DATA
    // ==================================

    function ambilData(key, dataDefault) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return data === null ? dataDefault : data;
        } catch (error) {
            return dataDefault;
        }
    }

    let siswa = ambilData("hadiryuk_siswa", siswaAwal);
    let absensi = ambilData("hadiryuk_absensi", []);

    let currentUser = null;
    let qrScanner = null;
    let scannerBerjalan = false;

    function simpanData() {
        localStorage.setItem(
            "hadiryuk_siswa",
            JSON.stringify(siswa)
        );

        localStorage.setItem(
            "hadiryuk_absensi",
            JSON.stringify(absensi)
        );
    }


    // ==================================
    // FUNGSI TANGGAL DAN WAKTU
    // ==================================

    function tanggalHariIni() {
        const sekarang = new Date();

        const tahun = sekarang.getFullYear();
        const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
        const tanggal = String(sekarang.getDate()).padStart(2, "0");

        return `${tahun}-${bulan}-${tanggal}`;
    }

    function waktuSekarang() {
        return new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function tanggalIndonesia() {
        return new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }


    // ==================================
    // ELEMEN HTML
    // ==================================

    const loginForm = document.getElementById("loginForm");
    const loginPage = document.getElementById("loginPage");
    const appPage = document.getElementById("appPage");


    // ==================================
    // LOGIN
    // ==================================

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const role = document.getElementById("loginRole").value;
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (!username || !password) {
            tampilkanLoginMessage("Isi username dan password terlebih dahulu.");
            return;
        }

        if (role === "admin") {

            if (
                username.toLowerCase() === "admin" &&
                password === "admin123"
            ) {
                masukAplikasi({
                    nama: "Admin",
                    role: "admin"
                });
            } else {
                tampilkanLoginMessage("Username atau password admin salah.");
            }

            return;
        }

        const namaSiswa = siswa.find(function (nama) {
            return nama.toLowerCase() === username.toLowerCase();
        });

        if (namaSiswa && password === "siswa123") {
            masukAplikasi({
                nama: namaSiswa,
                role: "siswa"
            });
        } else {
            tampilkanLoginMessage("Nama atau password siswa salah.");
        }
    });


    function tampilkanLoginMessage(pesan) {
        document.getElementById("loginMessage").textContent = pesan;
    }


    function masukAplikasi(user) {

        currentUser = user;

        loginPage.classList.add("hidden");
        appPage.classList.remove("hidden");

        document.getElementById("sidebarName").textContent = user.nama;

        document.getElementById("sidebarRole").textContent =
            user.role === "admin" ? "Administrator" : "Siswa";

        document.getElementById("sidebarAvatar").textContent =
            user.nama.charAt(0).toUpperCase();

        document.getElementById("welcomeName").textContent = user.nama;

        document.getElementById("currentDate").textContent =
            tanggalIndonesia();

        document.querySelectorAll(".admin-only").forEach(function (element) {
            element.classList.toggle("hidden", user.role !== "admin");
        });

        renderAttendanceOptions();
        renderStudents();
        updateDashboard();
        renderHistory();
        renderReports();

        showPage("dashboard");
    }


    // ==================================
    // LOGOUT
    // ==================================

    document.getElementById("logoutBtn").addEventListener("click", function () {

        hentikanScanner();

        currentUser = null;

        appPage.classList.add("hidden");
        loginPage.classList.remove("hidden");

        loginForm.reset();

        document.getElementById("loginMessage").textContent = "";
    });


    // ==================================
    // NAVIGASI
    // ==================================

    function showPage(pageId) {

        if (!currentUser) return;

        if (
            currentUser.role !== "admin" &&
            ["students", "reports"].includes(pageId)
        ) {
            return;
        }

        document.querySelectorAll(".page").forEach(function (page) {
            page.classList.remove("active");
        });

        document.querySelectorAll(".nav-btn").forEach(function (button) {
            button.classList.remove("active");
        });

        const halaman = document.getElementById(pageId);

        if (!halaman) return;

        halaman.classList.add("active");

        const tombol = document.querySelector(
            `.nav-btn[data-page="${pageId}"]`
        );

        if (tombol) {
            tombol.classList.add("active");
        }

        const judul = {
            dashboard: "Dashboard",
            students: "Data Siswa",
            attendance: "Absensi",
            qr: "QR Code",
            history: "Riwayat Absensi",
            reports: "Laporan"
        };

        document.getElementById("pageTitle").textContent =
            judul[pageId] || "HadirYuk";

        if (pageId !== "qr") {
            hentikanScanner();
        }
    }


    document.querySelectorAll(".nav-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            showPage(this.dataset.page);
        });
    });


    // ==================================
    // DASHBOARD
    // ==================================

    function updateDashboard() {

        const hariIni = tanggalHariIni();

        const dataHariIni = absensi.filter(function (data) {
            return data.tanggal === hariIni;
        });

        const jumlahHadir = dataHariIni.filter(function (data) {
            return data.status === "Hadir";
        }).length;

        const jumlahBelum = Math.max(0, siswa.length - jumlahHadir);

        const persentase = siswa.length > 0
            ? Math.round((jumlahHadir / siswa.length) * 100)
            : 0;

        document.getElementById("totalStudents").textContent = siswa.length;
        document.getElementById("totalPresent").textContent = jumlahHadir;
        document.getElementById("totalAbsent").textContent = jumlahBelum;
        document.getElementById("presentPercent").textContent = persentase + "%";

        const tabel = document.getElementById("dashboardAttendance");

        if (dataHariIni.length === 0) {
            tabel.innerHTML = `
                <tr>
                    <td colspan="3">Belum ada data absensi hari ini.</td>
                </tr>
            `;
            return;
        }

        tabel.innerHTML = dataHariIni.map(function (data) {
            return `
                <tr>
                    <td>${escapeHTML(data.nama)}</td>
                    <td>${escapeHTML(data.status)}</td>
                    <td>${escapeHTML(data.waktu)}</td>
                </tr>
            `;
        }).join("");
    }


    // ==================================
    // DATA SISWA
    // ==================================

    function renderStudents() {

        const tabel = document.getElementById("studentTable");

        tabel.innerHTML = siswa.map(function (nama, index) {
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHTML(nama)}</td>
                    <td>
                        <button class="delete-btn" data-index="${index}">
                            Hapus
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }


    document.getElementById("addStudentBtn").addEventListener("click", function () {

        if (!currentUser || currentUser.role !== "admin") return;

        const input = document.getElementById("newStudent");
        const nama = input.value.trim();

        if (!nama) {
            alert("Masukkan nama siswa terlebih dahulu.");
            return;
        }

        const sudahAda = siswa.some(function (item) {
            return item.toLowerCase() === nama.toLowerCase();
        });

        if (sudahAda) {
            alert("Nama siswa sudah terdaftar.");
            return;
        }

        siswa.push(nama);

        simpanData();

        input.value = "";

        renderStudents();
        renderAttendanceOptions();
        updateDashboard();
        renderReports();

        alert("Siswa berhasil ditambahkan.");
    });


    document.getElementById("studentTable").addEventListener("click", function (event) {

        const tombol = event.target.closest(".delete-btn");

        if (!tombol) return;

        if (!currentUser || currentUser.role !== "admin") return;

        const index = Number(tombol.dataset.index);
        const nama = siswa[index];

        if (nama === undefined) return;

        if (!confirm(`Yakin ingin menghapus ${nama}?`)) return;

        siswa.splice(index, 1);

        simpanData();

        renderStudents();
        renderAttendanceOptions();
        updateDashboard();
        renderReports();
    });


    // ==================================
    // PILIHAN SISWA
    // ==================================

    function renderAttendanceOptions() {

        const select = document.getElementById("attendanceStudent");

        select.innerHTML = siswa.map(function (nama) {
            return `
                <option value="${escapeHTML(nama)}">
                    ${escapeHTML(nama)}
                </option>
            `;
        }).join("");

        if (currentUser && currentUser.role === "siswa") {
            select.value = currentUser.nama;
            select.disabled = true;
        } else {
            select.disabled = false;
        }
    }


    // ==================================
    // SIMPAN ABSENSI
    // ==================================

    function catatAbsensi(nama, status, metode) {

        const hariIni = tanggalHariIni();

        const sudahAbsen = absensi.some(function (data) {
            return data.nama === nama && data.tanggal === hariIni;
        });

        if (sudahAbsen) {
            return false;
        }

        absensi.push({
            nama: nama,
            tanggal: hariIni,
            waktu: waktuSekarang(),
            status: status,
            metode: metode
        });

        simpanData();

        updateDashboard();
        renderHistory();
        renderReports();

        return true;
    }


    document.getElementById("saveAttendance").addEventListener("click", function () {

        if (!currentUser) return;

        const nama = document.getElementById("attendanceStudent").value;
        const status = document.getElementById("attendanceStatus").value;
        const message = document.getElementById("attendanceMessage");

        if (!nama) {
            message.textContent = "Pilih nama siswa terlebih dahulu.";
            return;
        }

        if (currentUser.role === "siswa" && nama !== currentUser.nama) {
            message.textContent = "Kamu hanya dapat mengisi absensimu sendiri.";
            return;
        }

        const berhasil = catatAbsensi(nama, status, "Manual");

        if (berhasil) {
            message.style.color = "#239b68";
            message.textContent = "Absensi berhasil disimpan.";
        } else {
            message.style.color = "#d65b5b";
            message.textContent = "Siswa sudah melakukan absensi hari ini.";
        }
    });


    // ==================================
    // GENERATE QR CODE
    // ==================================

    document.getElementById("generateQR").addEventListener("click", function () {

        const message = document.getElementById("qrMessage");
        const display = document.getElementById("qrDisplay");

        if (!currentUser || currentUser.role !== "admin") {
            message.textContent = "Hanya admin yang dapat membuat QR Code.";
            return;
        }

        if (typeof QRCode === "undefined") {
            message.textContent = "Library QR Code gagal dimuat. Periksa koneksi internet.";
            return;
        }

        display.innerHTML = "";

        const isiQR = `HADIRYUK|XI RPL 1|${tanggalHariIni()}`;

        new QRCode(display, {
            text: isiQR,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        message.style.color = "#239b68";
        message.textContent = "QR Code berhasil dibuat untuk hari ini.";
    });


    // ==================================
    // SCAN QR CODE
    // ==================================

    document.getElementById("startScan").addEventListener("click", mulaiScanner);

    document.getElementById("stopScan").addEventListener("click", hentikanScanner);


    async function mulaiScanner() {

        const message = document.getElementById("scanMessage");

        if (!currentUser) return;

        if (currentUser.role !== "siswa") {
            message.textContent = "Login sebagai siswa untuk melakukan scan.";
            return;
        }

        if (typeof Html5Qrcode === "undefined") {
            message.textContent = "Library pemindai QR gagal dimuat.";
            return;
        }

        if (scannerBerjalan) return;

        try {

            qrScanner = new Html5Qrcode("qr-reader");

            await qrScanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: {
                        width: 230,
                        height: 230
                    }
                },

                function (hasil) {

                    prosesHasilQR(hasil);
                },

                function () {
                    // Tidak perlu menampilkan pesan untuk setiap frame.
                }
            );

            scannerBerjalan = true;

            document.getElementById("startScan").classList.add("hidden");
            document.getElementById("stopScan").classList.remove("hidden");

            message.style.color = "#6846e8";
            message.textContent = "Kamera aktif. Arahkan ke QR Code.";

        } catch (error) {

            console.error(error);

            message.textContent =
                "Kamera gagal dibuka. Izinkan akses kamera dan pastikan website menggunakan HTTPS.";
        }
    }


    function prosesHasilQR(hasil) {

        if (!currentUser || currentUser.role !== "siswa") return;

        const bagian = hasil.split("|");

        const valid =
            bagian.length === 3 &&
            bagian[0] === "HADIRYUK" &&
            bagian[1] === "XI RPL 1" &&
            bagian[2] === tanggalHariIni();

        const message = document.getElementById("scanMessage");

        if (!valid) {
            message.style.color = "#d65b5b";
            message.textContent = "QR Code tidak valid atau sudah kedaluwarsa.";
            return;
        }

        const berhasil = catatAbsensi(
            currentUser.nama,
            "Hadir",
            "QR Code"
        );

        if (berhasil) {
            message.style.color = "#239b68";
            message.textContent = "Absensi berhasil dicatat!";
        } else {
            message.style.color = "#d65b5b";
            message.textContent = "Kamu sudah melakukan absensi hari ini.";
        }

        hentikanScanner();
    }


    async function hentikanScanner() {

        if (qrScanner && scannerBerjalan) {

            try {
                await qrScanner.stop();
                await qrScanner.clear();
            } catch (error) {
                console.log("Scanner sudah berhenti.");
            }
        }

        qrScanner = null;
        scannerBerjalan = false;

        document.getElementById("startScan").classList.remove("hidden");
        document.getElementById("stopScan").classList.add("hidden");
    }


    // ==================================
    // RIWAYAT ABSENSI
    // ==================================

    function renderHistory() {

        const tabel = document.getElementById("historyTable");

        let data = [...absensi].reverse();

        if (currentUser && currentUser.role === "siswa") {
            data = data.filter(function (item) {
                return item.nama === currentUser.nama;
            });
        }

        if (data.length === 0) {
            tabel.innerHTML = `
                <tr>
                    <td colspan="5">Belum ada riwayat absensi.</td>
                </tr>
            `;
            return;
        }

        tabel.innerHTML = data.map(function (item) {
            return `
                <tr>
                    <td>${escapeHTML(item.tanggal)}</td>
                    <td>${escapeHTML(item.nama)}</td>
                    <td>${escapeHTML(item.status)}</td>
                    <td>${escapeHTML(item.waktu)}</td>
                    <td>${escapeHTML(item.metode || "Manual")}</td>
                </tr>
            `;
        }).join("");
    }


    // ==================================
    // LAPORAN
    // ==================================

    function renderReports() {

        const container = document.getElementById("reportSummary");

        const hariIni = tanggalHariIni();

        const data = absensi.filter(function (item) {
            return item.tanggal === hariIni;
        });

        const hadir = data.filter(item => item.status === "Hadir").length;
        const izin = data.filter(item => item.status === "Izin").length;
        const sakit = data.filter(item => item.status === "Sakit").length;

        container.innerHTML = `
            <div class="stat-card">
                <p>Hadir</p>
                <h2>${hadir}</h2>
            </div>

            <div class="stat-card">
                <p>Izin</p>
                <h2>${izin}</h2>
            </div>

            <div class="stat-card">
                <p>Sakit</p>
                <h2>${sakit}</h2>
            </div>

            <div class="stat-card">
                <p>Total Siswa</p>
                <h2>${siswa.length}</h2>
            </div>
        `;
    }


    // ==================================
    // CETAK LAPORAN
    // ==================================

    document.getElementById("printReport").addEventListener("click", function () {

        if (!currentUser || currentUser.role !== "admin") return;

        window.print();
    });


    // ==================================
    // KEAMANAN TEKS
    // ==================================

    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];
        });
    }


    // ==================================
    // AWAL PROGRAM
    // ==================================

    simpanData();

    console.log("HadirYuk berhasil dijalankan.");

});