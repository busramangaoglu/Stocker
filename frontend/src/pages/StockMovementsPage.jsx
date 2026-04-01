import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

function MovementBadge({ type }) {
  const isIn = type === 'IN';
  return (
    <span className={`movementPill movementPill--${isIn ? 'in' : 'out'}`}>
      <span className="movementPill__arrow" aria-hidden>
        {isIn ? '↑' : '↓'}
      </span>
      {isIn ? 'Giriş' : 'Çıkış'}
    </span>
  );
}

function Avatar({ name }) {
  const letters = (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  return (
    <div className="avatarWrap" style={{ borderColor: 'rgba(15,23,42,.12)' }}>
      <div className="avatarLetters">{letters || '?'}</div>
    </div>
  );
}

export default function StockMovementsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [limit, setLimit] = useState(50);
  const [movements, setMovements] = useState([]);

  async function refresh() {
    setErr('');
    setLoading(true);
    try {
      const res = await api.listMovements({ limit, skip: 0 });
      setMovements(res || []);
    } catch (e) {
      setErr(e.message || 'Hata');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return (
    <div>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Stok hareketleri</div>
          <p className="pageLead">
            Stoka giriş / stoktan çıkış sırasında yazdığınız açıklamalar burada ürün satırında görünür. Girişler yeşil (↑),
            çıkışlar kırmızı (↓).
          </p>
        </div>
        <div className="pageHeaderRight">
          <div className="label" style={{ marginBottom: 0 }}>
            Listeleme adedi
          </div>
          <select className="input" style={{ width: 120 }} value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            {[20, 50, 100, 200].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="card" style={{ padding: 16, marginTop: 14 }}>
        <div className="sectionTitle">Son hareketler (tüm ürünler)</div>
        {loading ? <div className="muted" style={{ marginTop: 10 }}>Yükleniyor...</div> : null}
        {err ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Hata</div>
            <div className="muted">{err}</div>
          </div>
        ) : null}
        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Ürün</th>
              <th>Hareket</th>
              <th>Miktar</th>
              <th>Açıklama</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={m.product_name} />
                    <div style={{ fontWeight: 900 }}>{m.product_name}</div>
                  </div>
                </td>
                <td>
                  <MovementBadge type={m.movement_type} />
                </td>
                <td style={{ fontWeight: 900 }}>{m.quantity}</td>
                <td className="movementDescCell">
                  {(m.description || '').trim() ? (
                    <span className="movementDescText">{m.description.trim()}</span>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td className="muted">{new Date(m.created_at).toLocaleString('tr-TR')}</td>
              </tr>
            ))}
            {!loading && movements.length === 0 ? (
              <tr>
                <td colSpan="5" className="muted">
                  Kayıt yok
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
