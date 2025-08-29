
const tooltip = document.getElementById('tooltip');
let hideTooltipTimeout; // Для задержки скрытия
let tooltipHovered = false; // Для отслеживания наведения на саму подсказку

document.querySelectorAll('.region').forEach(region => {
region.classList.remove('disabled');
region.addEventListener('mouseenter', function(e) {
        clearTimeout(hideTooltipTimeout); // Отменяем предыдущий таймер
        tooltip.textContent = this.dataset.name;
        tooltip.style.left = `${e.pageX + 15}px`; // Новое смещение
        tooltip.style.top = `${e.pageY + 15}px`;  // Новое смещение
        tooltip.style.opacity = '1';
    });

    region.addEventListener('mousemove', function(e) { // Оставить, если нужно более точное следование за курсором
        tooltip.style.left = `${e.pageX + 0}px`;
        tooltip.style.top = `${e.pageY + -100}px`;
    });

    region.addEventListener('mouseleave', function() {
        hideTooltipTimeout = setTimeout(() => {
            if (!tooltipHovered) {
                tooltip.style.opacity = '0';
            }
        }, 80); // 8 секунд
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const regions = document.querySelectorAll('.region');
    const progressModal = document.getElementById('progress-modal');
    const infoModal = document.getElementById('info-modal');
    const layersModal = document.getElementById('layers-modal');
    const progressBtn = document.getElementById('progress-btn');
    const infoBtn = document.getElementById('info-btn');
    const layersBtn = document.getElementById('layers-btn');
    const markBtn = document.getElementById('mark-btn');
    const closeButtons = document.querySelectorAll('.close-btn');
    const progressPercent = document.getElementById('progress-percent');
    const progressFill = document.getElementById('progress-fill');
    const tooltip = document.getElementById('map-tooltip');
    const layerBtns = document.querySelectorAll('.layer-btn');
    const regionLayer = document.getElementById('regions-layer');
    const reserveLayer = document.getElementById('reserves-layer');
    let currentLayer = 'regions'; // по умолчанию
    const attractionsLayer = document.getElementById('attractions-layer'); // New: Достопримечательности слой
    let visitedAttractions = JSON.parse(localStorage.getItem('visitedAttractions')) || []; 
    let visitedReserves = JSON.parse(localStorage.getItem('visitedReserves')) || [];
    initReserves(); 


    // Хранилище посещенных регионов
    let visitedRegions = JSON.parse(localStorage.getItem('visitedRegions')) || [];
    
    // Инициализация карты
    function initMap() {
        regions.forEach(region => {
            const regionId = region.id;
            
            // Проверяем, посещен ли регион
            if (visitedRegions.includes(regionId)) {
                region.classList.add('visited');
            }
            
            // Подсказки при наведении


            
            // Клик для отметки региона
            region.addEventListener('click', function() {
                if (markBtn.classList.contains('active')) {
                    const regionId = this.id;
                    if (this.classList.contains('visited')) {
                        this.classList.remove('visited');
                        visitedRegions = visitedRegions.filter(id => id !== regionId);
                    } else {
                        this.classList.add('visited');
                        visitedRegions.push(regionId);
                    }
                    localStorage.setItem('visitedRegions', JSON.stringify(visitedRegions));
                    updateProgress();
                }
            });
        });
        
        updateProgress();
    }
    

    function initReserves() {
    const tooltip = document.getElementById('tooltip');
    let tooltipHovered = false;

    document.querySelectorAll('.reserve').forEach(reserve => {
        const id = reserve.id;
        const name = reserve.dataset.name;
        const url = reserve.dataset.url;

        // Отображаем подсказку
        reserve.addEventListener('mouseover', function(e) {
            clearTimeout(hideTooltipTimeout); // Отменяем предыдущий таймер
            tooltip.innerHTML = `<strong>${name}</strong><br><a href="${url}" target="_blank">`;
            tooltip.style.left = `${e.pageX + 15}px`; // Новое смещение
            tooltip.style.top = `${e.pageY + 15}px`;  // Новое смещение
            tooltip.style.opacity = '1';
        });

        reserve.addEventListener('mousemove', function(e) { // Оставить, если нужно более точное следование за курсором
            tooltip.style.left = `${e.pageX + 0}px`;
            tooltip.style.top = `${e.pageY + -100}px`;
        });

        // Скрытие только если курсор не на tooltip
        reserve.addEventListener('mouseout', function() {
            hideTooltipTimeout = setTimeout(() => {
                if (!tooltipHovered) {
                    tooltip.style.opacity = '0';
                }
            }, 80); // 8 секунд
        });

        // Обработка наведения на сам tooltip
        tooltip.addEventListener('mouseenter', () => {
            clearTimeout(hideTooltipTimeout); // Отменяем таймер скрытия, если навели на саму подсказку
            tooltipHovered = true;
        });
        tooltip.addEventListener('mouseleave', () => {
            tooltipHovered = false;
            hideTooltipTimeout = setTimeout(() => { // Устанавливаем таймер скрытия, если убрали курсор с подсказки
                tooltip.style.opacity = '0';
            }, 200); // Короткая задержка, чтобы пользователь мог уйти с подсказки
        });

        // Клик для отметки
        reserve.addEventListener('click', function () {
        if (currentLayer !== 'reserves' || !markBtn.classList.contains('active')) return;

        if (this.classList.contains('visited')) {
            this.classList.remove('visited');
            visitedReserves = visitedReserves.filter(r => r !== id);
        } else {
            this.classList.add('visited');
            visitedReserves.push(id);
        }

        localStorage.setItem('visitedReserves', JSON.stringify(visitedReserves));
        });

        // При загрузке
        if (visitedReserves.includes(id)) {
        reserve.classList.add('visited');
        }
    });
    }





    // Обновление прогресса
function updateProgress() {
    const totalRegions = document.querySelectorAll('.region'); // NodeList
    const total = totalRegions.length;

    // Считаем, сколько из них действительно посещены
    let visited = 0;
    totalRegions.forEach(region => {
        if (visitedRegions.includes(region.id)) {
            visited++;
        }
    });

    const percent = total > 0 ? Math.round((visited / total) * 100) : 0;

    progressPercent.textContent = percent;
    progressFill.style.width = `${percent}%`;
}




    
    // Обработчики кнопок
    progressBtn.addEventListener('click', function() {
        progressModal.style.display = 'flex';
    });
    
    infoBtn.addEventListener('click', function() {
        infoModal.style.display = 'flex';
    });
    
    layersBtn.addEventListener('click', function() {
        layersModal.style.display = 'flex';
    });
    
    markBtn.addEventListener('click', function() {
        this.classList.toggle('active');
    });
    
    // Закрытие модальных окон
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Клик вне модального окна
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Переключение слоев
    layerBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const selected = this.dataset.layer;

            // Удаляем класс active у всех кнопок
            layerBtns.forEach(b => b.classList.remove('active'));

            // Добавляем класс active текущей кнопке
            this.classList.add('active');

            // Переключаем слой
            switchLayer(selected);
        });
    });


    //переключение слоёв
            function switchLayer(layer) {
    currentLayer = layer;

    if (layer === 'regions') {
        regionLayer.style.display = 'inline';
        reserveLayer.style.display = 'none';

        // Разблокировать регионы
        regions.forEach(r => {
            r.classList.remove('disabled');
            if (visitedRegions.includes(r.id)) {
                r.classList.add('visited');
            } else {
                r.classList.remove('visited');
            }
        });

        } else if (layer === 'reserves') {
        regionLayer.style.display = 'inline'; // всё равно показываем регионы, но блокируем
        reserveLayer.style.display = 'inline';

        // Сделать регионы серыми и недоступными
        regions.forEach(r => {
            r.classList.add('disabled');
            r.classList.remove('visited');
        });

        // Отметить посещённые заповедники
        document.querySelectorAll('.reserve').forEach(reserve => {
            if (visitedReserves.includes(reserve.id)) {
                reserve.classList.add('visited');
            } else {
                reserve.classList.remove('visited');
            }
        });
    } else if (layer === 'attractions') { // NEW BLOCK FOR ATTRACTIONS
        regionLayer.style.display = 'inline'; // всё равно показываем регионы, но блокируем
        reserveLayer.style.display = 'none'; // Скрываем слой заповедников
        attractionsLayer.style.display = 'inline';
        // Показываем слой с достопримечательностями
        regions.forEach(r => r.classList.add('disabled'));
        // Сделать регионы серыми и недоступными
        regions.forEach(r => {
            r.classList.remove('visited');
        });

        // Отметить посещённые достопримечательности (пока пусто, будет реализовано позже)
        document.querySelectorAll('.attraction').forEach(attraction => {
            if (visitedAttractions.includes(attraction.id)) {
                attraction.classList.add('visited');
            } else {
                attraction.classList.remove('visited');
            }
        });
    }
// ... existing code ...
}

     

    // Инициализация приложения
    initMap();

    

    
// Перемещение карты мышью (правой кнопкой)
const svg = document.querySelector('svg');
const mapInner = document.getElementById('map-inner');

let isPanning = false;
let startX = 0;
let startY = 0;
let currentX = 0; // Текущее смещение по X
let currentY = 0; // Текущее смещение по Y

svg.addEventListener('mousedown', function (e) {
    if (e.button === 2) { // Правая кнопка мыши
        isPanning = true;
        startX = e.clientX - currentX; // Сохраняем начальную позицию курсора относительно текущего смещения карты
        startY = e.clientY - currentY; // Сохраняем начальную позицию курсора относительно текущего смещения карты
        svg.style.cursor = 'grabbing';
        e.preventDefault();
    }
});

svg.addEventListener('mousemove', function (e) {
    if (!isPanning) return;

    // Вычисляем новое смещение, основываясь на начальной позиции и текущем положении курсора
    const newX = (e.clientX - startX);
    const newY = (e.clientY - startY);

    mapInner.setAttribute('transform', `translate(${newX}, ${newY}) scale(${scale})`);
});

svg.addEventListener('mouseup', function (e) {
    if (e.button === 2 && isPanning) {
        // Пересчитываем dx и dy здесь, чтобы они были доступны
        const newX = (e.clientX - startX);
        const newY = (e.clientY - startY);

        currentX = newX; // Обновляем текущее смещение
        currentY = newY; // Обновляем текущее смещение

        isPanning = false;
        svg.style.cursor = 'default';
    }
});

svg.addEventListener('mouseleave', function () {
    if (isPanning) {
        // Если мышь уходит за пределы SVG во время перетаскивания, останавливаем перетаскивание
        isPanning = false;
        svg.style.cursor = 'default';
    }
});
// --- Подсказки для достопримечательностей (attraction) ---
// делегирование подсказок и кликов для poi / reserve / attraction
(function setupPoiDelegation() {
const svg = document.querySelector('svg');
const tooltip = document.getElementById('tooltip');
if (!svg || !tooltip) {
console.warn('SVG или tooltip не найден. svg=', svg, 'tooltip=', tooltip);
return;
}

let hideTimer = null;

// helper: показать тултип
function showTip(e, el) {
clearTimeout(hideTimer);
const name = el.dataset.name || '';
const url  = el.dataset.url  || '';
tooltip.innerHTML = `<strong>${name}</strong>${url ? `<br><a href="${url}" target="_blank"> ` : ''}`;
tooltip.style.left  = `${e.pageX + 12}px`;
tooltip.style.top   = `${e.pageY + 12}px`;
tooltip.style.opacity = '1';
}

// mouseover / mousemove / mouseout делегируем с capture=false
svg.addEventListener('mouseover', (e) => {
const el = e.target.closest && e.target.closest('.poi, .attraction');
if (!el) return;
showTip(e, el);
});

svg.addEventListener('mousemove', (e) => {
const el = e.target.closest && e.target.closest('.poi, .attraction');
if (!el) return;
// обновляем позицию тултипа
tooltip.style.left = `${e.pageX + -10}px`;
tooltip.style.top  = `${e.pageY + -130}px`;
});

svg.addEventListener('mouseout', (e) => {
// если ушли с элемента — прячем с небольшой задержкой
const el = e.target.closest && e.target.closest('.poi, .attraction');
if (!el) return;
clearTimeout(hideTimer);
hideTimer = setTimeout(() => tooltip.style.opacity = '0', 150);
});

// клик для отметки — делегируем
svg.addEventListener('click', (e) => {
const el = e.target.closest && e.target.closest('.poi, .attraction');
if (!el) return;

// если у тебя включены слои и ты хочешь ограничить клики по слою:
// если (currentLayer === 'reserves' && el.classList.contains('reserve')) { ... }
// но мы просто переключаем класс visited:
el.classList.toggle('visited');

// если это достопримечательность — сохраняем в localStorage
if (el.classList.contains('poi') || el.classList.contains('attraction')) {
const id = el.id;
visitedAttractions = JSON.parse(localStorage.getItem('visitedAttractions')) || [];
if (el.classList.contains('visited')) {
if (!visitedAttractions.includes(id)) visitedAttractions.push(id);
} else {
visitedAttractions = visitedAttractions.filter(x => x !== id);
}
localStorage.setItem('visitedAttractions', JSON.stringify(visitedAttractions));
}

// для заповедников аналогично (если нужно) — можно и их сохранять в visitedReserves
});
})();








    // Отключение контекстного меню
    svg.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
    let scale = 1;
    const scaleStep = 0.1;
    const minScale = 0.5;
    const maxScale = 3;

        svg.addEventListener('wheel', function (e) {
    e.preventDefault();

    const delta = Math.sign(e.deltaY);
    const zoomFactor = delta > 0 ? (1 - scaleStep) : (1 + scaleStep);

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    const newScale = Math.max(minScale, Math.min(maxScale, scale * zoomFactor));
    if (newScale === scale) return;

    currentX -= (svgP.x - currentX) * (newScale / scale - 1);
    currentY -= (svgP.y - currentY) * (newScale / scale - 1);

    scale = newScale;

    mapInner.setAttribute('transform', `translate(${currentX}, ${currentY}) scale(${scale})`);

    svg.addEventListener('wheel', function (e) {
e.preventDefault();

const delta = Math.sign(e.deltaY);
const zoomFactor = delta > 0 ? (1 - scaleStep) : (1 + scaleStep);

const pt = svg.createSVGPoint();
pt.x = e.clientX;
pt.y = e.clientY;
const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

const newScale = Math.max(minScale, Math.min(maxScale, scale * zoomFactor));
if (newScale === scale) return;

currentX -= (svgP.x - currentX) * (newScale / scale - 1);
currentY -= (svgP.y - currentY) * (newScale / scale - 1);

scale = newScale;

mapInner.setAttribute('transform', `translate(${currentX}, ${currentY}) scale(${scale})`);
});




});



});

