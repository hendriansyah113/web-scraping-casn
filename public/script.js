document.getElementById('scrapeForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const jurusan = document.getElementById('jurusan').value;

    // Tampilkan animasi loading
    const loadingElement = document.getElementById('loading');
    loadingElement.classList.remove('d-none');

    try {
        const response = await fetch(`/scrape?jurusan=${jurusan}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Buat elemen download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data_casn.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();

            alert('Data berhasil diunduh!');
        } else {
            alert('Terjadi kesalahan saat mengambil data.');
        }
    } catch (error) {
        console.error(error);
        alert('Gagal menghubungi server.');
    } finally {
        // Sembunyikan animasi loading
        loadingElement.classList.add('d-none');
    }
});
