const express = require('express');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const API_URL = "https://api-sscasn.bkn.go.id/2024/portal/spf";

// Header permintaan
const headers = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
    "Referer": "https://sscasn.bkn.go.id",
    "Origin": "https://sscasn.bkn.go.id"
};

// Fungsi untuk mengambil data API dengan paginasi
async function fetchAllData(params) {
    let allData = [];
    let offset = 0;

    // Dynamically import fetch
    const { default: fetch } = await import('node-fetch');

    do {
        params.offset = offset;
        const query = new URLSearchParams(params).toString();
        try {
            const response = await fetch(`${API_URL}?${query}`, { headers });
            if (response.ok) {
                const result = await response.json();
                if (result && result.data && result.data.data) {
                    allData = allData.concat(result.data.data);
                    if (allData.length < result.data.meta.total) {
                        offset += 10;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            } else {
                console.error('API Error:', response.status);
                break;
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            break;
        }
    } while (true);

    return allData;
}

// Endpoint untuk proses scrapping
app.post('/scrap', async (req, res) => {
    const { kode_ref_pend } = req.body;
    if (!kode_ref_pend) return res.status(400).send("Kode referensi pendidikan diperlukan.");

    const params = {
        kode_ref_pend,
        pengadaan_kd: "2",
        offset: 0 // menggunakan angka, bukan string
    };

    try {
        const data = await fetchAllData(params);
        if (data.length > 0) {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data");
            const filePath = `data_spf_${kode_ref_pend}.xlsx`;
            XLSX.writeFile(wb, filePath);

            res.download(filePath, (err) => {
                if (err) {
                    console.error("Download Error:", err);
                }
                fs.unlinkSync(filePath); // Hapus file setelah diunduh
            });
        } else {
            res.status(404).send("Data tidak ditemukan.");
        }
    } catch (error) {
        console.error("Scraping Error:", error);
        res.status(500).send("Terjadi kesalahan dalam proses scraping.");
    }
});

app.listen(3000, '0.0.0.0', () => {
    console.log("Server berjalan di http://0.0.0.0:3000");
});

const path = require('path');

// Menyajikan file statis seperti index.html
app.use(express.static(path.join(__dirname, 'public')));

// Atau rute khusus untuk index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


