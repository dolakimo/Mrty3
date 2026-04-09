

//логика гамбургера карчое//

const burgerMenu = document.getElementById('burgerMenu');
    const exitMenu = document.getElementById('exitMenu');

    burgerMenu.addEventListener('click', function() {
        exitMenu.classList.toggle('active');
        burgerMenu.classList.toggle('active');
    });


//ПОЖЕЛАНИЯ НА РАНДОМЧИК

const milkImage = document.getElementById('milkImage');
const wishTooltip = document.getElementById('wishTooltip');

const image1 = 'milk_chan.png';
const image2 = 'milk_chan2.png';
let showingFirst = true;

const wishes = [
    "День сегодня прекрасен! ✨",
    "Береги себя! 🧥",
    "Ты сегодня прекрасен! 💖",
    "Удачи во всём! 🍀",
    "Не забудь улыбнуться! 😊",
    "Обнимаю крепко! 🤗",
    "Сияй ярко! 🌟"
];

let resetTimer = null;
const RESET_DELAY = 1500; // Время возврата к первой картинке

function forceResetToFirst() {
    showingFirst = true;
    milkImage.src = image1;
}

milkImage.addEventListener('click', function(e) {
    e.preventDefault();

    // Отменяем прошлого таймера, шоба не мешала
    if (resetTimer) clearTimeout(resetTimer);

    //картинку меняет
    milkImage.src = showingFirst ? image2 : image1;
    showingFirst = !showingFirst;

    // показывает случайное пожелание (брал с шаблона)
    const randomIndex = Math.floor(Math.random() * wishes.length);
    wishTooltip.textContent = wishes[randomIndex];
    wishTooltip.classList.add('show');
    setTimeout(() => wishTooltip.classList.remove('show'), 1500);

    // Запускает таймер возврата к исходной картинке
    resetTimer = setTimeout(forceResetToFirst, RESET_DELAY);
});