/* =========================
   API BASE URL
========================= */
const API = "https://backendlogakses-production.up.railway.app"

/* =========================
   CEK LOGIN
========================= */
if (localStorage.getItem("isLogin") !== "true") {
  window.location.replace("index.html")
}

/* =========================
   LOGOUT
========================= */
function logout() {

  localStorage.removeItem("isLogin")
  localStorage.removeItem("username")

  window.location.replace("index.html")
}

/* =========================
   MENU
========================= */
function toggleMenu() {
  const menu = document.getElementById("dropdownMenu")
  menu.classList.toggle("show")
}

window.onclick = function (e) {
  if (!e.target.closest(".admin-menu")) {
    const menu = document.getElementById("dropdownMenu")
    menu.classList.remove("show")
  }
}

/* =========================
   DARK MODE
========================= */
function toggleDarkMode() {
  document.body.classList.toggle("dark")

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  )
}

/* =========================
   LOAD AWAL
========================= */
window.onload = function () {

  const savedTheme = localStorage.getItem("theme")

  if (savedTheme === "dark") {
    document.body.classList.add("dark")
  }

const username =
  localStorage.getItem("username")

if (username) {

    const namaAdmin =
      document.getElementById("namaAdmin")

    const dropName =
      document.getElementById("dropName")

    const settingNamaAdmin =
      document.getElementById("settingNamaAdmin")

    if (namaAdmin)
      namaAdmin.textContent = username

    if (dropName)
      dropName.textContent = username

    if (settingNamaAdmin)
      settingNamaAdmin.textContent = username
  }


  // LOAD DASHBOARD
  updateStatistik()

  // LOAD TABEL RIWAYAT
  tampilkanTamu()

  // BUKA HOME DEFAULT
  showPage("home")
}

/* =========================
   STATISTIK
========================= */
function updateStatistik() {

  fetch(`${API}/tamu`)
    .then(res => res.json())
    .then(data => {

      document.getElementById("totalTamu").textContent = data.length

      const today = new Date().toLocaleDateString("id-ID")

      const tamuHariIni = data.filter(tamu => {
        const tgl = new Date(tamu.jam_masuk).toLocaleDateString("id-ID")
        return tgl === today
      })

      document.getElementById("tamuHariIni").textContent = tamuHariIni.length

      const diDalam = data.filter(t => t.status === "DI DALAM")
      document.getElementById("diDalam").textContent = diDalam.length

      buatLaporanBulanan(data)
      buatStatistikChart(data)

    })
    .catch(err => console.log(err))
}

/* =========================
   LAPORAN BULANAN
========================= */
function buatLaporanBulanan(data) {

  const bulanNama = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ]

  let hasil = {}

  data.forEach(tamu => {
    const tgl = new Date(tamu.jam_masuk)
    const bulan = bulanNama[tgl.getMonth()] + " " + tgl.getFullYear()

    hasil[bulan] = (hasil[bulan] || 0) + 1
  })

  let html = ""

  Object.keys(hasil).reverse().forEach(bulan => {
    html += `
      <div class="report-item">
        <span>${bulan}</span>
        <b>${hasil[bulan]} Tamu</b>
      </div>
    `
  })

  document.getElementById("laporanBulanan").innerHTML = html
}

/* =========================
   SIMPAN TAMU (POST)
========================= */
async function simpanTamu() {

  const btn = document.getElementById("btnSimpan")
  btn.disabled = true
  btn.innerText = "Menyimpan..."

  try {

    const formData = new FormData()

    formData.append("nama", document.getElementById("namaTamu").value)
    formData.append("nip", document.getElementById("nipTamu").value)
    formData.append("asal_tamu", document.getElementById("asalTamu").value)
    formData.append("no_hp", document.getElementById("hpTamu").value)
    formData.append("email", document.getElementById("emailTamu").value)
    formData.append("keperluan", document.getElementById("keperluanTamu").value)
    formData.append("deskripsi", document.getElementById("deskripsiTamu").value)

    const foto = document.getElementById("fotoTamu")
    if (foto.files.length > 0) {
      formData.append("foto", foto.files[0])
    }

    const res = await fetch(`${API}/tamu`, {
      method: "POST",
      body: formData
    })

    if (!res.ok) throw new Error("Gagal simpan")

    showToast("Data berhasil disimpan", "success")

    document.querySelectorAll("input, textarea").forEach(el => el.value = "")

    showPage("riwayat")
    tampilkanTamu()
    updateStatistik()

  } catch (err) {
    console.log(err)
    showToast("Gagal menyimpan data", "error")

  } finally {
    btn.disabled = false
    btn.innerText = "Simpan Data Tamu"
  }
}

/* =========================
   TAMPILKAN DATA
========================= */
function tampilkanTamu() {

  fetch(`${API}/tamu`)
    .then(res => res.json())
    .then(data => {

      let isi = ""

      data.forEach(tamu => {

        let statusClass =
          tamu.status === "DI DALAM"
            ? "status-dalam"
            : "status-keluar"

        isi += `
        <tr>
          <td>${tamu.id}</td>
          <td>${tamu.nama}</td>
          <td>${tamu.nip || "-"}</td>
          <td>${tamu.asal_tamu || "-"}</td>
          <td>${tamu.keperluan}</td>
          <td>${tamu.no_hp}</td>
          <td>${formatTanggal(tamu.jam_masuk)}</td>
          <td>${tamu.jam_keluar ? formatTanggal(tamu.jam_keluar) : "-"}</td>
          <td><span class="${statusClass}">${tamu.status}</span></td>
          <td>
            ${
              tamu.foto
                ? `<button onclick="lihatFoto('${tamu.foto}')">Lihat</button>`
                : "-"
            }
          </td>
          <td>
            ${
              tamu.status === "DI DALAM"
                ? `<button onclick="keluarTamu(${tamu.id})">Keluar</button>`
                : ""
            }
            <button onclick="editTamu(${tamu.id})">Edit</button>
          </td>
        </tr>
        `
      })

      document.getElementById("tabel-tamu").innerHTML = isi
    })
}

/* =========================
   ACTION
========================= */
function keluarTamu(id) {
  fetch(`${API}/tamu/keluar/${id}`, { method: "PUT" })
    .then(() => {
      tampilkanTamu()
      updateStatistik()
    })
}

function hapusTamu(id) {
  if (!confirm("Yakin hapus?")) return

  fetch(`${API}/tamu/${id}`, { method: "DELETE" })
    .then(() => {
      tampilkanTamu()
      updateStatistik()
    })
}

function editTamu(id) {
  fetch(`${API}/tamu/${id}`)
    .then(res => res.json())
    .then(tamu => {
      document.getElementById("editId").value = tamu.id
      document.getElementById("editNama").value = tamu.nama
      document.getElementById("editNip").value = tamu.nip || ""
      document.getElementById("editAsal").value = tamu.asal_tamu || ""
      document.getElementById("editHp").value = tamu.no_hp
      document.getElementById("editEmail").value = tamu.email || ""
      document.getElementById("editKeperluan").value = tamu.keperluan

      document.getElementById("editModal").style.display = "flex"
    })
}

function simpanEdit() {

  const id = document.getElementById("editId").value

  fetch(`${API}/tamu/edit/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nama: document.getElementById("editNama").value,
      nip: document.getElementById("editNip").value,
      asal_tamu: document.getElementById("editAsal").value,
      no_hp: document.getElementById("editHp").value,
      email: document.getElementById("editEmail").value,
      keperluan: document.getElementById("editKeperluan").value
    })
  })
  .then(res => res.json())
  .then(data => {

    showToast("Data berhasil diupdate", "success")

    tutupModal()

    tampilkanTamu()
    updateStatistik()

  })
  .catch(err => {
    console.log(err)
    showToast("Gagal update data", "error")
  })
}

/* =========================
   UTIL
========================= */
function formatTanggal(waktu) {
  return new Date(waktu).toLocaleString("id-ID")
}

function lihatFoto(foto) {
  document.getElementById("previewFoto").src = `${API}/uploads/${foto}`
  document.getElementById("fotoModal").style.display = "flex"
}

function tutupFoto() {
  document.getElementById("fotoModal").style.display = "none"
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.className = "toast show " + type

  setTimeout(() => toast.className = "toast", 3000)
}

function buatStatistikChart(data) {

  const bulanNama = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ]

  let totalPerBulan = new Array(12).fill(0)

  data.forEach(tamu => {
    const bulan = new Date(tamu.jam_masuk).getMonth()
    totalPerBulan[bulan]++
  })

  const max = Math.max(...totalPerBulan, 1)

  let chartHTML = ""
  let labelHTML = ""

  totalPerBulan.forEach((jumlah, i) => {

    const tinggi = (jumlah / max) * 100

    chartHTML += `
      <div class="bar" style="height:${tinggi}%"></div>
    `

    labelHTML += `
      <span>${bulanNama[i]}</span>
    `
  })

  document.getElementById("statistikChart").innerHTML = chartHTML
  document.getElementById("chartLabel").innerHTML = labelHTML
}

/* =========================
   PINDAH HALAMAN
========================= */
function showPage(pageId, el) {

  document.querySelectorAll(".page").forEach(page => {
    page.style.display = "none"
  })

  const activePage = document.getElementById(pageId)

  if (activePage) {
    activePage.style.display = "block"
  }

  document.querySelectorAll(".sidebar ul li")
    .forEach(li => li.classList.remove("active"))

  if (el) {
    el.classList.add("active")
  }

  const judul = document.getElementById("judul")

  if (pageId === "home") {
    judul.textContent = "Beranda"
  }

  if (pageId === "permohonan") {
    judul.textContent = "Permohonan Tamu"
    loadPermohonan()
  }

  if (pageId === "riwayat") {
    judul.textContent = "Riwayat Tamu"
    tampilkanTamu()
  }

  if (pageId === "form") {
    judul.textContent = "Tambah Tamu"
  }

  if (pageId === "pengaturan") {
    judul.textContent = "Pengaturan"
    loadAdmin()
  }

}

function showTambahAdminModal() {

  const username = prompt("Masukkan username admin baru")

  if (!username) return

  const password = prompt("Masukkan password admin baru")

  if (!password) return

  fetch(`${API}/auth/admins`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      password
    })
  })
  .then(res => res.json())
  .then(data => {

    if (data.success) {

      showToast(
        "Data admin berhasil ditambahkan",
        "success"
      )

      loadAdmin()

    } else {

      showToast(
        "Gagal menambahkan admin",
        "error"
      )

    }

  })
  .catch(err => {

    console.log(err)

    showToast(
      "Gagal menambahkan admin",
      "error"
    )

  })

}

/* =========================
   DOWNLOAD EXCEL
========================= */
function downloadExcel() {

  fetch(`${API}/tamu`)
    .then(res => res.json())
    .then(data => {

      const hasil = data.map((tamu, index) => ({
        No: index + 1,
        Nama: tamu.nama,
        NIP: tamu.nip,
        Asal: tamu.asal_tamu,
        Keperluan: tamu.keperluan,
        "No HP": tamu.no_hp,
        Email: tamu.email,
        Status: tamu.status,
        "Jam Masuk": formatTanggal(tamu.jam_masuk),
        "Jam Keluar": tamu.jam_keluar
          ? formatTanggal(tamu.jam_keluar)
          : "-"
      }))

      const worksheet = XLSX.utils.json_to_sheet(hasil)
      const workbook = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Data Tamu"
      )

      XLSX.writeFile(
        workbook,
        "Rekap_Tamu.xlsx"
      )

    })
}

/* =========================
   TUTUP MODAL
========================= */
function tutupModal() {
  document.getElementById("editModal").style.display = "none"
}

/* =========================
   BLOCK BACK BUTTON
========================= */
window.history.pushState(null, "", window.location.href)

window.onpopstate = function () {
  window.history.pushState(null, "", window.location.href)
}

/* =========================
   MODAL PASSWORD
========================= */
function showPasswordModal() {
  document.getElementById("passwordModal").style.display = "flex"
}

function closePasswordModal() {
  document.getElementById("passwordModal").style.display = "none"
}

/* =========================
   GANTI PASSWORD
========================= */
async function changePassword() {

  const oldPassword =
    document.getElementById("oldPassword").value

  const newPassword =
    document.getElementById("newPassword").value

  try {

    const res = await fetch(
      `${API}/auth/change-password`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
  username: localStorage.getItem("username"),
  oldPassword,
  newPassword
})
      }
    )

    const data = await res.json()

    if (data.success) {

      showToast(
        "Password berhasil diganti",
        "success"
      )

      closePasswordModal()

      document.getElementById("oldPassword").value = ""
      document.getElementById("newPassword").value = ""

    } else {

      showToast(
        data.message,
        "error"
      )

    }

  } catch (err) {

    console.log(err)

    showToast(
      "Server error",
      "error"
    )

  }

}

/* =========================
   SEARCH FILTER
========================= */
function filterTamu() {

  const input =
    document.getElementById("searchInput").value.toLowerCase()

  const rows =
    document.querySelectorAll("#tabel-tamu tr")

  rows.forEach(row => {

    const text =
      row.innerText.toLowerCase()

    row.style.display =
      text.includes(input)
        ? ""
        : "none"

  })

}

function loadAdmin() {

  fetch(`${API}/auth/admins`)
    .then(res => res.json())
    .then(data => {

      let html = ""

      data.forEach(admin => {

        html += `
          <tr>
            <td>${admin.id}</td>
            <td>${admin.username}</td>
            <td>
              <button onclick="hapusAdmin(${admin.id})">
  Hapus
</button>
            </td>
          </tr>
        `

      })

      document.getElementById("tabel-admin").innerHTML = html

    })

}

function hapusAdmin(id) {

  if (!confirm("Yakin hapus admin ini?")) return

  fetch(`${API}/auth/admins/${id}`, {
    method: "DELETE"
  })
  .then(res => res.json())
  .then(data => {

    if (data.success) {

      showToast(
        "Admin berhasil dihapus",
        "success"
      )

      loadAdmin()

    }

  })
  .catch(err => {

    console.log(err)

    showToast(
      "Gagal menghapus admin",
      "error"
    )

  })

}