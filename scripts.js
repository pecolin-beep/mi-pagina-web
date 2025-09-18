document.addEventListener('DOMContentLoaded', () => {
  /* ====== Productos: seleccionar / quitar ====== */
  const galeria = document.getElementById('galeria');
  if (galeria) {
    galeria.addEventListener('click', (e) => {
      const isSelect = e.target.classList.contains('btn-select');
      const isUnselect = e.target.classList.contains('btn-unselect');
      if (!isSelect && !isUnselect) return;
      const card  = e.target.closest('.gm-product');
      const badge = card.querySelector('.seleccionado');
      const extra = card.querySelector('.extra');
      if (isSelect) { card.classList.add('border','border-2','border-success','shadow'); badge.classList.remove('d-none'); extra.classList.remove('d-none'); }
      if (isUnselect){ card.classList.remove('border','border-2','border-success','shadow'); badge.classList.add('d-none');   extra.classList.add('d-none'); }
    });
  }

  /* ====== Galería dinámica (URL o archivo) ====== */
  const urlInput = document.getElementById('imgUrl');
  const fileInput = document.getElementById('imgFile');
  const btnAdd   = document.getElementById('btnAdd');
  const gallery  = document.getElementById('gallery');

  function inferTitleFromSrc(src){
    try{ const u=new URL(src,location.href); return u.pathname.split('/').pop()||u.hostname||'Nueva imagen'; }
    catch{ return 'Nueva imagen'; }
  }
  function addCardWithSrc(src){
    const col=document.createElement('div'); col.className='col';
    const card=document.createElement('div'); card.className='card h-100';
    const img=document.createElement('img'); img.className='card-img-top'; img.alt='Imagen de galería'; img.src=src;
    img.onerror=()=>{ img.src='https://via.placeholder.com/900x600.png?text=Imagen+no+disponible'; };
    const body=document.createElement('div'); body.className='card-body';
    const title=document.createElement('h6'); title.className='card-title mb-0'; title.textContent=inferTitleFromSrc(src);
    body.appendChild(title); card.appendChild(img); card.appendChild(body); col.appendChild(card); gallery.appendChild(col);
  }
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      const url=(urlInput?.value||'').trim(); const file=fileInput?.files?.[0]||null;
      if(!url && !file){ alert('Escribe una URL válida o selecciona un archivo.'); urlInput?.focus(); return; }
      if(file){ const objectUrl=URL.createObjectURL(file); addCardWithSrc(objectUrl); setTimeout(()=>URL.revokeObjectURL(objectUrl),60000); fileInput.value=''; return; }
      try{ const u=new URL(url); if(!/^https?:/.test(u.protocol)) throw 0; addCardWithSrc(u.toString()); urlInput.value=''; }
      catch{ alert('La URL no es válida. Debe comenzar con http:// o https://'); urlInput?.focus(); }
    });
  }

  /* ====== Lista de tareas ====== */
  const taskInput=document.getElementById('taskInput');
  const btnAddTask=document.getElementById('btnAddTask');
  const btnRemoveFirst=document.getElementById('btnRemoveFirst');
  const todoList=document.getElementById('todoList');

  if (btnAddTask && todoList) {
    btnAddTask.addEventListener('click', ()=>{
      const text=taskInput.value.trim(); if(!text){ taskInput.focus(); return; }
      const li=document.createElement('li');
      li.className='list-group-item d-flex align-items-center justify-content-between';
      li.id='tarea-'+(todoList.children.length+1);
      li.innerHTML=`${text} <span class="badge bg-light text-dark">#${todoList.children.length+1}</span>`;
      todoList.appendChild(li); taskInput.value=''; taskInput.focus();
    });
    taskInput.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); btnAddTask.click(); }});
    btnRemoveFirst.addEventListener('click', ()=>{
      const first=todoList.querySelector('li'); if(!first){ alert('La lista ya está vacía.'); return; } first.remove();
    });
  }

  /* ====== CARRITO ====== */
  const cartList = document.getElementById('cartList');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountEl = document.getElementById('cartCount');
  const btnClearCart = document.getElementById('btnClearCart');
  const btnCheckout = document.getElementById('btnCheckout');

  let cart = [];
  const $ = (s, ctx=document)=>ctx.querySelector(s);
  const money = n => n.toLocaleString('es-MX',{style:'currency', currency:'MXN'});

  function loadCart(){
    try{ cart = JSON.parse(localStorage.getItem('cart-gomonas')||'[]') }catch{ cart=[]; }
    renderCart();
  }
  function saveCart(){ localStorage.setItem('cart-gomonas', JSON.stringify(cart)); }

  function addToCart(name, price){
    const found = cart.find(i => i.name===name && i.price===price);
    if(found) found.qty += 1;
    else cart.push({name, price, qty:1});
    renderCart(); saveCart();
  }
  function removeIndex(idx){
    cart.splice(idx,1); renderCart(); saveCart();
  }
  function changeQty(idx, delta){
    cart[idx].qty += delta;
    if(cart[idx].qty<=0) cart.splice(idx,1);
    renderCart(); saveCart();
  }
  function renderCart(){
    if (!cartList) return;
    cartList.innerHTML = '';
    let total = 0, count = 0;
    cart.forEach((item, i)=>{
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex align-items-center justify-content-between';
      const subtotal = item.price * item.qty;
      total += subtotal; count += item.qty;
      li.innerHTML = `
        <div><strong>${item.qty}×</strong> ${item.name}</div>
        <div class="d-flex align-items-center gap-2">
          <div class="text-nowrap me-1">${money(subtotal)}</div>
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-secondary btn-dec" data-idx="${i}">-</button>
            <button class="btn btn-outline-secondary btn-inc" data-idx="${i}">+</button>
            <button class="btn btn-outline-danger btn-remove" data-idx="${i}">✕</button>
          </div>
        </div>`;
      cartList.appendChild(li);
    });
    if (cartTotalEl) cartTotalEl.textContent = money(total);
    if (cartCountEl) {
      cartCountEl.textContent = count;
      cartCountEl.classList.toggle('d-none', count===0);
    }
    if(count===0 && cartList){ cartList.innerHTML = '<li class="list-group-item text-center text-secondary">Tu carrito está vacío</li>'; }
  }

  // Delegación: clic en "Agregar al carrito" desde las tarjetas
  if (galeria) {
    galeria.addEventListener('click', (e)=>{
      if(!e.target.classList.contains('btn-add-cart')) return;
      const card = e.target.closest('.gm-product');
      const name = card.querySelector('.card-title').textContent.trim();
      const priceText = card.querySelector('.fw-bold.text-success').textContent;
      const price = parseFloat(priceText.replace(/[^0-9.]/g,''));
      addToCart(name, isNaN(price)?0:price);
    });
  }

  // Controles dentro del panel
  if (cartList) {
    cartList.addEventListener('click', (e)=>{
      const idx = +e.target.dataset.idx;
      if(e.target.classList.contains('btn-remove')) removeIndex(idx);
      if(e.target.classList.contains('btn-inc')) changeQty(idx, +1);
      if(e.target.classList.contains('btn-dec')) changeQty(idx, -1);
    });
  }
  if (btnClearCart) btnClearCart.addEventListener('click', ()=>{ cart=[]; renderCart(); saveCart(); });
  if (btnCheckout) btnCheckout.addEventListener('click', ()=>{
    if(cart.length===0) return alert('Tu carrito está vacío.');
    alert('¡Gracias por tu compra! (Demo)');
    cart=[]; renderCart(); saveCart();
  });

  loadCart(); // inicializa carrito desde localStorage

  /* ====== Degradado HSL con mousemove (seguro, sin variables globales) ====== */
  const header = document.getElementById('gmHeader');
  if (header) {
    window.addEventListener('mousemove', (ev)=>{
      const w = window.innerWidth, h = window.innerHeight;
      const x = ev.clientX / w; // 0..1
      const y = ev.clientY / h; // 0..1
      const angle = Math.round(x * 360);
      const hueBase = Math.round(320 - 60*y);  // entre rosas y morados
      const sat = 80, l1 = 55, l2 = 50, l3 = 45;
      const hue2 = (hueBase + 20) % 360;
      const hue3 = (hueBase + 40) % 360;
      header.style.background = `linear-gradient(${angle}deg,
        hsl(${hueBase} ${sat}% ${l1}%),
        hsl(${hue2} ${sat}% ${l2}%),
        hsl(${hue3} ${sat}% ${l3}%))`;
    });
  }
});

async function loadProducts(){
  const cont = document.getElementById('galeria');
  if(!cont) return;

  try{
    const res = await fetch('products.json');  // lee el JSON
    if(!res.ok) throw new Error('Error HTTP ' + res.status);
    const items = await res.json();
    renderProducts(items); // manda a dibujar los productos
  }catch(e){
    console.warn('Error al cargar productos:', e);
    cont.innerHTML = '<p class="text-danger">No se pudieron cargar los productos</p>';
  }
}

function renderProducts(items){
  const cont = document.getElementById('galeria');
  cont.innerHTML = ''; // limpia antes de dibujar

  for(const p of items){
    cont.insertAdjacentHTML('beforeend', `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card gm-product h-100">
          <img src="${p.img}" class="card-img-top" alt="${p.title}"
            onerror="this.src='https://via.placeholder.com/900x600.png?text=${encodeURIComponent(p.title)}'">
          <div class="card-body">
            <h5 class="card-title">${p.title}</h5>
            <p class="card-text fw-bold text-success">$${p.price.toFixed(2)} MXN</p>
          </div>
          <div class="card-footer bg-white border-0 pt-0">
            <div class="d-flex gap-2">
              <button class="btn btn-primary btn-select w-50">Seleccionar</button>
              <button class="btn btn-outline-secondary btn-unselect w-50">Quitar</button>
            </div>
            <button class="btn btn-sm btn-outline-dark w-100 mt-2 btn-add-cart">Agregar al carrito</button>
          </div>
        </div>
      </div>
    `);
  }
}

// ejecuta cuando la página carga
document.addEventListener('DOMContentLoaded', loadProducts);
