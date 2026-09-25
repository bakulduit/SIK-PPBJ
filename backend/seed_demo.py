"""Seed contoh data awal: anggaran bulanan per unit kerja + beberapa dokumen realisasi
sehingga Dashboard & Rekap Anggaran langsung terisi. Idempoten (aman dijalankan berulang)."""
import asyncio
import os
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).parent / ".env")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

NOW = datetime.now(timezone.utc)
PERIOD = f"{NOW.year}-{NOW.month:02d}"       # YYYY-MM bulan berjalan
DATE = f"{PERIOD}-15"

UNITS = [
    {"unit": "Teknik Sipil", "pagu": 150_000_000},
    {"unit": "Tata Niaga", "pagu": 90_000_000},
    {"unit": "Umum & Rumah Tangga", "pagu": 120_000_000},
    {"unit": "Administrasi & Keuangan", "pagu": 75_000_000},
]

# Dokumen realisasi contoh (status posted/approved) agar recap punya realisasi & dashboard terisi
SAMPLE_DOCS = [
    {"doc_type": "PPBJ", "unit": "Teknik Sipil", "supplier": "CV Bumi Konstruksi",
     "kegiatan": "Pengadaan material praktikum konstruksi", "total": 45_000_000, "status": "approved"},
    {"doc_type": "PP", "unit": "Teknik Sipil", "supplier": "PT Baja Sentosa",
     "kegiatan": "Pembayaran besi & semen", "total": 32_000_000, "status": "posted"},
    {"doc_type": "PPBJ", "unit": "Tata Niaga", "supplier": "Toko Sinar Jaya",
     "kegiatan": "Pengadaan ATK & perlengkapan kantor", "total": 18_500_000, "status": "posted"},
    {"doc_type": "PUM", "unit": "Umum & Rumah Tangga", "supplier": "-",
     "kegiatan": "Uang muka perjalanan dinas", "total": 12_000_000, "status": "approved"},
    {"doc_type": "PP", "unit": "Umum & Rumah Tangga", "supplier": "PLN & Telkom",
     "kegiatan": "Pembayaran listrik & internet", "total": 9_800_000, "status": "posted"},
    {"doc_type": "PTUM", "unit": "Administrasi & Keuangan", "supplier": "-",
     "kegiatan": "Pertanggungjawaban uang muka rapat", "total": 6_500_000, "status": "posted"},
]


async def main():
    marker = await db.app_meta.find_one({"key": "demo_seed"})
    if marker:
        print("Demo data sudah pernah di-seed. Lewati.")
        return

    # 1) Anggaran bulanan per unit kerja
    for u in UNITS:
        exists = await db.budgets.find_one({"unit_kerja": u["unit"], "period": PERIOD})
        if not exists:
            await db.budgets.insert_one({
                "id": str(uuid.uuid4()), "unit_kerja": u["unit"], "period": PERIOD,
                "amount": u["pagu"], "catatan": "Pagu anggaran contoh (data awal)",
                "created_at": NOW.isoformat(),
            })
    print(f"Anggaran {len(UNITS)} unit untuk periode {PERIOD} tersimpan.")

    # 2) Dokumen realisasi contoh
    counters = {}
    for s in SAMPLE_DOCS:
        counters[s["doc_type"]] = counters.get(s["doc_type"], 0) + 1
        seq = await db.documents.count_documents({"doc_type": s["doc_type"]}) + 1
        month = f"{NOW.month:02d}"
        no = f"{seq:03d}/{s['doc_type']}-BJM/{month}/{NOW.year}"
        approvals = [
            {"role_label": "Diajukan Oleh (User)", "name": "Pemohon", "status": "approved", "note": "", "at": NOW.isoformat()},
            {"role_label": "Disetujui (Direktur)", "name": "Direktur", "status": "approved", "note": "", "at": NOW.isoformat()},
        ]
        doc = {
            "id": str(uuid.uuid4()), "no": no, "doc_type": s["doc_type"],
            "entitas": "POLITEKNIK HASNUR", "unit_kerja": s["unit"], "kegiatan": s["kegiatan"],
            "lokasi": "Banjarmasin", "anggaran_status": "Dianggarkan", "tanggal": DATE,
            "supplier": s["supplier"], "keterangan": s["kegiatan"], "items": [],
            "total": s["total"], "dpp": s["total"], "ppn_enabled": False,
            "payment_account": "1-10002", "advance_account": "1-10200",
            "status": s["status"], "approvals": approvals,
            "created_by": {"id": "seed", "email": "seed@system", "name": "Seed Demo", "role": "admin"},
            "created_at": NOW.isoformat(), "journal_generated": False,
        }
        await db.documents.insert_one(doc)
    print(f"{len(SAMPLE_DOCS)} dokumen realisasi contoh tersimpan.")

    await db.app_meta.insert_one({"key": "demo_seed", "at": NOW.isoformat()})
    print("Selesai seed data awal.")


if __name__ == "__main__":
    asyncio.run(main())
