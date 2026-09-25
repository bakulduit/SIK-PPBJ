"""End-to-end backend tests for SIK-PPBJ per review request iteration_5.
Covers: auth (superadmin + demo users), documents (PPBJ/PUM/PP/PTUM), approval flow,
generate-journal (PP with PPN + PPh23), journals, dashboard, budgets, accounts,
tax settings, and RBAC.
"""
import os
import pytest
import requests
from datetime import datetime

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://procurement-launch.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

SUPER = {"email": "nashoharizal@gmail.com", "password": "SIKPPBJ2026"}
DEMO = {
    "admin":    {"email": "admin@sbb.co.id",     "password": "admin123"},
    "keuangan": {"email": "keuangan@sbb.co.id",  "password": "keuangan123"},
    "approver": {"email": "approver@sbb.co.id",  "password": "approver123"},
    "user":     {"email": "pemohon@sbb.co.id",   "password": "pemohon123"},
}


def _login(session: requests.Session, creds) -> dict:
    r = session.post(f"{API}/auth/login", json=creds, timeout=15)
    assert r.status_code == 200, f"login failed for {creds['email']}: {r.status_code} {r.text}"
    return r.json()


@pytest.fixture(scope="module")
def super_client():
    s = requests.Session()
    _login(s, SUPER)
    return s


@pytest.fixture(scope="module")
def keu_client():
    s = requests.Session()
    _login(s, DEMO["keuangan"])
    return s


@pytest.fixture(scope="module")
def user_client():
    s = requests.Session()
    _login(s, DEMO["user"])
    return s


@pytest.fixture(scope="module")
def approver_client():
    s = requests.Session()
    _login(s, DEMO["approver"])
    return s


# -------------------- AUTH --------------------
class TestAuth:
    def test_superadmin_login_and_me(self):
        s = requests.Session()
        me_body = _login(s, SUPER)
        assert me_body["email"] == SUPER["email"]
        assert me_body["role"] == "superadmin"
        # verify /me returns the same user via cookie
        r = s.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == SUPER["email"]
        assert r.json()["role"] == "superadmin"

    @pytest.mark.parametrize("role,creds", list(DEMO.items()))
    def test_demo_users_login(self, role, creds):
        s = requests.Session()
        body = _login(s, creds)
        assert body["email"] == creds["email"]
        assert body["role"] == role

    def test_wrong_password_401(self):
        r = requests.post(f"{API}/auth/login", json={"email": SUPER["email"], "password": "WRONG"}, timeout=15)
        assert r.status_code in (401, 429)


# -------------------- MASTERS --------------------
class TestMasters:
    def test_accounts_list(self, super_client):
        r = super_client.get(f"{API}/accounts", timeout=15)
        assert r.status_code == 200
        accs = r.json()
        assert isinstance(accs, list)
        assert len(accs) >= 25, f"expected ~29 accounts, got {len(accs)}"

    def test_tax_settings_default(self, super_client):
        r = super_client.get(f"{API}/tax-settings", timeout=15)
        assert r.status_code == 200
        ts = r.json()
        assert ts.get("ppn_rate") == 11
        codes = {t["code"] for t in ts.get("taxes", [])}
        # ensure common PPh codes present
        assert "PPH23_JASA" in codes or any("PPH23" in c for c in codes)

    def test_accounts_crud_keuangan(self, keu_client):
        code = f"9-{datetime.utcnow().strftime('%H%M%S')}"
        body = {"code": code, "name": "TEST_Akun", "category": "Beban", "type": "", "normal": "debit"}
        r = keu_client.post(f"{API}/accounts", json=body, timeout=15)
        assert r.status_code == 200
        acc_id = r.json()["id"]
        # cleanup
        d = keu_client.delete(f"{API}/accounts/{acc_id}", timeout=15)
        assert d.status_code == 200


# -------------------- RBAC --------------------
class TestRBAC:
    def test_user_cannot_list_users(self, user_client):
        r = user_client.get(f"{API}/users", timeout=15)
        assert r.status_code == 403

    def test_super_can_list_users(self, super_client):
        r = super_client.get(f"{API}/users", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_user_cannot_generate_journal(self, user_client):
        # even for random id
        r = user_client.post(f"{API}/documents/fake-id/generate-journal", timeout=15)
        assert r.status_code == 403


# -------------------- DASHBOARD --------------------
class TestDashboard:
    def test_dashboard_summary_structure(self, super_client):
        r = super_client.get(f"{API}/dashboard/summary", timeout=15)
        assert r.status_code == 200
        s = r.json()
        for k in ("by_type", "pending", "approved", "posted", "journals", "recent", "total_nilai"):
            assert k in s
        for t in ("PPBJ", "PUM", "PP", "PTUM"):
            assert t in s["by_type"]
        # seeded demo: at least 6 documents & positive total
        total_docs = sum(s["by_type"].values())
        assert total_docs >= 6, f"expected >=6 docs from seed_demo, got {total_docs}"
        assert s["total_nilai"] >= 100_000_000


# -------------------- BUDGETS --------------------
class TestBudgets:
    def test_budget_units_list(self, super_client):
        r = super_client.get(f"{API}/budget-units", timeout=15)
        assert r.status_code == 200
        units = r.json()
        assert isinstance(units, list)
        # from seed there should be 4 units
        for expected in ("Teknik Sipil", "Tata Niaga", "Umum & Rumah Tangga", "Administrasi & Keuangan"):
            assert expected in units, f"missing seeded unit: {expected}"

    def test_budget_recap_seed_period(self, super_client):
        # seed_demo uses current server month; check both requested (2026-09) and current
        r = super_client.get(f"{API}/budgets", params={"period": "2026-09"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["period"] == "2026-09"
        assert data["total_pagu"] >= 435_000_000, f"expected total_pagu >=435M, got {data['total_pagu']}"
        assert data["total_realisasi"] > 0
        assert len(data["rows"]) >= 4

    def test_create_and_delete_budget_keuangan(self, keu_client):
        unit = f"TEST_Unit_{datetime.utcnow().strftime('%H%M%S')}"
        body = {"unit_kerja": unit, "period": "2026-12", "amount": 1000000, "catatan": "TEST"}
        r = keu_client.post(f"{API}/budgets", json=body, timeout=15)
        assert r.status_code == 200
        bid = r.json()["id"]
        # verify via GET
        g = keu_client.get(f"{API}/budgets", params={"period": "2026-12"}, timeout=15)
        assert g.status_code == 200
        rows = g.json()["rows"]
        assert any(row.get("id") == bid for row in rows)
        # cleanup
        d = keu_client.delete(f"{API}/budgets/{bid}", timeout=15)
        assert d.status_code == 200


# -------------------- DOCUMENTS + APPROVAL + JOURNAL --------------------
_created_docs = []


class TestDocumentFlow:
    def test_create_ppbj(self, user_client):
        body = {
            "doc_type": "PPBJ",
            "unit_kerja": "TEST_Sipil",
            "kegiatan": "TEST_Pengadaan alat",
            "supplier": "CV TEST",
            "keterangan": "TEST_PPBJ",
            "tanggal": "2026-09-20",
            "items": [
                {"uraian": "Alat A", "kuantitas": 2, "satuan": "unit", "harga_estimasi": 500000, "total": 1000000},
                {"uraian": "Alat B", "kuantitas": 1, "satuan": "unit", "harga_estimasi": 250000, "total": 250000},
            ],
        }
        r = user_client.post(f"{API}/documents", json=body, timeout=15)
        assert r.status_code == 200, r.text
        doc = r.json()
        assert doc["status"] == "pending_approval"
        assert doc["total"] == 1250000
        # doc number format NNN/PPBJ-BJM/MM/YYYY
        import re
        assert re.match(r"^\d{3}/PPBJ-BJM/\d{2}/\d{4}$", doc["no"]), f"bad no: {doc['no']}"
        assert len(doc["approvals"]) >= 2
        _created_docs.append(("PPBJ", doc["id"]))

    def test_create_pum_pp_ptum(self, user_client):
        for dtype in ("PUM", "PP", "PTUM"):
            body = {
                "doc_type": dtype,
                "unit_kerja": "TEST_Sipil",
                "kegiatan": f"TEST_{dtype}",
                "supplier": "PT TEST",
                "keterangan": f"TEST_{dtype}",
                "tanggal": "2026-09-20",
                "total": 1000000,
                "dpp": 1000000,
                "ppn_enabled": (dtype == "PP"),
                "pph_code": "PPH23_JASA" if dtype == "PP" else None,
                "expense_account": "6-10009",
                "uang_muka_amount": 1000000 if dtype == "PTUM" else 0,
            }
            r = user_client.post(f"{API}/documents", json=body, timeout=15)
            assert r.status_code == 200, f"{dtype}: {r.text}"
            doc = r.json()
            assert doc["doc_type"] == dtype
            assert doc["status"] == "pending_approval"
            _created_docs.append((dtype, doc["id"]))

    def test_approve_ppbj_full_flow(self, super_client):
        pp_id = next(did for dt, did in _created_docs if dt == "PPBJ")
        # get to know approval steps count
        r = super_client.get(f"{API}/documents/{pp_id}", timeout=15)
        assert r.status_code == 200
        steps = len(r.json()["approvals"])
        for i in range(steps):
            ap = super_client.post(f"{API}/documents/{pp_id}/approve",
                                   json={"step_index": i, "action": "approve", "note": "ok"}, timeout=15)
            assert ap.status_code == 200
        final = super_client.get(f"{API}/documents/{pp_id}", timeout=15).json()
        assert final["status"] == "approved"

    def test_approve_pp_and_generate_journal_with_taxes(self, super_client, keu_client):
        pp_id = next(did for dt, did in _created_docs if dt == "PP")
        d = super_client.get(f"{API}/documents/{pp_id}", timeout=15).json()
        for i in range(len(d["approvals"])):
            r = super_client.post(f"{API}/documents/{pp_id}/approve",
                                  json={"step_index": i, "action": "approve"}, timeout=15)
            assert r.status_code == 200
        # generate journal (keuangan)
        gj = keu_client.post(f"{API}/documents/{pp_id}/generate-journal", timeout=15)
        assert gj.status_code == 200, gj.text
        j = gj.json()
        assert j["balanced"] is True
        assert abs(j["total_debit"] - j["total_kredit"]) < 0.5
        # dpp=1_000_000, ppn 11%=110_000, pph23 jasa 2% = 20_000
        # expected debit = dpp + ppn = 1_110_000; kredit = pph + payable(dpp+ppn-pph) = 20000+1_090_000 = 1_110_000
        assert j["total_debit"] == 1_110_000, f"got {j['total_debit']}"
        # find pph and ppn lines
        codes = [l["account_code"] for l in j["lines"]]
        assert any("ppn" in (l.get("memo") or "").lower() or l["account_code"].startswith("1-1040") for l in j["lines"])
        # doc status = posted
        after = keu_client.get(f"{API}/documents/{pp_id}", timeout=15).json()
        assert after["status"] == "posted"
        assert after["journal_generated"] is True

    def test_generate_journal_rejects_unapproved(self, keu_client):
        # PTUM is still pending_approval
        pt_id = next(did for dt, did in _created_docs if dt == "PTUM")
        r = keu_client.post(f"{API}/documents/{pt_id}/generate-journal", timeout=15)
        assert r.status_code == 400

    def test_reject_flow(self, super_client, user_client):
        # create a throwaway PPBJ and reject it
        body = {"doc_type": "PPBJ", "unit_kerja": "TEST_Sipil", "kegiatan": "TEST_reject",
                "keterangan": "TEST_reject", "tanggal": "2026-09-20",
                "items": [{"uraian": "X", "kuantitas": 1, "satuan": "ls", "harga_estimasi": 100, "total": 100}]}
        r = user_client.post(f"{API}/documents", json=body, timeout=15)
        assert r.status_code == 200
        did = r.json()["id"]
        _created_docs.append(("PPBJ_R", did))
        rj = super_client.post(f"{API}/documents/{did}/approve",
                               json={"step_index": 0, "action": "reject", "note": "no"}, timeout=15)
        assert rj.status_code == 200
        final = super_client.get(f"{API}/documents/{did}", timeout=15).json()
        assert final["status"] == "rejected"

    def test_journals_list(self, super_client):
        r = super_client.get(f"{API}/journals", timeout=15)
        assert r.status_code == 200
        js = r.json()
        assert isinstance(js, list)
        # our PP journal should be there
        assert len(js) >= 1

    def test_cleanup_created(self, keu_client):
        """cleanup test docs (best-effort)"""
        for _dt, did in _created_docs:
            try:
                keu_client.delete(f"{API}/documents/{did}", timeout=15)
            except Exception:
                pass
