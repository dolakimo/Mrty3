// ===== БУРГЕР МЕНЮ =====
const burgerMenu = document.getElementById('burgerMenu');
const exitMenu = document.getElementById('exitMenu');

if (burgerMenu && exitMenu) {
    burgerMenu.addEventListener('click', function() {
        exitMenu.classList.toggle('active');
        burgerMenu.classList.toggle('active');
    });
}

// ===== ОСНОВНОЙ КОД ГАЛЕРЕИ =====
document.addEventListener('DOMContentLoaded', () => {
    // Ловим все элементы на странице
    const galleryGrid = document.getElementById('galleryGrid');
    const modal = document.getElementById('galleryModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.close-modal');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const imageInput = document.getElementById('imageInput');
    const uploadBtn = document.querySelector('.upload-btn');
    const linkContainer = document.getElementById('linkContainer');
    const linkInput = document.getElementById('generatedLink');
    const copyBtnUpload = document.getElementById('copyBtn');
    
    // Настройки Cloudinary (тут твои данные)
    const CLOUD_NAME = 'dgncxsiwj';
    const UPLOAD_PRESET = 'my_gallery_preset';
    
    // Загружаем фотки из памяти браузера
    let images = JSON.parse(localStorage.getItem('galleryImages')) || [];
    let currentIndex = 0;
    
    // ===== РИСОВАНИЕ ГАЛЕРЕИ =====
    function renderGallery() {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';
        
        // Добавляем загруженные фотки
        images.forEach((url, i) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.dataset.index = i;
            item.innerHTML = `
                <img src="${url}" alt="Photo ${i + 1}" loading="lazy">
                <button class="action-btn copy-img-btn" title="Копировать ссылку">📋</button>
                <button class="action-btn delete-img-btn" title="Удалить">🗑️</button>
            `;
            galleryGrid.appendChild(item);
        });
        
        // Добавляем пустые слоты ART до 10 штук
        for (let i = images.length; i < 10; i++) {
            const empty = document.createElement('div');
            empty.className = 'gallery-item empty';
            empty.innerHTML = '<span class="art-label">ART</span>';
            galleryGrid.appendChild(empty);
        }
    }
    
    // Рисуем галерею при загрузке
    renderGallery();
    
    // ===== ОТКРЫТИЕ МОДАЛКИ =====
    function openModal(index) {
        if (!modal || !modalImg || index < 0 || index >= images.length) return;
        currentIndex = index;
        modalImg.classList.remove('loaded');
        modalImg.src = images[index];
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку
        
        // Ждем загрузки картинки
        modalImg.onload = () => modalImg.classList.add('loaded');
        if (modalImg.complete) modalImg.classList.add('loaded');
    }
    
    // ===== ЗАКРЫТИЕ МОДАЛКИ =====
    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Возвращаем прокрутку
        if (modalImg) modalImg.src = '';
    }
    
    // ===== ПЕРЕКЛЮЧЕНИЕ ФОТО В МОДАЛКЕ =====
    function navigate(direction) {
        if (images.length === 0) return;
        currentIndex = (currentIndex + direction + images.length) % images.length;
        openModal(currentIndex);
    }
    
    // ===== КЛИКИ ПО ГАЛЕРЕЕ =====
    if (galleryGrid) {
        galleryGrid.addEventListener('click', (e) => {
            const item = e.target.closest('.gallery-item');
            if (!item || item.classList.contains('empty')) return;
            
            const index = parseInt(item.dataset.index);
            
            // Удаление фотки
            if (e.target.closest('.delete-img-btn')) {
                e.stopPropagation();
                if (confirm('Удалить фото из галереи?')) {
                    images.splice(index, 1);
                    localStorage.setItem('galleryImages', JSON.stringify(images));
                    renderGallery();
                    showToast('Фото удалено');
                }
                return;
            }
            
            // Копирование ссылки
            if (e.target.closest('.copy-img-btn')) {
                e.stopPropagation();
                copyToClipboard(images[index]);
                return;
            }
            
            // Открытие модального окна
            openModal(index);
        });
    }
    
    // Закрытие по клику вне картинки
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    // Кнопка закрытия
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Стрелки влево/вправо
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigate(-1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigate(1);
        });
    }
    
    // Управление с клавиатуры
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });
    
    // ===== ЗАГРУЗКА ФОТО =====
    if (imageInput && uploadBtn) {
        imageInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            
            // Проверка файла
            if (!file || !file.type.startsWith('image/')) {
                alert('Выбери картинку');
                return;
            }
            
            if (images.length >= 10) {
                alert('Максимум 10 фото в галерее');
                return;
            }
            
            // Показываем загрузку
            uploadBtn.classList.add('loading');
            uploadBtn.textContent = '⏳ Загрузка...';
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);
            
            try {
                // Отправляем на Cloudinary
                const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
                
                const newUrl = data.secure_url;
                
                // Добавляем в массив и сохраняем
                images.push(newUrl);
                localStorage.setItem('galleryImages', JSON.stringify(images));
                renderGallery();
                
                // Показываем ссылку
                if (linkInput && linkContainer) {
                    linkInput.value = newUrl;
                    linkContainer.classList.remove('hidden');
                }
                
                showToast('✅ Фото добавлено');
            } catch (err) {
                console.error('❌ Ошибка:', err);
                alert(`Ошибка: ${err.message}`);
            } finally {
                uploadBtn.classList.remove('loading');
                uploadBtn.textContent = '📁 Загрузить фото';
                imageInput.value = '';
            }
        });
    }
    
    // Кнопка копирования ссылки
    if (copyBtnUpload && linkInput) {
        copyBtnUpload.addEventListener('click', () => {
            copyToClipboard(linkInput.value);
        });
    }
    
    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
    
    // Копирование в буфер обмена
    async function copyToClipboard(text) {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            showToast('✅ Ссылка скопирована!');
        } catch {
            // Запасной вариант для старых браузеров
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('✅ Ссылка скопирована!');
        }
    }
    
    // Показ всплывающего уведомления
    function showToast(message) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
});