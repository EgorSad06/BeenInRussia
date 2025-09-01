
const tooltip = document.getElementById('tooltip');
let hideTooltipTimeout; // Для задержки скрытия
let tooltipHovered = false; // Для отслеживания наведения на саму подсказку

// Глобальные переменные для управления картой
let scale = 1;
let currentX = 0;
let currentY = 0;

const scaleStep = 0.1;
const minScale = 0.5;
const maxScale = 3;

document.querySelectorAll('.region').forEach(region => {
    region.classList.remove('disabled');
    region.addEventListener('mouseenter', function(e) {
        clearTimeout(hideTooltipTimeout); // Отменяем предыдущий таймер
        tooltip.textContent = this.dataset.name;
        tooltip.style.left = `${e.pageX + 15}px`; // Новое смещение
        tooltip.style.top = `${e.pageY + 15}px`;  // Новое смещение
        tooltip.style.opacity = '1';
    });

    region.addEventListener('mousemove', function(e) {
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
    const mapTooltip = document.getElementById('map-tooltip'); // Renamed to avoid conflict with global tooltip
    const layerBtns = document.querySelectorAll('.layer-btn');
    const regionLayer = document.getElementById('regions-layer');
    const reserveLayer = document.getElementById('reserves-layer');
    let currentLayer = 'regions'; // по умолчанию
    const attractionsLayer = document.getElementById('attractions-layer'); // New: Достопримечательности слой
    let visitedAttractions = JSON.parse(localStorage.getItem('visitedAttractions') || '[]'); 
    let visitedReserves = JSON.parse(localStorage.getItem('visitedReserves') || '[]');
    console.log('DOMContentLoaded - Initial visitedAttractions:', visitedAttractions);
    console.log('DOMContentLoaded - Initial visitedReserves:', visitedReserves);

    // NEW: Элементы панели подтверждения
    const confirmationPanel = document.getElementById('confirmation-panel');
    const confirmationText = document.getElementById('confirmation-text');
    const confirmMarkBtn = document.getElementById('confirm-mark-btn');

    // Ультимативный сброс всех отметок при загрузке страницы
    document.querySelectorAll('.region, .reserve, .attraction, .poi').forEach(element => {
        element.classList.remove('visited');
    });

    initReserves(); 
    initAttractions(); // NEW: Инициализация достопримечательностей при загрузке страницы


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
        });
        
        updateProgress();
    }
    

    function initReserves() {
        // Убраны локальные объявления tooltip и tooltipHovered, используем глобальные
        document.querySelectorAll('.reserve').forEach(reserve => {
            const id = reserve.id;
            console.log(`initReserves - Checking reserve: ${id}. Visited: ${visitedReserves.includes(id)}`);
            const name = reserve.dataset.name;
            const url = reserve.dataset.url;

            // Отображаем подсказку
            reserve.addEventListener('mouseover', function(e) {
                clearTimeout(hideTooltipTimeout); // Отменяем предыдущий таймер
                tooltip.innerHTML = `<strong>${name}</strong>${url ? `<br><a href="${url}" target="_blank">` : ''}`;
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


            // При загрузке
            if (visitedReserves.includes(id)) {
                reserve.classList.add('visited');
            }
        });
    }

    function initAttractions() {
        document.querySelectorAll('.attraction, .poi').forEach(attraction => {
            const id = attraction.id;
            console.log(`initAttractions - Checking attraction/poi: ${id}. Visited: ${visitedAttractions.includes(id)}`);
            if (visitedAttractions.includes(id)) {
                attraction.classList.add('visited');
            }
        });
    }


    // Обновление прогресса
    function updateProgress() {
        const totalRegions = document.querySelectorAll('.region').length;
        const totalReserves = document.querySelectorAll('.reserve').length; // Исправлена опечатка 'leng h'
        const totalAttractions = document.querySelectorAll('.attraction, .poi').length;

        const totalAll = totalRegions + totalReserves + totalAttractions;

        let visitedTotal = 0;

        visitedRegions.forEach(id => {
            if (document.getElementById(id) && document.getElementById(id).classList.contains('region')) {
                visitedTotal++;
            }
        });

        visitedReserves.forEach(id => {
            if (document.getElementById(id) && document.getElementById(id).classList.contains('reserve')) {
                visitedTotal++;
            }
        });

        visitedAttractions.forEach(id => {
            if (document.getElementById(id) && (document.getElementById(id).classList.contains('attraction') || document.getElementById(id).classList.contains('poi'))) {
                visitedTotal++;
            }
        });

        const percent = totalAll > 0 ? Math.round((visitedTotal / totalAll) * 100) : 0;

        progressPercent.textContent = percent;
        progressFill.style.width = `${percent}%`;
    }

    
    // NEW: Функция для плавного перемещения и масштабирования к элементу
    function flyToElement(element, duration = 800) {
        if (!element) return;

        let elementCenterX, elementCenterY;
        let elementWidth, elementHeight;

        // Для элементов <circle> используем cx и cy
        if (element.tagName === 'circle') {
            elementCenterX = parseFloat(element.getAttribute('cx'));
            elementCenterY = parseFloat(element.getAttribute('cy'));
            elementWidth = parseFloat(element.getAttribute('r')) * 2; // Диаметр круга
            elementHeight = elementWidth;
        } else { // Для <path> и других элементов используем getBBox()
            const bbox = element.getBBox();
            elementCenterX = bbox.x + bbox.width / 2;
            elementCenterY = bbox.y + bbox.height / 2;
            elementWidth = bbox.width;
            elementHeight = bbox.height;
        }

        const svgRect = svg.getBoundingClientRect(); // Получаем размеры SVG элемента на экране
        const svgWidth = svgRect.width;
        const svgHeight = svgRect.height;

        // Вычисляем оптимальный масштаб, чтобы элемент занимал примерно 50% ширины/высоты экрана
        const paddingFactor = 1.5; // Отступ вокруг элемента
        const scaleX = svgWidth / (elementWidth * paddingFactor);
        const scaleY = svgHeight / (elementHeight * paddingFactor);
        const targetScale = Math.max(minScale, Math.min(maxScale, Math.min(scaleX, scaleY)));

        // Вычисляем целевые координаты смещения (translate)
        // Цель: перевести центр элемента в центр видимой области SVG, учитывая новый масштаб
        // Это сложнее, чем просто вычитать, нужно учитывать текущие преобразования SVG
        // Сначала переводим центр видимой области SVG в координаты SVG-пространства
        const screenCenter = svg.createSVGPoint();
        screenCenter.x = svgWidth / 2;
        screenCenter.y = svgHeight / 2;
        const svgCenter = screenCenter.matrixTransform(svg.getScreenCTM().inverse());

        // Затем рассчитываем смещение, необходимое для перемещения elementCenterX,Y к svgCenter
        const newTargetX = (svgCenter.x - elementCenterX) * targetScale;
        const newTargetY = (svgCenter.y - elementCenterY) * targetScale;

        // Получаем текущие значения
        const currentTransform = mapInner.transform.baseVal.consolidate();
        let startX = currentTransform ? currentTransform.matrix.e : 0;
        let startY = currentTransform ? currentTransform.matrix.f : 0;
        let startScale = currentTransform ? currentTransform.matrix.a : 1;

        let startTime = null;

        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = (currentTime - startTime) / duration;

            if (progress < 1) {
                const easedProgress = 0.5 - Math.cos(progress * Math.PI) / 2; // Ease-in-out

                currentX = startX + ((svgWidth / 2 - elementCenterX * targetScale) - startX) * easedProgress;
                currentY = startY + ((svgHeight / 2 - elementCenterY * targetScale) - startY) * easedProgress;
                scale = startScale + (targetScale - startScale) * easedProgress;

                mapInner.setAttribute('transform', `translate(${currentX}, ${currentY}) scale(${scale})`);
                requestAnimationFrame(animate);
            } else {
                currentX = (svgWidth / 2 - elementCenterX * targetScale);
                currentY = (svgHeight / 2 - elementCenterY * targetScale);
                scale = targetScale;
                mapInner.setAttribute('transform', `translate(${currentX}, ${currentY}) scale(${scale})`);
            }
        }
        requestAnimationFrame(animate);
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
    
    // NEW: Обработчик для кнопки подтверждения отметки
    confirmMarkBtn.addEventListener('click', function() {
        const targetId = confirmationPanel.dataset.targetId;
        const targetLayer = confirmationPanel.dataset.targetLayer;
        const tappedElement = document.getElementById(targetId);

        if (!tappedElement) return;

        let currentVisitedArray;
        let localStorageKey;

        if (targetLayer === 'regions') {
            currentVisitedArray = visitedRegions;
            localStorageKey = 'visitedRegions';
        } else if (targetLayer === 'reserves') {
            currentVisitedArray = visitedReserves;
            localStorageKey = 'visitedReserves';
        } else if (targetLayer === 'attractions') {
            currentVisitedArray = visitedAttractions;
            localStorageKey = 'visitedAttractions';
        } else {
            return; // Неизвестный слой
        }

        // Переключаем статус посещения
        if (tappedElement.classList.contains('visited')) {
            tappedElement.classList.remove('visited');
            currentVisitedArray = currentVisitedArray.filter(id => id !== targetId);
        } else {
            tappedElement.classList.add('visited');
            if (!currentVisitedArray.includes(targetId)) {
                currentVisitedArray.push(targetId);
            }
        }

        // Обновляем соответствующие массивы и localStorage
        if (targetLayer === 'regions') {
            visitedRegions = currentVisitedArray;
        } else if (targetLayer === 'reserves') {
            visitedReserves = currentVisitedArray;
        } else if (targetLayer === 'attractions') {
            visitedAttractions = currentVisitedArray;
        }

        localStorage.setItem(localStorageKey, JSON.stringify(currentVisitedArray));
        updateProgress();
        confirmationPanel.classList.remove('visible'); // Скрываем панель после отметки
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
        confirmationPanel.classList.remove('visible'); // Скрываем панель при переключении слоя

        // Универсальный сброс всех отметок перед применением новых
        document.querySelectorAll('.region, .reserve, .attraction, .poi').forEach(element => {
            element.classList.remove('visited');
        });

        if (layer === 'regions') {
            regionLayer.style.display = 'inline';
            reserveLayer.style.display = 'none';
            attractionsLayer.style.display = 'none'; // NEW: Скрываем слой достопримечательностей при переключении на регионы

            // Разблокировать регионы
            regions.forEach(r => {
                r.classList.remove('disabled');
                if (visitedRegions.includes(r.id)) {
                    r.classList.add('visited');
                }
            });

        } else if (layer === 'reserves') {
            regionLayer.style.display = 'inline'; // всё равно показываем регионы, но блокируем
            reserveLayer.style.display = 'inline';
            attractionsLayer.style.display = 'none'; // NEW: Скрываем слой достопримечательностей при переключении на заповедники

            // Сделать регионы серыми и недоступными
            regions.forEach(r => {
                r.classList.add('disabled');
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

            // Отметить посещённые достопримечательности (пока пусто, будет реализовано позже)
            document.querySelectorAll('.attraction, .poi').forEach(attraction => {
                if (visitedAttractions.includes(attraction.id)) {
                    attraction.classList.add('visited');
                } else {
                    attraction.classList.remove('visited');
                }
            });
        }
    }

    // Инициализация приложения
    initMap();

    
// Перемещение карты мышью (правой кнопкой)
const svg = document.querySelector('svg');
const mapInner = document.getElementById('map-inner');

let isPanning = false;
let startX = 0;
let startY = 0;
// currentX и currentY теперь глобальные

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

// --- Обработчики для сенсорных событий (для мобильных устройств) ---
let isTouching = false;
let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0; // Текущее смещение по X для тача
let touchCurrentY = 0; // Текущее смещение по Y для тача
let isPinching = false;
let initialDistance = 0;
let initialScale = 1;

// Добавляем переменные для отслеживания движения пальца и имитации клика
let lastTouchX = 0;
let lastTouchY = 0;
let hasMoved = false; // Флаг, указывающий на то, было ли значительное движение пальца
let initialTouchTarget = null; // Элемент, который был первым касанием
let tapTimer = null; // Таймер для определения долгого нажатия/клика
let isTapCandidate = false; // Флаг, указывающий, что текущее касание может быть тапом

const moveThreshold = 15; // Увеличиваем порог для определения движения

svg.addEventListener('touchstart', function (e) {
    console.log('touchstart - hasMoved (before reset):', hasMoved); // Отладочное сообщение
    hasMoved = false; // Сброс флага движения при новом касании
    if (e.touches.length === 1) { // Только один палец для панорамирования
        isTouching = true;
        touchStartX = e.touches[0].clientX - currentX; // Сохраняем начальную позицию касания относительно текущего смещения карты
        touchStartY = e.touches[0].clientY - currentY; // Сохраняем начальную позицию касания относительно текущего смещения карты
        lastTouchX = e.touches[0].clientX; // Сохраняем для определения движения
        lastTouchY = e.touches[0].clientY; // Сохраняем для определения движения
        // Проверяем, является ли целевой элемент кликабельным для потенциального тапа
        initialTouchTarget = e.target.closest('.region, .reserve, .attraction, .poi');
        if (initialTouchTarget) {
            isTapCandidate = true;
            tapTimer = setTimeout(() => {
                isTapCandidate = false; // Если таймер сработал, это не короткий тап
            }, 100); // 100 мс для определения клика
        } else {
            isTapCandidate = false;
        }
        // e.preventDefault(); // Пока не вызываем, чтобы дать сработать возможному click
    } else if (e.touches.length === 2) { // Два пальца для масштабирования (pinch-to-zoom)
        isPinching = true;
        isTouching = false; // Отключаем панорамирование одним пальцем

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        initialDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        initialScale = scale;

        // Отладочное сообщение для touchstart (два пальца)
        console.log('touchstart (2 fingers) - initialDistance:', initialDistance, 'initialScale:', initialScale);

        const screenMidpointX = (touch1.clientX + touch2.clientX) / 2;
        const screenMidpointY = (touch1.clientY + touch2.clientY) / 2;

        const svgPoint = svg.createSVGPoint();
        svgPoint.x = screenMidpointX;
        svgPoint.y = screenMidpointY;
        // const svgMidpoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse()); // УДАЛЕНО

        // initialMidpointX = svgMidpoint.x; // УДАЛЕНО
        // initialMidpointY = svgMidpoint.y; // УДАЛЕНО

        e.preventDefault(); // Предотвращаем прокрутку страницы/масштабирование браузера
    }
});

svg.addEventListener('touchmove', function (e) {
    if (isTouching && e.touches.length === 1) {
        const currentTouchX = e.touches[0].clientX;
        const currentTouchY = e.touches[0].clientY;

        // Определяем, было ли значительное движение
        const deltaX = Math.abs(currentTouchX - lastTouchX);
        const deltaY = Math.abs(currentTouchY - lastTouchY);
        // const moveThreshold = 5; // Порог в пикселях для определения движения

        if (deltaX > moveThreshold || deltaY > moveThreshold) {
            console.log('touchmove - Detected significant movement, setting hasMoved to true.'); // Отладочное сообщение
            hasMoved = true;
            // Если было значительное движение, отменяем потенциальный тап
            if (tapTimer) {
                clearTimeout(tapTimer);
                tapTimer = null;
                isTapCandidate = false;
            }
            e.preventDefault(); // Предотвращаем прокрутку страницы, если есть движение
        }

        lastTouchX = currentTouchX;
        lastTouchY = currentTouchY;

        if (hasMoved) { // Если мы уже начали двигать, то панорамируем
            const newX = (e.touches[0].clientX - touchStartX);
            const newY = (e.touches[0].clientY - touchStartY);

            mapInner.setAttribute('transform', `translate(${newX}, ${newY}) scale(${scale})`);
            touchCurrentX = newX;
            touchCurrentY = newY;
        }
    } else if (isPinching && e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        const scaleFactor = currentDistance / initialDistance;

        const newScale = Math.max(minScale, Math.min(maxScale, initialScale * scaleFactor));

        // Отладочное сообщение для touchmove (два пальца)
        console.log('touchmove (2 fingers) - currentDistance:', currentDistance, 'scaleFactor:', scaleFactor, 'newScale:', newScale, 'current scale:', scale, 'newScale === scale:', newScale === scale);

        if (newScale === scale) return; // Если масштаб не изменился, нет смысла обновлять позицию

        const currentScreenMidpointX = (touch1.clientX + touch2.clientX) / 2;
        const currentScreenMidpointY = (touch1.clientY + touch2.clientY) / 2;

        // Вычисляем SVG-координаты точки, которая находится под текущим центром пальцев
        const currentSvgMidpointX = (currentScreenMidpointX - currentX) / scale;
        const currentSvgMidpointY = (currentScreenMidpointY - currentY) / scale;

        // Новое смещение, чтобы эта SVG-точка оставалась под текущим центром пальцев на экране
        currentX = currentScreenMidpointX - currentSvgMidpointX * newScale;
        currentY = currentScreenMidpointY - currentSvgMidpointY * newScale;

        scale = newScale;
        mapInner.setAttribute('transform', `translate(${currentX}, ${currentY}) scale(${scale})`);
        e.preventDefault();
    }
});

svg.addEventListener('touchend', function () {
    if (isTouching) {
        currentX = touchCurrentX; // Обновляем текущее смещение для мыши/тача
        currentY = touchCurrentY; // Обновляем текущее смещение для мыши/тача
        isTouching = false;
    }
    if (isPinching) {
        isPinching = false;
        // currentX, currentY и scale уже были обновлены в touchmove
    }

    // Если это был тап (короткое касание без движения), инициируем логику отметки напрямую
    console.log('touchend - hasMoved:', hasMoved, 'initialTouchTarget:', initialTouchTarget); // Отладочное сообщение
    // Изменяем условие для обработки тапа: теперь опираемся на isTapCandidate
    if (isTapCandidate && initialTouchTarget) {
        console.log('touchend - Processing tap for:', initialTouchTarget.id);
        const tappedElement = initialTouchTarget;
        const id = tappedElement.id;

        let confirmationMessage = '';
        let buttonText = '';
        let isVisited = false;

        if (tappedElement.classList.contains('region')) {
            if (markBtn.classList.contains('active')) {
                isVisited = visitedRegions.includes(id);
                confirmationMessage = isVisited ? `Убрать отметку о посещении региона ${tappedElement.dataset.name}?` : `Отметить регион ${tappedElement.dataset.name} как посещённый?`;
                buttonText = isVisited ? 'Убрать' : 'Отметить';
            } else {
                // Если кнопка отметки не активна, просто показать информацию (или ничего не делать)
                // В данном случае, мы не показываем панель, если кнопка отметки не активна для регионов
                initialTouchTarget = null; // Сброс целевого элемента
                return;
            }
        } else if (tappedElement.classList.contains('reserve')) {
            if (currentLayer === 'reserves' && markBtn.classList.contains('active')) {
                isVisited = visitedReserves.includes(id);
                confirmationMessage = isVisited ? `Убрать отметку о посещении заповедника ${tappedElement.dataset.name}?` : `Отметить заповедник ${tappedElement.dataset.name} как посещённый?`;
                buttonText = isVisited ? 'Убрать' : 'Отметить';
            } else {
                initialTouchTarget = null; // Сброс целевого элемента
                return;
            }
        } else if (tappedElement.classList.contains('attraction') || tappedElement.classList.contains('poi')) {
            if (currentLayer === 'attractions' && markBtn.classList.contains('active')) {
                isVisited = visitedAttractions.includes(id);
                confirmationMessage = isVisited ? `Убрать отметку о посещении достопримечательности ${tappedElement.dataset.name}?` : `Отметить достопримечательность ${tappedElement.dataset.name} как посещённую?`;
                buttonText = isVisited ? 'Убрать' : 'Отметить';
            } else {
                initialTouchTarget = null; // Сброс целевого элемента
                return;
            }
        } else {
            initialTouchTarget = null; // Сброс целевого элемента, если не является отметкой
            return;
        }

        // Вызываем функцию flyToElement для центрирования карты на выбранном элементе
        flyToElement(tappedElement);

        // Показываем панель подтверждения
        confirmationText.textContent = confirmationMessage;
        confirmMarkBtn.textContent = buttonText;
        confirmationPanel.classList.add('visible');

        // Сохраняем ссылку на элемент для использования в обработчике кнопки подтверждения
        confirmationPanel.dataset.targetId = id;
        confirmationPanel.dataset.targetLayer = currentLayer;

    } else {
        confirmationPanel.classList.remove('visible'); // Скрываем панель, если это не тап
    }
    initialTouchTarget = null; // Сброс целевого элемента
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
        tooltip.innerHTML = `<strong>${name}</strong>${url ? `<br><a href="${url}" target="_blank">` : ''}`;
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
})();

    // Отключение контекстного меню
    svg.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    svg.addEventListener('click', function (e) {
        const tappedElement = e.target.closest('.region, .reserve, .attraction, .poi');

        if (!tappedElement) return;

        const id = tappedElement.id;
        let confirmationMessage = '';
        let buttonText = '';
        let isVisited = false;

        if (tappedElement.classList.contains('region')) {
            if (markBtn.classList.contains('active')) {
                isVisited = visitedRegions.includes(id);
                confirmationMessage = isVisited ? `Убрать отметку о посещении региона ${tappedElement.dataset.name}?` : `Отметить регион ${tappedElement.dataset.name} как посещённый?`;
                buttonText = isVisited ? 'Убрать' : 'Отметить';
            } else {
                return;
            }
        } else if (tappedElement.classList.contains('reserve')) {
            if (currentLayer === 'reserves' && markBtn.classList.contains('active')) {
                isVisited = visitedReserves.includes(id);
                confirmationMessage = isVisited ? `Убрать отметку о посещении заповедника ${tappedElement.dataset.name}?` : `Отметить заповедник ${tappedElement.dataset.name} как посещённый?`;
                buttonText = isVisited ? 'Убрать' : 'Отметить';
            } else {
                return;
            }
        } else if (tappedElement.classList.contains('attraction') || tappedElement.classList.contains('poi')) {
            if (currentLayer === 'attractions' && markBtn.classList.contains('active')) {
                isVisited = visitedAttractions.includes(id);
                confirmationMessage = isVisited ? `Убрать отметку о посещении достопримечательности ${tappedElement.dataset.name}?` : `Отметить достопримечательность ${tappedElement.dataset.name} как посещённую?`;
                buttonText = isVisited ? 'Убрать' : 'Отметить';
            } else {
                return;
            }
        } else {
            return;
        }

        flyToElement(tappedElement);
        confirmationText.textContent = confirmationMessage;
        confirmMarkBtn.textContent = buttonText;
        confirmationPanel.classList.add('visible');
        confirmationPanel.dataset.targetId = id;
        confirmationPanel.dataset.targetLayer = currentLayer;
    });

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


