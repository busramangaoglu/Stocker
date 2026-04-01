import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import './DashboardPage.css';
import {
  getGlobalCriticalThreshold,
  isBelowGlobalCritical,
} from '../lib/globalCriticalThreshold.js';

function CircleLetters({ name }) {
  const letters = (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  return <div className="avatarLetters">{letters || '?'}</div>;
}

function Avatar({ name, critical }) {
  return (
    <div className={`avatarWrap ${critical ? 'avatarWrap--critical' : ''}`}>
      <CircleLetters name={name} />
    </div>
  );
}

/** Kritik oranı — SVG yerine conic-gradient (tarayıcıda güvenilir) */
function CriticalRing({ critical, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((critical / total) * 100)) : 0;
  const angle = (pct / 100) * 360;

  // Basit ve “her yüzde doğru dolduruyor” yaklaşımı:
  // - pct kadar arc: warning->danger gradient
  // - kalan arc: gri
  const background =
    pct <= 0
      ? 'conic-gradient(from -90deg, #e2e8f0 0deg 360deg)'
      : `conic-gradient(from -90deg, #f59e0b 0deg, #e11d48 ${angle}deg, #e2e8f0 ${angle}deg 360deg)`;
  return (
    <div className="dashStatRing">
      <div className="dashRingDonut" style={{ background }} aria-hidden />
      <div>
        <div className="dashStatRingLabel">Kritik payı</div>
        <div className="dashStatRingValue">{pct}%</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
          {critical} / {total} ürün
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('all');
  const [globalThreshold, setGlobalThreshold] = useState(() => getGlobalCriticalThreshold());
  const [chartMovements, setChartMovements] = useState([]);
  const [chartMovementsLoading, setChartMovementsLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr('');
        setLoading(true);
        const [res, list] = await Promise.all([api.reportDashboard(), api.getProducts()]);
        if (!alive) return;
        setData(res);
        setProducts(list || []);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || 'Hata oluştu');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const sync = () => setGlobalThreshold(getGlobalCriticalThreshold());
    window.addEventListener('stoker-critical-threshold-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('stoker-critical-threshold-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const summary = data?.summary || {};
  const recent = data?.recent_movements || [];

  useEffect(() => {
    if (!data) return;
    const recentM = data.recent_movements || [];
    if (selectedProductId === 'all') {
      setChartMovements(recentM);
      setChartMovementsLoading(false);
      return;
    }
    let alive = true;
    setChartMovementsLoading(true);
    (async () => {
      try {
        const list = await api.listMovementsByProduct(selectedProductId, { limit: 500, skip: 0 });
        if (!alive) return;
        setChartMovements(Array.isArray(list) ? list : []);
      } catch {
        if (!alive) return;
        setChartMovements([]);
      } finally {
        if (alive) setChartMovementsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [data, selectedProductId]);

  const globalCriticalCount = useMemo(() => {
    return (products || []).filter((p) => isBelowGlobalCritical(p.stock_quantity, globalThreshold)).length;
  }, [products, globalThreshold]);

  // Tek ürün seçildiğinde son N “recent” yerine o ürünün hareket endpoint’inden tam liste kullanılır.
  const movementsForChart = selectedProductId === 'all' ? recent : chartMovements;

  // Grafik: seçili ürüne göre hareketlerden ürün bazında toplam IN/OUT çıkar.
  const netBars = useMemo(() => {
    const map = new Map();
    for (const m of movementsForChart || []) {
      const key = String(m.product_id || m.product_name || '');
      if (!key) continue;

      const qty = Number(m.quantity || 0);
      const type = m.movement_type === 'IN' ? 'IN' : 'OUT';

      const cur = map.get(key) || {
        key,
        product_name: m.product_name || 'Ürün',
        inQty: 0,
        outQty: 0,
      };

      if (type === 'IN') cur.inQty += qty;
      else cur.outQty += qty;

      map.set(key, cur);
    }

    const arr = Array.from(map.values());
    arr.sort((a, b) => (b.inQty + b.outQty) - (a.inQty + a.outQty));
    return arr;
  }, [movementsForChart]);

  const maxAbs = useMemo(() => {
    return Math.max(1, ...netBars.map((b) => Math.max(b.inQty, b.outQty)));
  }, [netBars]);

  if (loading) {
    return (
      <div className="card" style={{ padding: 18 }}>
        Yükleniyor...
      </div>
    );
  }

  if (err) {
    return (
      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Hata</div>
        <div className="muted">{err}</div>
      </div>
    );
  }

  const productCount = summary.product_count ?? 0;

  return (
    <div className="stack">
      <div>
        <div className="dashPageTitle">Özet</div>
        <p className="pageLead">
          Özet ve grafikler. Ayrıntılı hareket listesi için <strong>Stok hareketleri</strong> sayfasını kullanın.
        </p>
      </div>

      <div className="grid statsGrid">
        <div className="card statCard">
          <div className="statLabel">Ürün sayısı</div>
          <div className="statValue">{productCount}</div>
        </div>
        <div className="card statCard">
          <div className="statLabel">Kritik (global ≤ {globalThreshold})</div>
          <div className="statValue">{globalCriticalCount}</div>
          <CriticalRing critical={globalCriticalCount} total={productCount} />
        </div>
        <div className="card statCard">
          <div className="statLabel">Toplam stok</div>
          <div className="statValue">{summary.total_stock ?? 0}</div>
        </div>
      </div>

      <section className="card" style={{ padding: 16, marginTop: 14 }}>
        <div className="dashSectionHeader">
          <div>
            <div className="sectionTitle">Stok hareketleri (giriş / çıkış)</div>
            <p className="pageLead" style={{ marginTop: 4 }}>
              Yeşil: giriş, kırmızı: çıkış. &quot;Tüm ürünler&quot; seçiliyken özet rapordaki son hareketler; tek ürün seçildiğinde
              o ürünün tam hareket geçmişi kullanılır.
              {chartMovementsLoading && selectedProductId !== 'all' ? ' Yükleniyor…' : ''}
            </p>
          </div>

          <div className="dashSectionControls">
            <div className="label" style={{ marginBottom: 6 }}>
              Ürün
            </div>
            <select
              className="input dashProductSelect"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              aria-label="Ürün seçimi"
            >
              <option value="all">Tüm ürünler</option>
              {(products || []).map((p) => (
                <option key={p._id} value={String(p._id)}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="dashChartLegend">
          <div className="dashLegendItem">
            <span className="dashLegendDot dashLegendDot--in" />
            Giriş
          </div>
          <div className="dashLegendItem">
            <span className="dashLegendDot dashLegendDot--out" />
            Çıkış
          </div>
        </div>

        {netBars.length === 0 ? (
          <div className="muted" style={{ marginTop: 12 }}>
            Kayıt yok
          </div>
        ) : (
          <div className="dashNetChart">
            <div className="dashNetBars">
              {netBars.map((b) => {
                const inPct = b.inQty > 0 ? Math.max(3, Math.round((b.inQty / maxAbs) * 100)) : 0;
                const outPct = b.outQty > 0 ? Math.max(3, Math.round((b.outQty / maxAbs) * 100)) : 0;
                const inTitle = b.inQty > 0 ? `Giriş: ${b.inQty}` : '';
                const outTitle = b.outQty > 0 ? `Çıkış: ${b.outQty}` : '';

                return (
                  <div key={b.key} className="dashNetBarItem dashNetRow">
                    <div className="dashNetRowName">{b.product_name}</div>

                    <div className="dashNetLineItem dashNetLineItem--in" title={inTitle || undefined}>
                      <div className="dashNetLineValue dashNetLineValue--in">{b.inQty}</div>
                      <div className="dashNetLineTrack" aria-hidden>
                        {b.inQty > 0 ? (
                          <div className="dashNetLineFill dashNetLineFill--in" style={{ width: `${inPct}%` }} />
                        ) : null}
                      </div>
                    </div>

                    <div className="dashNetLineItem dashNetLineItem--out" title={outTitle || undefined}>
                      <div className="dashNetLineValue dashNetLineValue--out">{b.outQty}</div>
                      <div className="dashNetLineTrack" aria-hidden>
                        {b.outQty > 0 ? (
                          <div className="dashNetLineFill dashNetLineFill--out" style={{ width: `${outPct}%` }} />
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
