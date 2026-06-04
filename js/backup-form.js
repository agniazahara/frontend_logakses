const form = document.getElementById('formTamu')

form.addEventListener('submit', function(e) {
  e.preventDefault()

  const nama = document.getElementById('nama').value
  const keperluan = document.getElementById('keperluan').value
  const no_hp = document.getElementById('no_hp').value

  fetch('http://localhost:3000/tamu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nama,
      keperluan,
      no_hp
    })
  })
  .then(res => res.json())
  .then(data => {
    alert('Data berhasil disimpan!')

    // pindah ke dashboard
    window.location.href = 'dashboard.html'
  })
  .catch(err => console.error(err))
})