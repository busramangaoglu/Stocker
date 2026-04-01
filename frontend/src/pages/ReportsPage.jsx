import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import {
  getGlobalCriticalThreshold,
  isBelowGlobalCritical,
  setGlobalCriticalThreshold,
} from '../lib/globalCriticalThreshold.js';

export default function ReportsPage() {
  const [thresholdInput, setThresholdInput] = useState(() => String(getGlobalCriticalThreshold()));
  const [globalThreshold, setGlobalThreshold] = useState(() => getGlobalCriticalThreshold());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const belowGlobal = useMemo(
    () => products.filter((p) => isBelowGlobalCritical(p.stock_quantity, globalThreshold)),
    [products, globalThreshold],
  );

  async function loadProducts() {
    setErr('');
    setLoading(true);
    try {
      const list = await api.getProducts();
      setProducts(list || []);
    } catch (e) {
      setErr(e.message || 'Hata');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const sync = () => {
      const t = getGlobalCriticalThreshold();
      setThresholdInput(String(t));
      setGlobalThreshold(t);
    };
    window.addEventListener('stoker-critical-threshold-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('stoker-critical-threshold-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  function saveThreshold() {
    const v = setGlobalCriticalThreshold(thresholdInput);
    setThresholdInput(String(v));
    setGlobalThreshold(v);
  }

  return (
    <div>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Kritik eşik</div>
          <p className="pageLead">
            Bu sayfadaki <strong>global eşik</strong> tarayıcıda saklanır; tüm ürünlerde aynıdır. Stok bu değerin altına veya
            eşitine düştüğünde ürün kartları ve bu sayfadaki uyarılar kırmızı gösterilir.
          </p>
        </div>
      </div>

      <section className="card" style={{ padding: 16, marginTop: 14 }}>
        <div className="sectionTitle">Global kritik eşik</div>
        <div className="muted" style={{ marginTop: 6, fontSize: 13, lineHeight: 1.4 }}>
          Stok bu değerin altına veya eşitine düştüğünde ürünler sayfasında ve burada uyarı gösterilir. Tek bir eşik tüm ürünler
          için geçerlidir.
        </div>
        <div className="formRow formRow--end" style={{ marginTop: 14 }}>
          <div>
            <div className="label">Kritik eşik (tüm ürünler)</div>
            <input
              className="input"
              type="number"
              min={0}
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              style={{ maxWidth: 200 }}
            />
          </div>
          <button type="button" className="btn btnPrimary" onClick={saveThreshold}>
            Kaydet
          </button>
        </div>
      </section>

      {loading ? (
        <div className="card muted" style={{ padding: 14, marginTop: 14 }}>
          Ürünler yükleniyor…
        </div>
      ) : null}

      {err ? (
        <div className="card" style={{ padding: 14, marginTop: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Hata</div>
          <div className="muted">{err}</div>
        </div>
      ) : null}

      {!loading && !err && belowGlobal.length > 0 ? (
        <div className="alert alert--danger" role="alert" style={{ marginTop: 14 }}>
          <div className="alert__title">Uyarı: kritik stok</div>
          <div className="alert__body">
            {belowGlobal.length} ürünün stoğu global eşik ({globalThreshold}) altında veya eşit:{' '}
            {belowGlobal
              .map((p) => p.name)
              .slice(0, 12)
              .join(', ')}
            {belowGlobal.length > 12 ? ` … (+${belowGlobal.length - 12})` : ''}
          </div>
        </div>
      ) : null}
    </div>
  );
}
