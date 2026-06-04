fetch('http://localhost:3000/tamu')
  .then(response => response.json())
  .then(data => {
    const tabel = document.getElementById('tabel-tamu')

    data.forEach(tamu => {
      const row = `
        <tr>
          <td>${tamu.id}</td>
          <td>${tamu.nama}</td>
          <td>${tamu.nip}</td>
          <td>${tamu.keperluan}</td>
          <td>${tamu.no_hp}</td>
          <td>${tamu.jam_masuk}</td>
          <td>${tamu.status}</td>
          <td>
            <button onclick="edit(${tamu.id})">Edit</button>
             ${
                tamu.status === 'DI DALAM'
                ? `<button onclick="keluar(${tamu.id})">Keluar</button>`
                : '-'
             }
            <button onclick="hapus(${tamu.id})">Hapus</button>
        </td>       
        </tr>
      `

      tabel.innerHTML += row
    })
  })
  .catch(error => console.error(error))

  function keluar(id) {
  fetch(`http://localhost:3000/tamu/${id}`, {
    method: 'PUT'
  })
  .then(res => res.json())
  .then(data => {
    alert('Tamu sudah keluar')
    location.reload()
  })
  .catch(err => console.error(err))
}

function hapus(id) {
  if (!confirm('Yakin mau hapus data ini?')) return

  fetch(`http://localhost:3000/tamu/${id}`, {
    method: 'DELETE'
  })
  .then(res => res.json())
  .then(data => {
    alert('Data berhasil dihapus')

    // reload biar update
    location.reload()
  })
  .catch(err => console.error(err))
}

function edit(id) {
  // ambil data tamu dulu dari server
  fetch(`http://localhost:3000/tamu/${id}`)
    .then(res => res.json())
    .then(tamu => {
      // isi prompt untuk edit
      const nama = prompt("Nama:", tamu.nama)
      const keperluan = prompt("Keperluan:", tamu.keperluan)
      const no_hp = prompt("No HP:", tamu.no_hp)

      if (nama && keperluan && no_hp) {
        // kirim update ke server
        fetch(`http://localhost:3000/tamu/edit/${id}`, {
          method: 'PUT',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama, keperluan, no_hp })
        })
        .then(res => res.json())
        .then(data => {
          alert("Data berhasil diperbarui")
          location.reload()
        })
        .catch(err => console.error(err))
      }
    })
    .catch(err => console.error(err))
}