document.addEventListener('DOMContentLoaded', () => {
    // 1. ПРОВЕРКА БЕЗОПАСНОСТИ (Защита страниц)
    checkSecurity();

    // 2. ОБНОВЛЕНИЕ ШАПКИ И БУРГЕРА
    updateHeader();
    initBurger();

    // 3. ИНИЦИАЛИЗАЦИЯ ФУНКЦИЙ ПО СТРАНИЦАМ
    initAuthForm();
    initProfile();
    initGallery();
    initMilk();
});

// ===== ЗАЩИТА СТРАНИЦ =====
function checkSecurity() {
    const path = window.location.pathname.split('/').pop();
    // Список страниц, куда нельзя без входа (добавь prfl.html, если он у тебя тоже защищен)
    const protectedPages = ['Profile.html', 'gallary.html', 'prfl.html'];
    const isAuth = localStorage.getItem('isAuth') === 'true';

    if (protectedPages.includes(path) && !isAuth) {
        alert('🔒 Доступ запрещен! Сначала войдите в аккаунт.');
        window.location.href = 'auth.html';
    }
}

// ===== ШАПКА И БУРГЕР =====
function updateHeader() {
    const exitMenu = document.getElementById('exitMenu');
    if (!exitMenu) return;

    const isAuth = localStorage.getItem('isAuth') === 'true';

    if (isAuth) {
        exitMenu.innerHTML = `
            <a href="profile.html"><div class="exx"><p class="Back">PROFILE</p></div></a>
            <div class="exx" id="logoutBtn"><p class="Back">LOG OUT</p></div>
        `;
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.setItem('isAuth', 'false'); // Просто выходим, данные не стираем
            window.location.reload();
        });
    } else {
        exitMenu.innerHTML = `
            <a href="auth.html"><div class="exx"><p class="Back">SIGN IN</p></div></a>
            <a href="auth.html"><div class="exx"><p class="Back">LOG IN</p></div></a>
        `;
    }
}

function initBurger() {
    const burger = document.getElementById('burgerMenu');
    const exitMenu = document.getElementById('exitMenu');
    if (!burger || !exitMenu) return;

    burger.addEventListener('click', () => {
        exitMenu.classList.toggle('active');
        burger.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!exitMenu.contains(e.target) && !burger.contains(e.target)) {
            exitMenu.classList.remove('active');
        }
    });
}

// ===== АВТОРИЗАЦИЯ / РЕГИСТРАЦИЯ =====
function initAuthForm() {
    const form = document.getElementById('authForm');
    if (!form) return;

    const btnSignIn = document.getElementById('btnSignIn');
    const btnLogIn = document.getElementById('btnLogIn');
    const regFields = document.getElementById('registerFields');
    const loginSubmitBtn = document.getElementById('loginSubmit');
    const submitBtn = document.getElementById('submitBtn'); // Кнопка регистрации
    let isRegister = true;

    // Переключение вкладок
    function setMode(reg) {
        isRegister = reg;
        document.getElementById('authTitle').textContent = reg ? 'Register' : 'Log In';
        if (regFields) regFields.classList.toggle('hidden', !reg);
        if (loginSubmitBtn) loginSubmitBtn.classList.toggle('hidden', reg);
        if (submitBtn) submitBtn.classList.toggle('hidden', !reg);
        btnSignIn?.classList.toggle('inactive', !reg);
        btnLogIn?.classList.toggle('inactive', reg);
    }

    btnSignIn?.addEventListener('click', () => setMode(false));
    btnLogIn?.addEventListener('click', () => setMode(true));
    setMode(true);

    // Отправка формы
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('inputName').value.trim();
        const pass = document.getElementById('inputPass').value.trim();

        if (!name || !pass) return showToast('❌ Заполните имя и пароль');

        if (isRegister) {
            // РЕГИСТРАЦИЯ
            const passConfirm = document.getElementById('inputPassConfirm').value;
            if (pass !== passConfirm) return showToast('❌ Пароли не совпадают');
            
            localStorage.setItem('userName', name);
            localStorage.setItem('userPass', pass);
            localStorage.setItem('isAuth', 'true');
            showToast('✅ Регистрация успешна!');
        } else {
            // ВХОД
            const savedName = localStorage.getItem('userName');
            const savedPass = localStorage.getItem('userPass');

            if (name === savedName && pass === savedPass) {
                localStorage.setItem('isAuth', 'true');
                showToast('✅ Вход выполнен!');
            } else {
                return showToast('❌ Неверное имя или пароль');
            }
        }
        setTimeout(() => window.location.href = 'profile.html', 800);
    });
}

// ===== ПРОФИЛЬ =====
function initProfile() {
    const nameInput = document.getElementById('profileName');
    const bioInput = document.getElementById('profileBio');
    const saveBtn = document.getElementById('saveProfile');
    const avatarInput = document.getElementById('avatarInput');
    const avatarImg = document.getElementById('avatarImage');
    const placeholder = document.querySelector('.avatar-placeholder');

    if (!nameInput || !bioInput) return;

    nameInput.value = localStorage.getItem('userName') || '';
    bioInput.value = localStorage.getItem('userBio') || '';

    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar && avatarImg && placeholder) {
        avatarImg.src = savedAvatar;
        avatarImg.classList.remove('hidden');
        placeholder.classList.add('hidden');
    }

    saveBtn?.addEventListener('click', () => {
        localStorage.setItem('userName', nameInput.value.trim());
        localStorage.setItem('userBio', bioInput.value.trim());
        showToast('✅ Профиль сохранён');
    });

    avatarInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return showToast('❌ Ошибка файла');
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target.result;
            avatarImg.src = base64;
            avatarImg.classList.remove('hidden');
            placeholder?.classList.add('hidden');
            localStorage.setItem('userAvatar', base64);
            showToast('✅ Аватар обновлён');
        };
        reader.readAsDataURL(file);
    });
}

// ===== ГАЛЕРЕЯ (Восстановлено) =====
function initGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    const modal = document.getElementById('galleryModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.close-modal');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const input = document.getElementById('imageInput');
    const uploadBtn = document.querySelector('.upload-btn');
    const linkBox = document.getElementById('linkContainer');
    const linkInput = document.getElementById('generatedLink');
    const copyBtn = document.getElementById('copyBtn');

    const CLOUD_NAME = 'dgncxsiwj';
    const PRESET = 'my_gallery_preset';
    let images = JSON.parse(localStorage.getItem('galleryImages')) || [];
    let current = 0;

    function render() {
        grid.innerHTML = '';
        images.forEach((url, i) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.dataset.index = i;
            item.innerHTML = `
                <img src="${url}" alt="Photo" loading="lazy">
                <button class="action-btn copy-img-btn">📋</button>
                <button class="action-btn delete-img-btn">🗑️</button>
            `;
            grid.appendChild(item);
        });
        for (let i = images.length; i < 10; i++) {
            const empty = document.createElement('div');
            empty.className = 'gallery-item empty';
            empty.innerHTML = '<span class="art-label">ART</span>';
            grid.appendChild(empty);
        }
    }
    render();

    function open(idx) {
        if (idx < 0 || idx >= images.length) return;
        current = idx;
        modalImg.classList.remove('loaded');
        modalImg.src = images[idx];
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modalImg.onload = () => modalImg.classList.add('loaded');
        if (modalImg.complete) modalImg.classList.add('loaded');
    }

    function close() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        modalImg.src = '';
    }

    function nav(dir) {
        if (images.length === 0) return;
        current = (current + dir + images.length) % images.length;
        open(current);
    }

    grid.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (!item || item.classList.contains('empty')) return;
        const idx = parseInt(item.dataset.index);

        if (e.target.closest('.delete-img-btn')) {
            e.stopPropagation();
            if (confirm('Удалить фото?')) {
                images.splice(idx, 1);
                localStorage.setItem('galleryImages', JSON.stringify(images));
                render();
                showToast('Фото удалено');
            }
            return;
        }
        if (e.target.closest('.copy-img-btn')) {
            e.stopPropagation();
            copyToClipboard(images[idx]);
            return;
        }
        open(idx);
    });

    modal?.addEventListener('click', (e) => { if (e.target === modal) close(); });
    closeBtn?.addEventListener('click', close);
    prevBtn?.addEventListener('click', () => nav(-1));
    nextBtn?.addEventListener('click', () => nav(1));

    if (input && uploadBtn) {
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file || !file.type.startsWith('image/')) return showToast('Выбери картинку');
            if (images.length >= 10) return showToast('Максимум 10 фото');

            uploadBtn.classList.add('loading');
            uploadBtn.textContent = '⏳ Загрузка...';
            const fd = new FormData();
            fd.append('file', file);
            fd.append('upload_preset', PRESET);

            try {
                const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error?.message || 'Ошибка');

                images.push(data.secure_url);
                localStorage.setItem('galleryImages', JSON.stringify(images));
                render();
                if (linkInput && linkBox) {
                    linkInput.value = data.secure_url;
                    linkBox.classList.remove('hidden');
                }
                showToast('✅ Фото добавлено');
            } catch (err) {
                showToast('❌ Ошибка загрузки');
            } finally {
                uploadBtn.classList.remove('loading');
                uploadBtn.textContent = '📁 Загрузить фото';
                input.value = '';
            }
        });
    }

    copyBtn?.addEventListener('click', () => copyToClipboard(linkInput?.value));

    async function copyToClipboard(text) {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            showToast('✅ Ссылка скопирована');
        } catch {
            const ta = document.createElement('textarea');
            ta.value = text; document.body.appendChild(ta);
            ta.select(); document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('✅ Ссылка скопирована');
        }
    }
}

// ===== МИЛКА С ПОЖЕЛАНИЯМИ =====
function initMilk() {
    const milkImage = document.getElementById('milkImage');
    if (!milkImage) return;
    const wishTooltip = document.getElementById('wishTooltip');
    const wishes = ["Надень! ✨", "Береги себя! 🧥", "Ты супер! 💖"];
    let showingFirst = true;
    let resetTimer = null;

    milkImage.addEventListener('click', (e) => {
        e.preventDefault();
        if (resetTimer) clearTimeout(resetTimer);
        milkImage.src = showingFirst ? 'milk_chan2.png' : 'milk_chan.png';
        showingFirst = !showingFirst;
        if (wishTooltip) {
            wishTooltip.textContent = wishes[Math.floor(Math.random() * wishes.length)];
            wishTooltip.classList.add('show');
            setTimeout(() => wishTooltip.classList.remove('show'), 1500);
        }
    });
}

function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}