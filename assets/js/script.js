        // Tailwind script
        function initializeTailwind() {
            document.documentElement.style.setProperty('--accent', '#b00b69');
        }
        
        function updateRainValue() {
            const val = document.getElementById('rain').value;
            document.getElementById('rain-value').innerText = val;
        }
        
        function updateLevelValue() {
            const val = parseFloat(document.getElementById('level').value).toFixed(1);
            document.getElementById('level-value').innerText = val;
        }
        
        // Local sector data used to populate the intelligence report
        const locationData = {
            "doomdooma-b": { label: "Doomdooma Circle • Sector B (Hapjan)", river: "Burhi Dihing", villages: ["Hapjan", "Phillobari", "Borhapjan"], population: 1240 },
            "margherita-mulang": { label: "Margherita • Mulang", river: "Burhi Dihing", villages: ["Mulang", "Tirap Confluence", "Dirak Sumoni"], population: 1580 },
            "tinsukia-sadar": { label: "Tinsukia Sadar • Guijan / Dibru", river: "Dibru", villages: ["Guijan", "Dibru Char", "Sadar Ghat"], population: 980 },
            "sadiya": { label: "Sadiya Sub-division", river: "Brahmaputra", villages: ["Sadiya Char", "Kundil Kata", "Bezera"], population: 2100 },
            "doomdooma-a": { label: "Doomdooma Circle • Sector A (Saikhowa)", river: "Burhi Dihing", villages: ["Saikhowa", "Doomdooma Pathar", "Bordubi"], population: 1350 }
        };

        function runFloodPrediction() {
            const location = document.getElementById('location').value;
            const rain = parseFloat(document.getElementById('rain').value);
            const level = parseFloat(document.getElementById('level').value);
            
            // Simple but realistic simulation model
            let baseRisk = 0.25;
            let locationFactor = 1.0;
            let leadTime = "36-48 hours";
            
            if (location === "margherita-mulang") {
                baseRisk = 0.48;
                locationFactor = 1.35;
                leadTime = "24-36 hours";
            } else if (location === "doomdooma-b") {
                baseRisk = 0.38;
                locationFactor = 1.15;
            } else if (location === "sadiya") {
                baseRisk = 0.42;
                locationFactor = 1.25;
                leadTime = "30-42 hours";
            } else if (location === "doomdooma-a") {
                baseRisk = 0.45;
                locationFactor = 1.20;
            }
            
            // Weighted calculation
            const rainNorm = Math.min(rain / 220, 1.0);
            const levelNorm = Math.max(0, Math.min((level + 0.5) / 4.0, 1.0));
            
            let riskScore = (baseRisk * 0.25 + rainNorm * 0.35 + levelNorm * 0.40) * locationFactor;
            riskScore = Math.max(0.08, Math.min(riskScore, 0.96));
            
            const riskPercent = Math.round(riskScore * 100);
            const confidence = Math.min(97, Math.round(89 + (rainNorm + levelNorm) * 4));
            
            let riskClass = 'risk-low';
            let riskText = 'LOW RISK';
            let actions = '';
            
            if (riskPercent >= 72) {
                riskClass = 'risk-high';
                riskText = 'HIGH RISK — IMMEDIATE ACTION';
                actions = `
                    <div class="flex gap-x-2"><i class="fa-solid fa-triangle-exclamation text-red-600 mt-0.5"></i> <span>Alert Zonal Officer immediately. Activate pre-evacuation for low-lying villages.</span></div>
                    <div class="flex gap-x-2"><i class="fa-solid fa-ship text-red-600 mt-0.5"></i> <span>Pre-position rescue boats at nearest high-ground points.</span></div>
                    <div class="flex gap-x-2"><i class="fa-solid fa-house text-red-600 mt-0.5"></i> <span>Recommend moving livestock &amp; vulnerable families to identified relief camps tonight.</span></div>
                    <div class="flex gap-x-2"><i class="fa-solid fa-hospital text-red-600 mt-0.5"></i> <span>Notify health centres to prepare for possible casualties.</span></div>
                `;
            } else if (riskPercent >= 48) {
                riskClass = 'risk-medium';
                riskText = 'MODERATE RISK — MONITOR CLOSELY';
                actions = `
                    <div class="flex gap-x-2"><i class="fa-solid fa-eye text-amber-600 mt-0.5"></i> <span>Increase monitoring frequency of river gauges. Inform Sector Officers.</span></div>
                    <div class="flex gap-x-2"><i class="fa-solid fa-users text-amber-600 mt-0.5"></i> <span>Prepare community volunteers and verify relief camp readiness.</span></div>
                    <div class="flex gap-x-2"><i class="fa-solid fa-bell text-amber-600 mt-0.5"></i> <span>Issue advisory via WhatsApp groups and local leaders.</span></div>
                `;
            } else {
                actions = `
                    <div class="flex gap-x-2"><i class="fa-solid fa-circle-check text-emerald-600 mt-0.5"></i> <span>Continue routine monitoring. No immediate evacuation recommended.</span></div>
                    <div class="flex gap-x-2"><i class="fa-solid fa-rotate text-emerald-600 mt-0.5"></i> <span>Re-run model in 6 hours or after next rainfall update.</span></div>
                `;
            }

            const sector = locationData[location] || locationData["doomdooma-b"];

            // Hide any previous results, show the AI processing pipeline
            const loadingDiv = document.getElementById('prediction-loading');
            const resultsDiv = document.getElementById('prediction-results');
            resultsDiv.classList.add('hidden');
            loadingDiv.classList.remove('hidden');
            loadingDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const steps = [
                "Connecting to Weather Database...",
                "Collecting Rainfall Data...",
                "Reading River Gauge Sensors...",
                "Processing Satellite Imagery...",
                "Running AI Prediction Model...",
                "Calculating Flood Probability...",
                "Generating Emergency Report..."
            ];
            const statusMsgEl = document.getElementById('prediction-status-msg');
            const progressFill = document.getElementById('prediction-progress-fill');
            const logEl = document.getElementById('prediction-status-log');
            logEl.innerHTML = '';

            const totalDuration = 4500; // ms, ~4-5 seconds
            const stepDuration = totalDuration / steps.length;

            steps.forEach((step, i) => {
                setTimeout(() => {
                    statusMsgEl.textContent = step;
                    progressFill.style.width = Math.round(((i + 1) / steps.length) * 100) + '%';
                    const line = document.createElement('div');
                    line.className = 'flex items-center gap-x-2 opacity-0 transition-opacity duration-300';
                    line.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i><span>${step}</span>`;
                    logEl.appendChild(line);
                    requestAnimationFrame(() => line.classList.remove('opacity-0'));
                }, stepDuration * i);
            });

            setTimeout(() => {
                loadingDiv.classList.add('hidden');
                resultsDiv.classList.remove('hidden');
                resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

                document.getElementById('risk-label').innerHTML = `<span class="px-4 py-1.5 text-xs rounded-2xl font-bold border ${riskClass}">${riskText}</span>`;
                document.getElementById('risk-percent').innerHTML = riskPercent + '<span class="text-xl align-super">%</span>';
                document.getElementById('lead-time').innerHTML = leadTime;
                document.getElementById('actions-list').innerHTML = actions;
                document.getElementById('report-location').innerText = sector.label;
                document.getElementById('report-rainfall').innerText = rain + ' mm';
                document.getElementById('report-river-level').innerText = level.toFixed(1) + ' m above danger mark';
                document.getElementById('report-confidence').innerHTML = confidence + '<span class="text-xl align-super">%</span>';
                document.getElementById('report-population').innerText = '~' + sector.population.toLocaleString('en-IN') + ' people';
                document.getElementById('report-villages').innerHTML = sector.villages.map(v =>
                    `<span class="px-3 py-1 text-xs font-medium bg-slate-800 text-slate-200 rounded-full flex items-center gap-x-1.5"><i class="fa-solid fa-location-dot text-pink-600 text-[10px]"></i>${v}</span>`
                ).join('');
            }, totalDuration + 300);

            // Store for alert simulation
            window.lastPrediction = { location, riskPercent, riskText };
        }
        
        function simulateAlertSent() {
            const btns = event.currentTarget;
            const originalText = event.target.innerHTML;
            
            const alertBanner = document.createElement('div');
            alertBanner.className = `fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-3xl shadow-xl flex items-center gap-x-3 z-[100]`;
            alertBanner.innerHTML = `
                <i class="fa-solid fa-check-double"></i>
                <span class="font-medium">Alert successfully sent to Zonal Officer &amp; DEOC. Confirmation received.</span>
            `;
            document.body.appendChild(alertBanner);
            
            setTimeout(() => {
                alertBanner.style.transition = 'all 0.3s ease';
                alertBanner.style.opacity = '0';
                setTimeout(() => alertBanner.remove(), 300);
            }, 2800);
        }
        
        function simulateCitizenAlert() {
            const banner = document.createElement('div');
            banner.className = `fixed bottom-6 right-6 max-w-xs bg-slate-900 border border-emerald-200 shadow-xl rounded-3xl p-5 text-sm z-[100]`;
            banner.innerHTML = `
                <div class="flex gap-x-3">
                    <i class="fa-solid fa-mobile-screen-button text-emerald-600 text-xl mt-0.5"></i>
                    <div>
                        <div class="font-semibold">Broadcast sent via WhatsApp + SMS</div>
                        <div class="text-xs text-slate-400 mt-1">1,842 registered users in selected sector notified in Assamese &amp; Hindi.</div>
                        <div class="text-[10px] text-emerald-600 mt-2 font-medium">Delivery rate: 94% • Avg. open time: 7 min</div>
                    </div>
                </div>
            `;
            document.body.appendChild(banner);
            
            setTimeout(() => {
                banner.style.transition = 'all 0.4s ease';
                banner.style.opacity = '0';
                setTimeout(() => banner.parentNode.removeChild(banner), 400);
            }, 4200);
        }
        
        function runErosionAnalysis() {
            const container = document.getElementById('erosion-panel-content');

            const steps = [
                "Loading Satellite Images...",
                "Detecting River Bank...",
                "Comparing Historical Data...",
                "Running Change Detection Model...",
                "Generating Assessment..."
            ];

            container.innerHTML = `
                <div class="py-1">
                    <div class="flex items-center gap-x-3 mb-4">
                        <div class="relative w-9 h-9 shrink-0">
                            <div class="absolute inset-0 rounded-full border-4 border-amber-100"></div>
                            <div class="absolute inset-0 rounded-full border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                        </div>
                        <div id="erosion-status-msg" class="text-xs font-semibold text-slate-200">${steps[0]}</div>
                    </div>
                    <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div id="erosion-progress-fill" class="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full transition-all duration-300 ease-out" style="width:0%"></div>
                    </div>
                    <div id="erosion-status-log" class="mt-4 space-y-1 text-[10px] font-mono text-slate-400"></div>
                </div>
            `;

            const totalDuration = 3000; // ms, ~3 seconds
            const stepDuration = totalDuration / steps.length;
            const statusEl = document.getElementById('erosion-status-msg');
            const fillEl = document.getElementById('erosion-progress-fill');
            const logEl = document.getElementById('erosion-status-log');

            steps.forEach((step, i) => {
                setTimeout(() => {
                    if (statusEl) statusEl.textContent = step;
                    if (fillEl) fillEl.style.width = Math.round(((i + 1) / steps.length) * 100) + '%';
                    if (logEl) {
                        const line = document.createElement('div');
                        line.className = 'flex items-center gap-x-2 opacity-0 transition-opacity duration-300';
                        line.innerHTML = `<i class="fa-solid fa-check text-emerald-500"></i><span>${step}</span>`;
                        logEl.appendChild(line);
                        requestAnimationFrame(() => line.classList.remove('opacity-0'));
                    }
                }, stepDuration * i);
            });

            setTimeout(() => {
                container.innerHTML = `
                    <div class="prediction-result">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-x-2">
                                <div class="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center shrink-0">
                                    <i class="fa-solid fa-water text-white text-xs"></i>
                                </div>
                                <div>
                                    <div class="text-[9px] tracking-[2px] text-slate-400 font-bold">RESCUENOVA AI</div>
                                    <div class="font-semibold text-xs text-slate-100">Erosion Assessment</div>
                                </div>
                            </div>
                            <span class="text-[10px] px-2.5 py-1 bg-red-100 text-red-700 rounded-full font-bold">HIGH PRIORITY</span>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div class="border border-slate-700 rounded-xl p-2.5">
                                <div class="text-[9px] text-slate-400 font-semibold tracking-wide">LOCATION</div>
                                <div class="font-semibold text-slate-100 mt-0.5">Mulang</div>
                            </div>
                            <div class="border border-slate-700 rounded-xl p-2.5">
                                <div class="text-[9px] text-slate-400 font-semibold tracking-wide">RIVER</div>
                                <div class="font-semibold text-slate-100 mt-0.5">Burhi Dihing</div>
                            </div>
                            <div class="border border-slate-700 rounded-xl p-2.5">
                                <div class="text-[9px] text-slate-400 font-semibold tracking-wide">BANK LOSS</div>
                                <div class="font-semibold text-red-600 mt-0.5">14.3 metres</div>
                            </div>
                            <div class="border border-slate-700 rounded-xl p-2.5">
                                <div class="text-[9px] text-slate-400 font-semibold tracking-wide">TREND</div>
                                <div class="font-semibold text-red-600 mt-0.5 flex items-center gap-x-1"><i class="fa-solid fa-arrow-trend-up"></i> Increasing</div>
                            </div>
                        </div>

                        <div class="mt-3 border border-slate-700 rounded-xl p-3">
                            <div class="flex justify-between text-[10px] font-semibold text-slate-400 mb-1.5">
                                <span>AI CONFIDENCE</span><span class="text-slate-200">91%</span>
                            </div>
                            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div class="h-full bg-emerald-500 rounded-full" style="width:91%"></div>
                            </div>
                        </div>

                        <div class="mt-3 text-xs bg-red-950/40 border border-red-900 rounded-xl p-3 flex items-center gap-x-2">
                            <i class="fa-solid fa-triangle-exclamation text-red-400"></i>
                            <span class="font-semibold text-red-400">Recommendation: Immediate inspection</span>
                        </div>

                        <div class="mt-3">
                            <div class="text-[10px] font-bold tracking-wider text-slate-400 mb-1.5">SUGGESTED ACTION</div>
                            <div class="space-y-1.5 text-xs text-slate-200">
                                <div class="flex items-center gap-x-2"><i class="fa-solid fa-check text-emerald-600"></i> Inspect embankment</div>
                                <div class="flex items-center gap-x-2"><i class="fa-solid fa-check text-emerald-600"></i> Deploy survey team</div>
                                <div class="flex items-center gap-x-2"><i class="fa-solid fa-check text-emerald-600"></i> Monitor every 24 hours</div>
                            </div>
                        </div>

                        <button onclick="window.location.reload()" class="mt-4 w-full py-2 text-xs border border-amber-600 hover:bg-amber-950 text-amber-400 rounded-2xl font-medium">Download Full GeoTIFF Report</button>
                    </div>
                `;
            }, totalDuration + 200);
        }
        
        let chatHistory = [];
        
        function sendChatMessage() {
            const input = document.getElementById('chat-input');
            const msg = input.value.trim();
            if (!msg) return;
            
            const chatWindow = document.getElementById('chat-window');
            
            // User message
            const userDiv = document.createElement('div');
            userDiv.className = 'flex justify-end';
            userDiv.innerHTML = `<div class="bg-pink-700 text-white px-3 py-1.5 rounded-2xl text-xs max-w-[75%]">${msg}</div>`;
            chatWindow.appendChild(userDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
            
            input.value = '';
            
            // AI response after short delay
            setTimeout(() => {
                let response = "Thank you for your query. Our models are continuously updated with the latest rainfall and river data.";
                
                const lowerMsg = msg.toLowerCase();
                
                if (lowerMsg.includes('flood') || lowerMsg.includes('water') || lowerMsg.includes('rising')) {
                    response = "Current models show elevated risk in several Doomdooma and Margherita sectors. Please tell me your exact village or sector so I can give personalized guidance and nearest relief camp information.";
                } else if (lowerMsg.includes('erosion') || lowerMsg.includes('bank') || lowerMsg.includes('mulang')) {
                    response = "The Mulang area (Burhi Dihing-Tirap confluence) shows accelerated erosion of ~14m in the last two weeks according to our Sentinel analysis. We recommend urgent inspection by the Water Resources department.";
                } else if (lowerMsg.includes('village') || lowerMsg.includes('my area')) {
                    response = "Please specify your village name or nearest landmark. I can then provide the current risk level, evacuation route to the pre-listed relief camp, and livestock advice from the District Plan.";
                } else if (lowerMsg.includes('camp') || lowerMsg.includes('shelter')) {
                    response = "Relief camps are pre-identified in the Tinsukia DDMP. For most Mulang villages, the nearest is Gopinath Bordoloi LP School or Ledo TE LP School depending on exact location. Would you like directions?";
                } else if (lowerMsg.includes('alert') || lowerMsg.includes('warning')) {
                    response = "I can help you subscribe to location-based alerts via WhatsApp. Our system sends natural language warnings in Assamese/Hindi/English with clear action steps when risk crosses thresholds.";
                }
                
                const aiDiv = document.createElement('div');
                aiDiv.className = 'flex gap-x-2';
                aiDiv.innerHTML = `<div class="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-2xl text-xs max-w-[80%] text-slate-200">${response}</div>`;
                chatWindow.appendChild(aiDiv);
                chatWindow.scrollTop = chatWindow.scrollHeight;
            }, 850);
        }
        
        function scrollToDemo() {
            document.getElementById('demo').scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                document.getElementById('location').focus();
            }, 800);
        }
        
        function initializeSliders() {
            // Set initial values
            document.getElementById('rain').value = 95;
            document.getElementById('level').value = 1.2;
            document.getElementById('rain-value').innerText = '95';
            document.getElementById('level-value').innerText = '1.2';
            
            // Optional: Auto-run a sample prediction on load for demo effect
            setTimeout(() => {
                // Uncomment if you want auto demo
                // document.getElementById('prediction-results').classList.remove('hidden');
            }, 1200);
        }
        
        function initializeEverything() {
            initializeTailwind();
            initializeSliders();
            
            // Bonus: Make the chat window have a welcome message already (already in HTML)
            
            // Keyboard accessibility hint
            console.log('%c[RescueNova AI] Functional prototype ready. All interactive elements (prediction, erosion, chatbot) are fully working in JS.', 'color:#64748b');
            
            // Easter egg: Press "?" to focus location selector
            document.addEventListener('keydown', function(e) {
                if (e.key === '?' && document.activeElement.tagName === 'BODY') {
                    e.preventDefault();
                    document.getElementById('demo').scrollIntoView({block: 'center'});
                    setTimeout(() => document.getElementById('location').focus(), 600);
                }
            });
        }
        
        // Boot
        window.onload = initializeEverything;
