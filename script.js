let appState = {
    studentName: 'عمرو',
    groupNumber: '1',
    weekNumber: 'الثاني',
    isFarPastMerged: true,
    isNearPastMerged: true,
    farPast: '-',
    nearPast: 'تسميع من أول سورة البقرة إلى آية ٢٥ يومياً',
    preparation: '(( تلاوة ربع ))\n(( أتأمرون الناس بالبر ))\nوالصلاة بالمحفوظ على مدار اليوم',
    rows: [
        { day: 'الجمعة', type: 'range', surah: 'البقرة', from: '٢٦', to: '٢٨', text: '', farPast: {type:'text', text:''}, nearPast: {type:'text', text:''} },
        { day: 'السبت', type: 'range', surah: 'البقرة', from: '٢٦', to: '٣٣', text: '', farPast: {type:'text', text:''}, nearPast: {type:'text', text:''} },
        { day: 'الأحد', type: 'range', surah: 'البقرة', from: '٢٦', to: '٣٨', text: '', farPast: {type:'text', text:''}, nearPast: {type:'text', text:''} },
        { day: 'الاثنين', type: 'range', surah: 'البقرة', from: '٢٦', to: '٤٣', text: '', farPast: {type:'text', text:''}, nearPast: {type:'text', text:''} },
        { day: 'الثلاثاء', type: 'text', from: '', to: '', text: 'تسميع الربع (٣) مرات', farPast: {type:'text', text:''}, nearPast: {type:'text', text:''} },
        { day: 'الأربعاء', type: 'text', from: '', to: '', text: 'تسميع الربع (٥) مرات', farPast: {type:'text', text:''}, nearPast: {type:'text', text:''} },
        { day: 'الخميس', type: 'text', from: '', to: '', text: 'تسميع الربع (٧) مرات', farPast: {type:'text', text:''}, nearPast: {type:'text', text:''} },
    ]
};

const daysOfWeek = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

document.addEventListener('DOMContentLoaded', () => {
    renderEditorRows();
    renderDailyEditors();
    renderPreview();
    fitPreviewToScreen();
    window.addEventListener('resize', fitPreviewToScreen);
});

// --- Toggle Logic ---
function toggleMode(key) {
    if(key === 'farPast') {
        appState.isFarPastMerged = !document.getElementById('toggleFarPast').checked;
        document.getElementById('farPastMergedContainer').classList.toggle('hidden', !appState.isFarPastMerged);
        document.getElementById('farPastDailyContainer').classList.toggle('hidden', appState.isFarPastMerged);
    } else if(key === 'nearPast') {
        appState.isNearPastMerged = !document.getElementById('toggleNearPast').checked;
        document.getElementById('nearPastMergedContainer').classList.toggle('hidden', !appState.isNearPastMerged);
        document.getElementById('nearPastDailyContainer').classList.toggle('hidden', appState.isNearPastMerged);
    }
    renderPreview();
}

// --- Helper to render specific cell HTML (INCREASED FONT SIZE HERE) ---
function getCellHtml(data, isTextMode) {
    if (!isTextMode) {
        // اسم السورة: text-xl
        const surahHtml = data.surah ? `<span class="block text-[#1a3c34] text-xl font-bold mb-1 font-serif">سورة ${data.surah}</span>` : '';
        return `
            <div class="flex flex-col items-center justify-center w-full">
                ${surahHtml}
                <!-- أرقام الآيات: text-3xl -->
                <div class="flex items-center gap-1 text-[#c5a059] text-3xl font-bold dir-ltr leading-none">
                    <span class="text-center font-serif text-[#1a3c34]">${data.from || '?'}</span>
                    <span class="text-[#c5a059] mx-1 text-2xl">←</span>
                    <span class="text-center font-serif text-[#1a3c34]">${data.to || '?'}</span>
                </div>
            </div>`;
    } else {
        return `<span class="font-bold text-[#1a3c34] text-lg leading-tight">${data.text || ''}</span>`;
    }
}

// --- Helper to render row editor ---
function renderSingleRowEditor(row, idx, context, containerId) {
    const container = document.getElementById(containerId);
    // Ensure object exists
    if (!row[context]) row[context] = { type: 'text', text: '', surah: '', from: '', to: '' };
    const data = row[context];
    const isRange = data.type === 'range';

    // Create div manually to append
    const div = document.createElement('div');
    div.className = 'bg-[#fffdf9] p-3 rounded-lg border border-[#c5a059]/20 transition-all hover:border-[#c5a059] shadow-sm mb-3';
    
    div.innerHTML = `
        <div class="flex justify-between items-center mb-2 pb-2 border-b border-[#c5a059]/10">
            <span class="font-bold text-[#1a3c34] text-sm">${row.day}</span>
            <div class="flex bg-[#f0ebe0] rounded p-0.5 gap-1">
                <button onclick="toggleDailyRowType(${idx}, '${context}', 'range')" class="px-2 py-1 rounded text-[10px] font-bold transition-all ${isRange ? 'bg-[#1a3c34] text-white shadow' : 'text-gray-500 hover:text-[#1a3c34]'}">آيات</button>
                <button onclick="toggleDailyRowType(${idx}, '${context}', 'text')" class="px-2 py-1 rounded text-[10px] font-bold transition-all ${!isRange ? 'bg-[#1a3c34] text-white shadow' : 'text-gray-500 hover:text-[#1a3c34]'}">نص</button>
            </div>
        </div>
    `;

    if (isRange) {
        div.innerHTML += `
            <div class="flex flex-col gap-2">
                <div>
                    <label class="text-[9px] text-[#5d4037] font-bold mb-0.5 block">اسم السورة</label>
                    <input type="text" value="${data.surah || ''}" oninput="updateDailyRow(${idx}, '${context}', 'surah', this.value)" class="w-full p-2 bg-white border border-[#d1d5db] rounded text-sm focus:border-[#c5a059] outline-none" placeholder="البقرة">
                </div>
                <div class="flex gap-2">
                    <div class="flex-1">
                        <label class="text-[9px] text-[#5d4037] font-bold mb-0.5 block">من</label>
                        <input type="text" value="${data.from || ''}" oninput="updateDailyRow(${idx}, '${context}', 'from', this.value)" class="w-full p-2 bg-white border border-[#d1d5db] rounded text-center text-sm font-bold focus:border-[#c5a059] outline-none">
                    </div>
                    <div class="flex-1">
                        <label class="text-[9px] text-[#5d4037] font-bold mb-0.5 block">إلى</label>
                        <input type="text" value="${data.to || ''}" oninput="updateDailyRow(${idx}, '${context}', 'to', this.value)" class="w-full p-2 bg-white border border-[#d1d5db] rounded text-center text-sm font-bold focus:border-[#c5a059] outline-none">
                    </div>
                </div>
            </div>`;
    } else {
        div.innerHTML += `
            <div>
                <label class="text-[9px] text-[#5d4037] font-bold mb-0.5 block">النص</label>
                <input type="text" value="${data.text || ''}" oninput="updateDailyRow(${idx}, '${context}', 'text', this.value)" class="w-full p-2 bg-white border border-[#d1d5db] rounded text-sm focus:border-[#c5a059] outline-none" placeholder="ورد ${row.day}..">
            </div>`;
    }
    return div;
}

function renderDailyEditors() {
    const farContainer = document.getElementById('farPastDailyContainer');
    farContainer.innerHTML = '';
    appState.rows.forEach((row, idx) => {
        farContainer.appendChild(renderSingleRowEditor(row, idx, 'farPast', 'farPastDailyContainer'));
    });

    const nearContainer = document.getElementById('nearPastDailyContainer');
    nearContainer.innerHTML = '';
    appState.rows.forEach((row, idx) => {
        nearContainer.appendChild(renderSingleRowEditor(row, idx, 'nearPast', 'nearPastDailyContainer'));
    });
}

function toggleDailyRowType(index, context, type) {
    if(!appState.rows[index][context]) appState.rows[index][context] = {};
    appState.rows[index][context].type = type;
    renderDailyEditors();
    renderPreview();
}

function updateDailyRow(index, context, field, value) {
    if(!appState.rows[index][context]) appState.rows[index][context] = { type: 'text' };
    appState.rows[index][context][field] = value;
    renderPreview();
}

function smartReorder() {
    const input = document.getElementById('aiInput').value;
    const status = document.getElementById('aiStatus');
    if (!input) return;
    let foundDay = null;
    for (const day of daysOfWeek) {
        if (input.includes(day)) {
            foundDay = day;
            break;
        }
    }
    if (foundDay) {
        reorderDays(foundDay);
        status.innerText = `تم تعديل البداية إلى: ${foundDay}`;
        status.className = "text-[10px] text-[#1a3c34] mt-2 h-4 font-bold";
    } else {
        status.innerText = 'لم أتمكن من فهم اليوم، يرجى كتابته بوضوح';
        status.className = "text-[10px] text-red-600 mt-2 h-4";
    }
}

function reorderDays(startDay) {
    const startIndex = daysOfWeek.indexOf(startDay);
    if (startIndex === -1) return;
    const newOrder = [...daysOfWeek.slice(startIndex), ...daysOfWeek.slice(0, startIndex)];
    appState.rows.forEach((row, index) => { row.day = newOrder[index]; });
    renderEditorRows();
    renderDailyEditors();
    renderPreview();
}

function renderEditorRows() {
    const container = document.getElementById('rowsContainer');
    container.innerHTML = '';
    appState.rows.forEach((row, index) => {
        const div = document.createElement('div');
        div.className = 'bg-[#fffdf9] p-4 rounded-xl border-2 border-[#c5a059]/20 transition-all hover:border-[#c5a059] shadow-sm mb-4';
        const isRange = row.type === 'range';
        div.innerHTML = `
            <div class="flex justify-between items-center mb-3 pb-2 border-b border-[#c5a059]/10">
                <span class="font-bold text-[#1a3c34] text-lg">${row.day}</span>
                <div class="flex bg-[#f0ebe0] rounded-lg p-1 gap-1">
                    <button onclick="toggleRowType(${index}, 'range')" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isRange ? 'bg-[#1a3c34] text-white shadow' : 'text-gray-500 hover:text-[#1a3c34]'}">آيات (أرقام)</button>
                    <button onclick="toggleRowType(${index}, 'text')" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!isRange ? 'bg-[#1a3c34] text-white shadow' : 'text-gray-500 hover:text-[#1a3c34]'}">نص حر</button>
                </div>
            </div>
        `;
        if (isRange) {
            div.innerHTML += `
                <div class="flex flex-col gap-3">
                    <div class="flex flex-col">
                        <label class="text-[10px] text-[#5d4037] font-bold mb-1">اسم السورة</label>
                        <input type="text" value="${row.surah || ''}" oninput="updateRow(${index}, 'surah', this.value)" class="w-full p-2.5 bg-white border border-[#d1d5db] rounded-lg text-base focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none" placeholder="مثال: البقرة">
                    </div>
                    <div class="flex gap-4">
                        <div class="flex-1 flex flex-col">
                            <label class="text-[10px] text-[#5d4037] font-bold mb-1">من آية</label>
                            <input type="text" value="${row.from || ''}" oninput="updateRow(${index}, 'from', this.value)" class="w-full p-2.5 bg-white border border-[#d1d5db] rounded-lg text-center text-base font-bold focus:border-[#c5a059] outline-none" placeholder="1">
                        </div>
                        <div class="flex items-center justify-center pt-4">
                            <svg class="text-[#c5a059]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                        </div>
                        <div class="flex-1 flex flex-col">
                            <label class="text-[10px] text-[#5d4037] font-bold mb-1">إلى آية</label>
                            <input type="text" value="${row.to || ''}" oninput="updateRow(${index}, 'to', this.value)" class="w-full p-2.5 bg-white border border-[#d1d5db] rounded-lg text-center text-base font-bold focus:border-[#c5a059] outline-none" placeholder="10">
                        </div>
                    </div>
                </div>`;
        } else {
            div.innerHTML += `
                <div class="flex flex-col">
                    <label class="text-[10px] text-[#5d4037] font-bold mb-1">نص الورد</label>
                    <input type="text" value="${row.text || ''}" oninput="updateRow(${index}, 'text', this.value)" class="w-full p-3 bg-white border border-[#d1d5db] rounded-lg text-base focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none" placeholder="اكتب المطلوب هنا...">
                </div>`;
        }
        container.appendChild(div);
    });
}

function updateRow(index, field, value) {
    appState.rows[index][field] = value;
    renderPreview();
}

function toggleRowType(index, type) {
    appState.rows[index].type = type;
    renderEditorRows();
    renderPreview();
}

function updateData() {
    appState.studentName = document.getElementById('inputName').value;
    appState.groupNumber = document.getElementById('inputGroup').value;
    appState.weekNumber = document.getElementById('inputWeek').value;
    appState.farPast = document.getElementById('inputFarPast').value;
    appState.nearPast = document.getElementById('inputNearPast').value;
    appState.preparation = document.getElementById('inputPrep').value;
    renderPreview();
}

function renderPreview() {
    document.getElementById('previewName').innerText = appState.studentName;
    document.getElementById('previewGroup').innerText = appState.groupNumber;
    document.getElementById('previewWeek').innerText = appState.weekNumber;
    
    // Render Far Past Column
    const farCol = document.getElementById('previewFarPastCol');
    farCol.innerHTML = '';
    if(appState.isFarPastMerged) {
        farCol.classList.remove('flex', 'flex-col', 'border-t-0'); 
        farCol.innerHTML = `<div id="previewFarPast" class="vertical-text font-bold text-2xl text-[#1a3c34]" data-color="#1a3c34">${appState.farPast}</div>`;
    } else {
        farCol.classList.add('flex', 'flex-col', 'border-t-0');
        farCol.innerHTML = appState.rows.map(row => `
            <div class="flex-1 flex items-center justify-center text-center border-b border-[#c5a059]/30 last:border-b-0 p-1">
                ${getCellHtml(row.farPast, row.farPast?.type !== 'range')}
            </div>
        `).join('');
    }

    // Render Near Past Column
    const nearCol = document.getElementById('previewNearPastCol');
    nearCol.innerHTML = '';
    if(appState.isNearPastMerged) {
        nearCol.classList.remove('flex', 'flex-col', 'border-t-0');
        nearCol.innerHTML = `<div id="previewNearPast" class="vertical-text font-bold text-2xl text-[#5d4037]" data-color="#5d4037">${appState.nearPast}</div>`;
    } else {
        nearCol.classList.add('flex', 'flex-col', 'border-t-0');
        nearCol.innerHTML = appState.rows.map(row => `
            <div class="flex-1 flex items-center justify-center text-center border-b border-[#c5a059]/30 last:border-b-0 p-1">
                ${getCellHtml(row.nearPast, row.nearPast?.type !== 'range')}
            </div>
        `).join('');
    }

    const prepEl = document.getElementById('previewPrep');
    prepEl.innerText = appState.preparation;
    prepEl.setAttribute('data-text', appState.preparation);

    const daysCol = document.getElementById('previewDaysCol');
    const hifzCol = document.getElementById('previewNewHifzCol');
    daysCol.innerHTML = '';
    hifzCol.innerHTML = '';

    appState.rows.forEach(row => {
        daysCol.innerHTML += `<div class="flex-1 flex items-center justify-center border-b border-[#c5a059]/30 last:border-b-0 font-bold text-2xl text-[#1a3c34]">${row.day}</div>`;
        hifzCol.innerHTML += `<div class="flex-1 flex items-center justify-center text-center border-b border-[#c5a059]/30 last:border-b-0 p-1 bg-white">${getCellHtml(row, row.type !== 'range')}</div>`;
    });
}

// --- Drawing Logic (Updated Font) ---
function drawVerticalText(text, color) {
    if (!text) return null;
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    const width = 540; const height = 250;
    tempCanvas.width = width; tempCanvas.height = height;
    ctx.direction = 'rtl'; ctx.font = 'bold 24px "Tajawal", sans-serif'; ctx.fillStyle = color;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = text.split('\n'); const lineHeight = 45;
    const startY = (height - ((lines.length - 1) * lineHeight)) / 2;
    lines.forEach((line, i) => { ctx.fillText(line, width / 2, startY + (i * lineHeight)); });
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = height; finalCanvas.height = width;
    const fCtx = finalCanvas.getContext('2d');
    fCtx.translate(0, width); fCtx.rotate(-Math.PI / 2); fCtx.drawImage(tempCanvas, 0, 0);
    return finalCanvas.toDataURL();
}

async function downloadImage() {
    const element = document.getElementById('pdfContent');
    const btn = document.getElementById('downloadBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="animate-pulse">جاري المعالجة...</span>';
    btn.disabled = true;
    const currentTransform = element.style.transform;
    element.style.transform = 'scale(1)';
    try {
        await document.fonts.ready;
        const verticalElements = document.querySelectorAll('.vertical-text');
        const restoreTasks = [];
        verticalElements.forEach(el => {
            const text = el.getAttribute('data-text') || el.innerText;
            const color = el.getAttribute('data-color') || '#1a3c34';
            // Only draw if element is visible
            if (el.offsetParent !== null && text) {
                const dataUrl = drawVerticalText(text, color);
                if (dataUrl) {
                    const originalHTML = el.innerHTML;
                    const img = document.createElement('img');
                    img.src = dataUrl;
                    el.classList.remove('vertical-text');
                    el.style.position = 'absolute'; el.style.top = '0'; el.style.left = '0';
                    el.style.width = '100%'; el.style.height = '100%';
                    el.style.display = 'flex'; el.style.alignItems = 'center'; el.style.justifyContent = 'center';
                    el.style.transform = 'none';
                    el.innerHTML = ''; el.appendChild(img);
                    restoreTasks.push(() => {
                        el.innerHTML = originalHTML; el.classList.add('vertical-text');
                        el.removeAttribute('style');
                    });
                }
            }
        });
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#f0ebe0', scrollY: -window.scrollY, logging: false, width: element.offsetWidth, height: element.offsetHeight });
        const link = document.createElement('a');
        link.download = `جدول_الحفظ_${appState.weekNumber}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
        restoreTasks.forEach(t => t());
    } catch (err) { console.error(err); alert("حدث خطأ أثناء إنشاء الصورة."); } 
    finally { element.style.transform = currentTransform; btn.innerHTML = originalText; btn.disabled = false; }
}

function openInstaPayEffect() {
    const modal = document.getElementById('instapayModal');
    const card = document.getElementById('cardObject');
    modal.classList.add('active');
    setTimeout(() => {
        card.classList.add('flipped');
        setTimeout(() => {
            window.location.href = 'https://ipn.eg/S/shaba1/instapay/0e3P4q';
            setTimeout(() => {
                modal.classList.remove('active');
                card.classList.remove('flipped');
            }, 2000);
        }, 2500);
    }, 600);
}

function fitPreviewToScreen() {
    const container = document.getElementById('previewContainer');
    const content = document.getElementById('pdfContent');
    if (!container || !content) return;
    const contentWidth = content.offsetWidth; 
    const containerWidth = container.clientWidth - 20;
    let scale = containerWidth / contentWidth;
    if (scale > 1) scale = 1;
    content.style.transform = `scale(${scale})`;
    const scaledHeight = content.offsetHeight * scale;
    container.style.height = `${scaledHeight + 40}px`;
}

// --- OCR Logic ---
async function processImage(input) {
    const file = input.files[0];
    if (!file) return;

    const statusObj = document.getElementById('ocrStatus');
    const uploadBtn = document.getElementById('uploadBtn');
    
    // UI Loading State
    statusObj.classList.remove('hidden');
    statusObj.innerText = 'جاري تحليل الصورة... (قد يستغرق وقتاً)';
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<span class="animate-pulse">جاري التحليل...</span>';

    try {
        const worker = await Tesseract.createWorker('ara'); // Arabic only
        
        // Progress logger
        worker.setParameters({
            tessedit_char_whitelist: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي٠١٢٣٤٥٦٧٨٩' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + ' \n\t-/:.()[]!@#$%^&*'
        });

        const ret = await worker.recognize(file);
        const text = ret.data.text;
        
        console.log("Raw OCR Text:", text); // Debugging
        
        parseOCRResult(text);
        await worker.terminate();

        statusObj.innerText = 'تم استخراج البيانات بنجاح!';
        statusObj.className = 'text-[10px] text-green-600 mt-1 min-h-[1rem] Font-bold';
        
    } catch (err) {
        console.error(err);
        statusObj.innerText = 'فشل في قراءة الصورة، يرجى المحاولة بصورة أوضح';
        statusObj.className = 'text-[10px] text-red-600 mt-1 min-h-[1rem]';
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = `
            <span class="hidden md:inline">قراءة من صورة</span>
            <span class="md:hidden">قراءة</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        `;
        // Clear input to allow re-uploading same file
        input.value = '';
    }
}

function parseOCRResult(text) {
    const lines = text.split('\n').filter(l => l.trim() !== '');
    
    // Helper to find value after a keyword
    const findValue = (keywords) => {
        for (let line of lines) {
            for (let kw of keywords) {
                if (line.includes(kw)) {
                    // Try to extract text after the keyword
                    // Removing the keyword and trimming
                    let val = line.replace(kw, '').trim();
                    // Clean up common OCR artifacts like colons or random dots at start
                    val = val.replace(/^[:.\-–\s]+/, '').trim();
                    if (val.length > 1) return val;
                }
            }
        }
        return null;
    };

    // 1. Student Data
    const name = findValue(['الطالب', 'اسم الطالب']);
    const group = findValue(['المجموعة', 'رقم المجموعة']);
    const week = findValue(['الأسبوع', 'عنوان الأسبوع']);

    if (name) {
        document.getElementById('inputName').value = name;
        appState.studentName = name;
    }
    if (group) {
        // extract just numbers if mixed
        const num = group.replace(/[^\d0-9٠-٩]/g, '');
        if (num) {
            document.getElementById('inputGroup').value = num;
            appState.groupNumber = num;
        }
    }
    if (week) {
        document.getElementById('inputWeek').value = week;
        appState.weekNumber = week;
    }

    // 2. Fixed Wird
    // This is harder because it's usually multi-line vertical text. 
    // We might just look for the headers and then take "everything" until the next section?
    // Or just look for specific known phrases.
    // For now, let's skip complex vertical text parsing unless we find simple keywords.

    // 3. Daily Content
    // Strategy: Look for lines that start with or contain a Day name.
    // The content is usually in the same line or next lines.
    // However, in a table structure read by OCR, lines might be mixed.
    // We will assume "DayName ... Content" or "Content ... DayName" structure.
    
    // We need to match rows in appState
    let newRows = JSON.parse(JSON.stringify(appState.rows));
    
    // Map of day names to index
    const dayMap = {};
    daysOfWeek.forEach((d, i) => dayMap[d] = i);

    for (let line of lines) {
        // Check if line contains a day
        let foundDay = null;
        for (let day of daysOfWeek) {
            if (line.includes(day)) {
                foundDay = day;
                break;
            }
        }

        if (foundDay) {
            const index = dayMap[foundDay];
            // Remove the day name from the line to see what's left
            let content = line.replace(foundDay, '').trim();
            // remove artifacts
            content = content.replace(/^[:.\-–|]+/, '').replace(/[:.\-–|]+$/, '').trim();
            
            if (content.length > 2) {
                // Try to guess if it is a Surah range or Text
                // Check if "سورة" exists
                if (content.includes('سورة')) {
                    newRows[index].type = 'range';
                    
                    // Try to extract Surah Name
                    const surahMatch = content.match(/سورة\s+([\u0600-\u06FF\s]+)/);
                    if (surahMatch) {
                        newRows[index].surah = surahMatch[1].trim().split(' ')[0]; // Take first word after surah usually
                    }

                    // Try to extract numbers
                    // Look for patterns like "from ... to ..." or just numbers
                    // Matches arabic or english digits
                    const numbers = content.match(/([0-9٠-٩]+)/g);
                    if (numbers && numbers.length >= 2) {
                        newRows[index].from = numbers[0];
                        newRows[index].to = numbers[1];
                    }
                } else {
                    // Assume text
                    // If it looks like just numbers, maybe it failed range detection
                    // But safe default is text
                    newRows[index].type = 'text';
                    newRows[index].text = content;
                }
            }
        }
    }
    
    appState.rows = newRows;
    renderEditorRows();
    renderDailyEditors();
    updateData(); // Triggers preview update
}
