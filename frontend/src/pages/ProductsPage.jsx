import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../lib/api';
import Modal from '../components/Modal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import {
  getGlobalCriticalThreshold,
  isBelowGlobalCritical,
} from '../lib/globalCriticalThreshold.js';
import { productImageFallbackUrl, resolveProductImageUrl } from '../lib/imageUrl.js';
import {
  coercePlainString,
  normalizeCatalogItem,
  normalizeProductRow,
} from '../lib/coerceString.js';

function Avatar({ name, critical }) {
  const letters = (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  return (
    <div className={`avatarWrap ${critical ? 'avatarWrap--critical' : ''}`}>
      <div className="avatarLetters">{letters || '?'}</div>
    </div>
  );
}

function ProductThumb({ name, imageUrl, imageKey, globalCritical }) {
  const [stage, setStage] = useState(0);

  // stage 0: primary (proxy veya yerel), 1: SVG fallback, 2: avatar
  const primary = (imageUrl || '').trim() ? resolveProductImageUrl((imageUrl || '').trim()) : '';
  const fallback = imageKey ? productImageFallbackUrl(imageKey) : '';

  const srcs = [primary, fallback].filter(Boolean);
  const src = srcs[stage] || null;
  const wrapClass = `productThumb ${globalCritical ? 'productThumb--critical' : ''}`;

  useEffect(() => {
    setStage(0);
  }, [imageUrl, imageKey]);

  if (src) {
    return (
      <div className={wrapClass}>
        <img
          src={src}
          alt={name || 'Ürün görseli'}
          className="productThumb__img"
          onError={() => setStage((s) => s + 1)}
        />
      </div>
    );
  }
  return (
    <div className={wrapClass}>
      <Avatar name={name} critical={globalCritical} />
    </div>
  );
}

function ProductCard({ product, globalCritical, onStockIn, onStockOut, onEdit, onDelete }) {
  return (
    <div className={`card productCard ${globalCritical ? 'productCard--critical' : ''}`}>
      <div className="productCard__top">
        <div className="productCard__media">
          <ProductThumb
            name={product.name}
            imageUrl={product.image_display_url ?? product.image_url}
            imageKey={product.image_key}
            globalCritical={globalCritical}
          />
        </div>
        <div className="productCard__info">
          <div className="productCard__titleRow">
            <div className="productName">{product.name}</div>
            <div className="criticalDot" data-critical={globalCritical ? '1' : '0'} />
          </div>
          <div className="productBody">
            <div className="stockLine">
              <span className="productStockLabel">Mevcut stok</span>
              <span className={globalCritical ? 'stockValue danger' : 'stockValue'}>{product.stock_quantity}</span>
            </div>
            <div className="muted productCard__desc">{product.description}</div>
          </div>
        </div>
      </div>

      <div className="productActions">
        <button type="button" className="btn btnStockIn" onClick={() => onStockIn(product)}>
          Stoka giriş
        </button>
        <button type="button" className="btn btnStockOut" onClick={() => onStockOut(product)}>
          Stoktan çıkış
        </button>
        <button type="button" className="btn btnNavy" onClick={() => onEdit(product)}>
          Düzenle
        </button>
        <button type="button" className="btn btnNavy" onClick={() => onDelete(product)}>
          Sil
        </button>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [products, setProducts] = useState([]);
  const [globalThreshold, setGlobalThreshold] = useState(() => getGlobalCriticalThreshold());

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCritical, setShowCritical] = useState(false);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productMode, setProductMode] = useState('create'); // create|edit
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    stock_quantity: 0,
    category: '',
  });
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogErr, setCatalogErr] = useState('');
  const [catalogMenuOpen, setCatalogMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const productNameTriggerRef = useRef(null);
  const productNameMenuRef = useRef(null);

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockMode, setStockMode] = useState('in'); // in|out
  const [stockTarget, setStockTarget] = useState(null);
  const [stockForm, setStockForm] = useState({ quantity: 1, description: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const belowGlobal = useMemo(
    () => products.filter((p) => isBelowGlobalCritical(p.stock_quantity, globalThreshold)),
    [products, globalThreshold],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (showCritical && !isBelowGlobalCritical(p.stock_quantity, globalThreshold)) return false;
      if (!q) return true;
      return (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    });
  }, [products, search, showCritical, globalThreshold, categoryFilter]);

  const availableCatalog = useMemo(() => {
    if (!catalog.length) return [];
    const taken = new Set(products.map((p) => (p.name || '').trim().toLowerCase()));
    return catalog.filter((c) => !taken.has((c.name || '').trim().toLowerCase()));
  }, [catalog, products]);

  const sortedAvailableCatalog = useMemo(() => {
    return [...availableCatalog].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [availableCatalog]);

  /** Katalog seçicide liste boşsa: stok değil, “bu isimde envanter kaydı var mı” kuralı geçerli. */
  const catalogPickerEmptyExplanation = useMemo(() => {
    if (!catalog.length) {
      return 'Katalog listesi boş veya sunucudan gelmedi. Sayfayı yenileyin; sorun sürerse API adresini (VITE_API_BASE_URL) kontrol edin.';
    }
    return 'Katalogdaki tüm ürün adları zaten envanterde kayıtlı. Stok miktarı 0 olsa bile aynı isimle ikinci kayıt açılamaz. Miktar eklemek için listedeki ürün kartından "Stoka giriş" kullanın; kaydı kaldırmak için "Sil".';
  }, [catalog.length]);

  useEffect(() => {
    const sync = () => setGlobalThreshold(getGlobalCriticalThreshold());
    window.addEventListener('stoker-critical-threshold-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('stoker-critical-threshold-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  async function refresh() {
    setLoading(true);
    setErr('');
    try {
      const list = await api.getProducts();
      const arr = Array.isArray(list) ? list : [];
      setProducts(arr.map(normalizeProductRow));
    } catch (e) {
      setErr(e.message || 'Hata');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setCatalogErr('');
        const list = await api.getProductCatalog();
        let raw = Array.isArray(list) ? list : [];
        if (!raw.length && list && typeof list === 'object' && Array.isArray(list.items)) {
          raw = list.items;
        }
        const normalized = raw.map(normalizeCatalogItem).filter(Boolean);
        if (!cancelled) setCatalog(normalized);
      } catch (e) {
        if (!cancelled) setCatalogErr(e.message || 'Katalog yüklenemedi');
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function selectCatalogItem(item) {
    const entry = normalizeCatalogItem(item) || item;
    setProductForm((s) => ({
      ...s,
      name: coercePlainString(entry.name).trim(),
      category: coercePlainString(entry.category).trim(),
      description: typeof entry.description === 'string' ? entry.description : coercePlainString(entry.description),
    }));
  }

  function clearProductSelection() {
    setProductForm((s) => ({
      ...s,
      name: '',
      category: '',
      description: '',
    }));
    setCatalogMenuOpen(false);
  }

  function pickCatalogItem(item) {
    selectCatalogItem(item);
    setCatalogMenuOpen(false);
  }

  function openCreate() {
    setProductMode('create');
    setCatalogMenuOpen(false);
    setProductForm({
      name: '',
      description: '',
      stock_quantity: 0,
      category: '',
    });
    setProductModalOpen(true);
  }

  useEffect(() => {
    if (!productModalOpen) setCatalogMenuOpen(false);
  }, [productModalOpen]);

  useLayoutEffect(() => {
    if (!catalogMenuOpen || !productNameTriggerRef.current) return;
    const r = productNameTriggerRef.current.getBoundingClientRect();
    setMenuPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 240) });
  }, [catalogMenuOpen]);

  useEffect(() => {
    if (!catalogMenuOpen) return;
    function onScrollResize() {
      const el = productNameTriggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 240) });
    }
    window.addEventListener('scroll', onScrollResize, true);
    window.addEventListener('resize', onScrollResize);
    return () => {
      window.removeEventListener('scroll', onScrollResize, true);
      window.removeEventListener('resize', onScrollResize);
    };
  }, [catalogMenuOpen]);

  useEffect(() => {
    if (!catalogMenuOpen) return;
    function onDocMouseDown(e) {
      const t = e.target;
      if (productNameTriggerRef.current?.contains(t)) return;
      if (productNameMenuRef.current?.contains(t)) return;
      setCatalogMenuOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setCatalogMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [catalogMenuOpen]);

  function openEdit(p) {
    setProductMode('edit');
    setProductForm({
      name: coercePlainString(p.name).trim(),
      description: typeof p.description === 'string' ? p.description : coercePlainString(p.description),
      stock_quantity: 0,
      category: coercePlainString(p.category).trim(),
    });
    setStockTarget(p);
    setProductModalOpen(true);
  }

  function openStock(mode, p) {
    setStockMode(mode);
    setStockTarget(p);
    setStockForm({ quantity: 1, description: '' });
    setStockModalOpen(true);
  }

  async function submitProduct() {
    try {
      setErr('');
      if (productMode === 'create') {
        const nameStr = coercePlainString(productForm.name).trim();
        if (!nameStr) {
          setErr('Lütfen listeden bir ürün seçin.');
          return;
        }
        const unitFromCatalog = catalog.find((c) => c.name === nameStr)?.unit || 'adet';
        await api.createProduct({
          name: nameStr,
          description: productForm.description,
          minimum_stock: 0,
          unit: unitFromCatalog,
          stock_quantity: Number(productForm.stock_quantity || 0),
          ...(productForm.category ? { category: productForm.category } : {}),
        });
      } else {
        await api.updateProduct(stockTarget._id, {
          description: productForm.description,
          minimum_stock: 0,
          ...(productForm.category ? { category: productForm.category } : {}),
        });
      }
      setProductModalOpen(false);
      await refresh();
    } catch (e) {
      setErr(e.message || 'Hata');
    }
  }

  async function submitStock() {
    try {
      if (!stockTarget) return;
      const payload = {
        product_id: stockTarget._id,
        quantity: Number(stockForm.quantity),
        description: stockForm.description || '',
      };

      if (stockMode === 'in') await api.stockIn(payload);
      else await api.stockOut(payload);

      setStockModalOpen(false);
      await refresh();
    } catch (e) {
      setErr(e.message || 'Hata');
    }
  }

  function askDelete(p) {
    setDeleteTarget(p);
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
  }

  async function executeDelete() {
    if (!deleteTarget) return;
    try {
      setErr('');
      await api.deleteProduct(deleteTarget._id);
      setDeleteTarget(null);
      await refresh();
    } catch (e) {
      setErr(e.message || 'Hata');
    }
  }

  return (
    <div>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Ürünler</div>
          <p className="pageLead">
            <strong>Global eşik</strong> ({globalThreshold}) tüm ürünler için geçerlidir; tarayıcıda saklanır. Stok bu değerin
            altına veya eşitine düştüğünde kart ve etiketler kırmızı vurgulanır. Eşik değerini <strong>Kritik eşik</strong> sayfasından
            değiştirebilirsiniz. Yeni ürün yalnızca <strong>sabit katalogdan</strong> seçilir; aynı adda daha önce görsel kaydı
            varsa otomatik devralınır.
          </p>
        </div>
        <div className="pageHeaderRight">
          <button className="btn btnPrimary" onClick={openCreate}>
            + Ürün ekle
          </button>
        </div>
      </div>

      <div className="card card--tint" style={{ padding: 14, marginTop: 14 }}>
        <div className="formRow formRow--end">
          <div>
            <div className="label">Ara</div>
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ürün adı veya açıklama…" />
          </div>
          <div>
            <div className="label">Kategori</div>
            <select
              className="input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Kategori filtresi"
            >
              <option value="all">Tümü</option>
              <option value="food">Yiyecek</option>
              <option value="beverage">İçecek</option>
            </select>
          </div>
          <div>
            <div className="label">Filtre</div>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontWeight: 800 }}>
              <input type="checkbox" checked={showCritical} onChange={(e) => setShowCritical(e.target.checked)} />
              Global eşik altı (≤ {globalThreshold})
            </label>
          </div>
        </div>
      </div>

      {!loading && !err && belowGlobal.length > 0 ? (
        <div className="alert alert--tint" role="alert" style={{ marginTop: 14 }}>
          <div className="alert__title">Uyarı: kritik stok</div>
          <div className="alert__body">
            {belowGlobal.length} ürünün stoğu eşik ({globalThreshold}) altında veya eşit:{' '}
            {belowGlobal
              .map((p) => p.name)
              .slice(0, 12)
              .join(', ')}
            {belowGlobal.length > 12 ? ` … (+${belowGlobal.length - 12})` : ''}
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="card" style={{ padding: 18, marginTop: 14 }}>
          Yükleniyor...
        </div>
      ) : err ? (
        <div className="card" style={{ padding: 18, marginTop: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Hata</div>
          <div className="muted">{typeof err === 'string' ? err : coercePlainString(err) || 'Hata'}</div>
        </div>
      ) : (
        <div className="grid productsGrid" style={{ marginTop: 14 }}>
          {filtered.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              globalCritical={isBelowGlobalCritical(p.stock_quantity, globalThreshold)}
              onStockIn={(prod) => openStock('in', prod)}
              onStockOut={(prod) => openStock('out', prod)}
              onEdit={openEdit}
              onDelete={askDelete}
            />
          ))}
          {filtered.length === 0 ? (
            <div className="card" style={{ padding: 16 }}>
              Kayıt yok
            </div>
          ) : null}
        </div>
      )}

      <Modal
        title={productMode === 'create' ? 'Yeni ürün' : 'Ürünü düzenle'}
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        footer={
          <>
            <button className="btn btnGhost" onClick={() => setProductModalOpen(false)}>
              İptal
            </button>
            <button
              className="btn btnPrimary"
              onClick={submitProduct}
              disabled={
                productMode === 'create' &&
                (catalogLoading ||
                  Boolean(catalogErr) ||
                  (!catalogLoading && availableCatalog.length === 0) ||
                  !coercePlainString(productForm.name).trim())
              }
            >
              Kaydet
            </button>
          </>
        }
      >
        <div className="grid" style={{ gap: 12 }}>
          {productMode === 'create' ? (
            <>
              <div className="productNameField">
                <div className="label">Ürün adı</div>
                {catalogLoading ? <div className="muted">Katalog yükleniyor…</div> : null}
                {catalogErr ? (
                  <div className="alert alert--danger" role="alert" style={{ marginTop: 8 }}>
                    {catalogErr}
                  </div>
                ) : null}
                {!catalogLoading && !catalogErr ? (
                  <>
                    <button
                      type="button"
                      ref={productNameTriggerRef}
                      className="input productNameField__trigger"
                      aria-haspopup="listbox"
                      aria-expanded={catalogMenuOpen}
                      id="product-name-trigger"
                      onClick={(e) => {
                        e.preventDefault();
                        setCatalogMenuOpen((o) => !o);
                      }}
                    >
                      <span
                        className={
                          coercePlainString(productForm.name).trim()
                            ? 'productNameField__value'
                            : 'productNameField__placeholder'
                        }
                      >
                        {coercePlainString(productForm.name).trim() || 'Ürün seçin…'}
                      </span>
                      <span className="productNameField__chevron" aria-hidden>
                        ▾
                      </span>
                    </button>
                    {catalogMenuOpen &&
                      !catalogLoading &&
                      !catalogErr &&
                      createPortal(
                        <div
                          ref={productNameMenuRef}
                          className="productNameMenu"
                          style={{
                            position: 'fixed',
                            top: menuPos.top,
                            left: menuPos.left,
                            width: menuPos.width,
                            zIndex: 200,
                          }}
                          role="listbox"
                          aria-labelledby="product-name-trigger"
                        >
                          <button
                            type="button"
                            className={`productNameMenu__item${!coercePlainString(productForm.name).trim() ? ' productNameMenu__item--active' : ''}`}
                            role="option"
                            aria-selected={!coercePlainString(productForm.name).trim()}
                            onClick={() => clearProductSelection()}
                          >
                            <span className="productNameMenu__check" aria-hidden>
                              {!coercePlainString(productForm.name).trim() ? '✓' : ''}
                            </span>
                            Ürün seçilmedi
                          </button>
                          {sortedAvailableCatalog.length === 0 ? (
                            <div className="productNameMenu__empty">{catalogPickerEmptyExplanation}</div>
                          ) : (
                            sortedAvailableCatalog.map((item) => {
                              const selected = coercePlainString(productForm.name).trim() === item.name;
                              return (
                                <button
                                  key={item.name}
                                  type="button"
                                  className={`productNameMenu__item${selected ? ' productNameMenu__item--active' : ''}`}
                                  role="option"
                                  aria-selected={selected}
                                  onClick={() => pickCatalogItem(item)}
                                >
                                  <span className="productNameMenu__check" aria-hidden>
                                    {selected ? '✓' : ''}
                                  </span>
                                  {item.name}
                                </button>
                              );
                            })
                          )}
                        </div>,
                        document.body,
                      )}
                  </>
                ) : null}
                {coercePlainString(productForm.name).trim() ? (
                  <div className="muted" style={{ fontSize: 12, marginTop: 10, lineHeight: 1.45 }}>
                    Aynı isimde daha önce görsel adresi kayıtlı bir ürün varsa otomatik devralınır.
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div>
              <div className="label">Ürün</div>
              <div style={{ fontWeight: 800 }}>{coercePlainString(productForm.name).trim() || '—'}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                Ad yalnızca katalogdan eklenir; burada değiştirilemez.
              </div>
            </div>
          )}
          <div>
            <div className="label">Açıklama</div>
            <input
              className="input"
              value={productForm.description}
              onChange={(e) => setProductForm((s) => ({ ...s, description: e.target.value }))}
            />
          </div>
          {productMode === 'edit' ? (
            <div>
              <div className="label">Kategori</div>
              <select
                className="input"
                value={productForm.category}
                onChange={(e) => setProductForm((s) => ({ ...s, category: e.target.value }))}
                aria-label="Ürün kategorisi"
              >
                <option value="">—</option>
                <option value="food">Yiyecek</option>
                <option value="beverage">İçecek</option>
              </select>
            </div>
          ) : null}
          {productMode === 'create' ? (
            <div className="formRow">
              <div>
                <div className="label">Başlangıç stoğu</div>
                <input
                  className="input"
                  type="number"
                  value={productForm.stock_quantity}
                  onChange={(e) => setProductForm((s) => ({ ...s, stock_quantity: e.target.value }))}
                />
              </div>
            </div>
          ) : null}
          <div className="muted" style={{ fontSize: 12 }}>
            Not: Güncel stok miktarı bu ekrandan değiştirilemez; stoka giriş veya stoktan çıkış kullanın (sunucu kuralı).
          </div>
        </div>
      </Modal>

      <Modal
        title={stockMode === 'in' ? 'Stoka giriş' : 'Stoktan çıkış'}
        open={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        footer={
          <>
            <button className="btn btnGhost" onClick={() => setStockModalOpen(false)}>
              İptal
            </button>
            <button className="btn btnPrimary" onClick={submitStock}>
              Onayla
            </button>
          </>
        }
      >
        {stockTarget ? (
          <div className="grid" style={{ gap: 12 }}>
            <div className="muted" style={{ fontWeight: 900 }}>
              {stockTarget.name}
            </div>
            <div className="formRow">
              <div>
                <div className="label">Miktar</div>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm((s) => ({ ...s, quantity: e.target.value }))}
                />
              </div>
              <div>
                <div className="label">Açıklama</div>
                <input
                  className="input"
                  value={stockForm.description}
                  onChange={(e) => setStockForm((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Ürünü sil"
        cancelLabel="İptal"
        confirmLabel="Sil"
        danger
        onCancel={closeDeleteModal}
        onConfirm={executeDelete}
      >
        <p className="confirmModalMessage">
          <strong>{deleteTarget?.name}</strong> ürününü silmek üzeresiniz. Stok kayıtlarıyla birlikte kaldırılır; bu işlem geri
          alınamaz.
        </p>
      </ConfirmModal>
    </div>
  );
}

