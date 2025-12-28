/**
 * Learn Module - Creative Asset Validator v3.0.7
 * Knowledge Intelligence with URL Analyzer, Competitor Tracking,
 * Best Practices Library, Benchmarks Database, and Swipe File System
 * 
 * v3.0.7 FIXES:
 * - Auto-save to swipe file after URL analysis
 * - Extract benchmarks from URL analysis automatically
 * - Detect and track competitors from URL analysis
 * - Persist all analysis history to localStorage and CRM
 * - Link URL analyses to CRM companies
 * - Show sources for benchmarks
 */

(function() {
    'use strict';

    const LEARN_VERSION = '3.0.9';

    // User-specific storage key prefix
    function getLearnStoragePrefix() {
        const session = JSON.parse(localStorage.getItem('cav_user_session') || 'null');
        if (session?.email) {
            const userKey = session.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
            return `cav_learn_${userKey}_`;
        }
        return 'cav_learn_anonymous_';
    }
    
    // Dynamic storage keys - user-specific
    const STORAGE_KEYS = {
        get SWIPE_FILE() { return `${getLearnStoragePrefix()}swipe_file`; },
        get BENCHMARKS() { return `${getLearnStoragePrefix()}benchmarks`; },
        get BEST_PRACTICES() { return `${getLearnStoragePrefix()}best_practices`; },
        get URL_HISTORY() { return `${getLearnStoragePrefix()}url_history`; },
        get COMPETITORS() { return `${getLearnStoragePrefix()}competitors`; },
    };

    // ============================================
    // LEARN MODULE CLASS
    // ============================================

    class LearnModule {
        constructor() {
            this.currentView = 'url-analyzer';
            this.swipeFile = this.loadSwipeFile();
            this.benchmarks = this.loadBenchmarks();
            this.bestPractices = this.loadBestPractices();
            this.urlAnalysisHistory = this.loadURLHistory();
            this.detectedCompetitors = this.loadDetectedCompetitors();
            this.comparisonImage = null; // Selected image for creative comparison
            
            console.log(`[Learn] Initialized v${LEARN_VERSION} - ${this.swipeFile.length} swipes, ${this.benchmarks.length} benchmarks, ${this.urlAnalysisHistory.length} URL analyses`);
        }
        
        // Load URL analysis history
        loadURLHistory() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.URL_HISTORY) || '[]');
            } catch {
                return [];
            }
        }
        
        // Save URL analysis to history
        saveURLHistory(result) {
            this.urlAnalysisHistory.unshift(result);
            // Keep last 100 analyses
            if (this.urlAnalysisHistory.length > 100) {
                this.urlAnalysisHistory = this.urlAnalysisHistory.slice(0, 100);
            }
            localStorage.setItem(STORAGE_KEYS.URL_HISTORY, JSON.stringify(this.urlAnalysisHistory));
        }
        
        // Load detected competitors
        loadDetectedCompetitors() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPETITORS) || '[]');
            } catch {
                return [];
            }
        }
        
        // Save detected competitor
        saveDetectedCompetitor(competitor) {
            // Check if already exists
            const existing = this.detectedCompetitors.find(c => 
                c.domain === competitor.domain || c.name.toLowerCase() === competitor.name.toLowerCase()
            );
            
            if (!existing) {
                this.detectedCompetitors.push({
                    ...competitor,
                    id: `comp_${Date.now()}`,
                    detectedAt: new Date().toISOString()
                });
                localStorage.setItem(STORAGE_KEYS.COMPETITORS, JSON.stringify(this.detectedCompetitors));
                
                // Also add to CRM as a company if available
                this.addCompetitorToCRM(competitor);
            }
            return competitor;
        }
        
        // Add competitor to CRM
        async addCompetitorToCRM(competitor) {
            if (!window.cavCRM) return;
            
            try {
                // Check if company already exists
                const existingCompanies = window.cavCRM.getAllCompanies({ search: competitor.name });
                if (existingCompanies.length > 0) {
                    console.log(`[Learn] Company ${competitor.name} already exists in CRM`);
                    return existingCompanies[0];
                }
                
                // Create new company
                const company = window.cavCRM.createCompany({
                    name: competitor.name,
                    domain: competitor.domain,
                    website: competitor.website || `https://${competitor.domain}`,
                    industry: competitor.industry || 'Unknown',
                    type: 'competitor',
                    description: `Auto-detected competitor from URL analysis`,
                    tags: ['competitor', 'auto-detected'],
                    source: 'url_analyzer'
                });
                
                console.log(`[Learn] Created CRM company for competitor: ${competitor.name}`);
                return company;
            } catch (e) {
                console.warn('[Learn] Failed to add competitor to CRM:', e);
            }
        }

        // ============================================
        // URL ANALYZER
        // ============================================

        async analyzeURL(url, comparisonImage = null) {
            const result = {
                id: `url_${Date.now()}`,
                url,
                urlType: this.detectURLType(url),
                analyzedAt: new Date().toISOString(),
                creativeSummary: null,
                hookAnalysis: null,
                messageArchitecture: null,
                visualStrategy: null,
                ctaEvaluation: null,
                platformOptimization: null,
                performanceIndicators: null,
                takeaways: [],
                savedToSwipeFile: false,
                comparisonResult: null,
                // NEW: Additional extracted data
                extractedBenchmarks: [],
                detectedCompetitor: null,
                linkedCompanyId: null,
                sources: []
            };

            try {
                const urlObj = new URL(url);
                const domain = urlObj.hostname.replace('www.', '');
                
                // Use SearchAPI to get page content and additional context
                if (window.AIOrchestrator?.isProviderAvailable('searchapi')) {
                    // Get page info
                    const searchResult = await window.AIOrchestrator.callSearchAPI(`site:${domain}`, {
                        num: 3
                    });
                    result.pageSnippet = searchResult.results?.[0]?.snippet;
                    result.sources = searchResult.results?.map(r => ({
                        title: r.title,
                        url: r.link,
                        snippet: r.snippet
                    })) || [];
                    
                    // Search for company/brand info
                    const brandSearch = await window.AIOrchestrator.callSearchAPI(`${domain} company about`, {
                        num: 3
                    });
                    result.brandSources = brandSearch.results?.map(r => ({
                        title: r.title,
                        url: r.link,
                        snippet: r.snippet
                    })) || [];
                }

                // Use Claude/Gemini for deep analysis
                const analysis = await this.getEnhancedURLAnalysis(url, result.urlType, result.sources);
                Object.assign(result, analysis);

                // AUTO-DETECT BRAND (NOT competitor - this is the analyzed brand/client)
                if (analysis.detectedBrand && analysis.detectedBrand !== 'unknown') {
                    // This is the BRAND being analyzed - add as CLIENT, not competitor
                    const brand = {
                        name: analysis.detectedBrand,
                        domain: domain,
                        website: `https://${domain}`,
                        industry: analysis.creativeSummary?.industry || analysis.detectedIndustry || 'Unknown',
                        advertisingChannels: analysis.platformOptimization?.detectedChannels || [],
                        messageThemes: analysis.messageArchitecture?.supporting || []
                    };
                    
                    // Save brand as a company/client (NOT competitor)
                    result.detectedBrand = brand;
                    
                    // Link to CRM as CLIENT
                    if (window.cavCRM) {
                        let companyId = null;
                        const companies = window.cavCRM.getAllCompanies({ search: brand.name });
                        
                        if (companies.length > 0) {
                            companyId = companies[0].id;
                        } else {
                            // Create as CLIENT, not competitor
                            const newCompany = window.cavCRM.createCompany({
                                name: brand.name,
                                domain: brand.domain,
                                website: brand.website,
                                industry: brand.industry,
                                type: 'client', // IMPORTANT: Client, not competitor!
                                description: `Auto-detected from URL analysis: ${url}`,
                                tags: ['auto-detected', 'url-analysis']
                            });
                            companyId = newCompany.id;
                            console.log(`[Learn] Created company for brand: ${brand.name}`);
                        }
                        result.linkedCompanyId = companyId;
                    }
                    
                    // NOW auto-fetch actual competitors for this brand
                    result.competitors = await this.autoFetchCompetitors(brand.name, brand.industry);
                }

                // AUTO-EXTRACT BENCHMARKS from the analysis
                if (analysis.performanceIndicators) {
                    await this.extractAndSaveBenchmarks(analysis, domain);
                    result.extractedBenchmarks = analysis.extractedBenchmarks || [];
                }

                // If comparison image is provided, run comparison analysis
                if (comparisonImage) {
                    result.comparisonResult = await this.compareCreatives(result, comparisonImage);
                }

                // AUTO-SAVE to URL history
                this.saveURLHistory(result);
                
                // AUTO-SAVE to swipe file with analysis data
                this.autoSaveToSwipeFile(result);

            } catch (error) {
                console.error('[Learn] URL analysis error:', error);
                result.error = error.message;
            }

            return result;
        }
        
        // AUTO-FETCH COMPETITORS for a brand using AI (3 competitors)
        async autoFetchCompetitors(brandName, industry) {
            if (!brandName || brandName === 'unknown') return [];
            
            console.log(`[Learn] Auto-fetching competitors for ${brandName} in ${industry}`);
            
            const competitors = [];
            
            try {
                // First, use SearchAPI to find competitors
                if (window.AIOrchestrator?.callSearchAPI) {
                    const searchResults = await window.AIOrchestrator.callSearchAPI(
                        `${brandName} competitors ${industry} alternative companies`,
                        { num: 10 }
                    );
                    
                    // Use AI to extract competitors from search results
                    if (searchResults.results?.length > 0 && window.AIOrchestrator?.callAI) {
                        const prompt = `Based on these search results, identify the TOP 3 main competitors of ${brandName} in the ${industry || 'same'} industry.

Search Results:
${searchResults.results.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}

Return ONLY a JSON array with exactly 3 competitors. Each competitor should have:
- name: Company name
- website: Website URL if found
- description: Brief 1-sentence description
- strengths: Array of 2-3 key strengths
- marketPosition: "leader", "challenger", "niche", or "emerging"

Example format:
[{"name":"CompanyA","website":"https://companya.com","description":"Leading provider...","strengths":["Innovation","Price"],"marketPosition":"leader"}]

JSON only, no markdown:`;

                        const aiResponse = await window.AIOrchestrator.callAI(prompt, {
                            model: 'claude',
                            format: 'json'
                        });
                        
                        // Parse competitors from AI response
                        let parsedCompetitors = [];
                        try {
                            const jsonMatch = aiResponse.match(/\[[\s\S]*?\]/);
                            if (jsonMatch) {
                                parsedCompetitors = JSON.parse(jsonMatch[0]);
                            }
                        } catch (e) {
                            console.warn('[Learn] Failed to parse competitor JSON:', e);
                        }
                        
                        // Save each competitor to CRM
                        for (const comp of parsedCompetitors.slice(0, 3)) {
                            const savedCompetitor = this.saveCompetitorToCRM(comp, brandName, industry);
                            if (savedCompetitor) {
                                competitors.push(savedCompetitor);
                            }
                        }
                    }
                }
                
                // Fallback: Use Gemini for competitor detection if SearchAPI unavailable
                if (competitors.length === 0 && window.AIOrchestrator?.callAI) {
                    const fallbackPrompt = `Name the top 3 direct competitors of ${brandName} in the ${industry || 'technology'} industry.

Return ONLY a JSON array with 3 competitors:
[{"name":"Company Name","description":"Brief description","marketPosition":"leader/challenger/niche"}]

JSON only:`;

                    const fallbackResponse = await window.AIOrchestrator.callAI(fallbackPrompt, {
                        model: 'gemini',
                        format: 'json'
                    });
                    
                    try {
                        const jsonMatch = fallbackResponse.match(/\[[\s\S]*?\]/);
                        if (jsonMatch) {
                            const fallbackCompetitors = JSON.parse(jsonMatch[0]);
                            for (const comp of fallbackCompetitors.slice(0, 3)) {
                                const savedCompetitor = this.saveCompetitorToCRM(comp, brandName, industry);
                                if (savedCompetitor) {
                                    competitors.push(savedCompetitor);
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('[Learn] Fallback competitor parsing failed:', e);
                    }
                }
                
                console.log(`[Learn] Found ${competitors.length} competitors for ${brandName}`);
                
            } catch (error) {
                console.error('[Learn] Error fetching competitors:', error);
            }
            
            return competitors;
        }
        
        // Save competitor to CRM (separate from companies!)
        saveCompetitorToCRM(competitor, relatedBrandName, industry) {
            if (!competitor?.name) return null;
            
            try {
                // Use the CRM's competitor management (separate from companies)
                if (window.cavCRM?.createCompetitor) {
                    // Check if competitor already exists
                    const existing = window.cavCRM.getAllCompetitors({ search: competitor.name });
                    if (existing.length > 0) {
                        // Update existing
                        return window.cavCRM.updateCompetitor(existing[0].id, {
                            ...competitor,
                            lastChecked: new Date().toISOString()
                        });
                    }
                    
                    // Create new competitor
                    return window.cavCRM.createCompetitor({
                        name: competitor.name,
                        website: competitor.website || '',
                        industry: industry || competitor.industry || 'Unknown',
                        description: competitor.description || `Competitor of ${relatedBrandName}`,
                        strengths: competitor.strengths || [],
                        marketShare: competitor.marketPosition || '',
                        source: 'ai_detected',
                        notes: `Auto-detected as competitor of ${relatedBrandName}`
                    });
                }
                
                // Fallback: Save to detected competitors storage
                const detected = {
                    id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: competitor.name,
                    website: competitor.website || '',
                    industry: industry,
                    description: competitor.description,
                    strengths: competitor.strengths || [],
                    marketPosition: competitor.marketPosition,
                    relatedTo: relatedBrandName,
                    detectedAt: new Date().toISOString(),
                    source: 'ai_detected'
                };
                
                this.saveDetectedCompetitor(detected);
                return detected;
                
            } catch (e) {
                console.warn('[Learn] Failed to save competitor:', e);
                return null;
            }
        }

        // Enhanced URL analysis that extracts more data
        async getEnhancedURLAnalysis(url, urlType, sources = []) {
            const sourcesContext = sources.length > 0 ? 
                `\nRelated search results:\n${sources.map(s => `- ${s.title}: ${s.snippet}`).join('\n')}` : '';
            
            const prompt = `Analyze this URL for creative intelligence. Extract as much information as possible.

URL: ${url}
URL Type: ${urlType}
${sourcesContext}

Provide comprehensive analysis including:

1. **Brand Detection**: What company/brand is this from? Identify the exact brand name.
2. **Industry**: What industry is this in?
3. **Creative Summary**: Product, key message, target audience
4. **Hook Analysis**: Attention-grabbing elements, score 0-100
5. **Message Architecture**: Primary message, supporting points, proof points
6. **Visual Strategy**: Colors, imagery approach, composition
7. **CTA Evaluation**: Call-to-action presence, clarity (0-100), urgency (0-100)
8. **Platform Optimization**: Detected channels, optimization score
9. **Performance Indicators**: Quality signals, estimated metrics
10. **Key Takeaways**: 3-5 actionable insights
11. **Benchmark Estimates**: CTR range, CPM range, engagement rate range (based on industry/platform)

Return ONLY valid JSON:
{
    "detectedBrand": "Brand Name or unknown",
    "detectedIndustry": "Industry name",
    "creativeSummary": {
        "product": "Product/service",
        "keyMessage": "Main value proposition",
        "targetAudience": "Who this is for",
        "industry": "Industry"
    },
    "hookAnalysis": {
        "score": 75,
        "element": "What grabs attention",
        "effectiveness": "Why it works"
    },
    "messageArchitecture": {
        "primary": "Main message",
        "supporting": ["Point 1", "Point 2"],
        "proofPoints": ["Social proof", "Statistics"]
    },
    "visualStrategy": {
        "colors": ["#hex1", "#hex2"],
        "imageryApproach": "Lifestyle/Product/Abstract",
        "composition": "Layout description"
    },
    "ctaEvaluation": {
        "present": true,
        "text": "CTA text",
        "type": "hard/soft/engagement",
        "clarity": 80,
        "urgency": 60
    },
    "platformOptimization": {
        "detectedChannels": ["Facebook", "Google"],
        "platform": "Primary platform",
        "optimizationScore": 70,
        "improvements": ["Suggestion 1"]
    },
    "performanceIndicators": {
        "qualitySignals": ["High production value"],
        "engagementSignals": ["Active comments"]
    },
    "benchmarkEstimates": {
        "ctr": {"low": 0.5, "expected": 1.2, "high": 2.5},
        "cpm": {"low": 5, "expected": 12, "high": 25},
        "engagementRate": {"low": 1.5, "expected": 3.0, "high": 5.5}
    },
    "takeaways": [
        "Actionable insight 1",
        "Actionable insight 2",
        "Actionable insight 3"
    ]
}`;

            try {
                let result;
                const apiKey = localStorage.getItem('cav_gemini_api_key');
                
                if (apiKey) {
                    // Use Gemini for analysis
                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ parts: [{ text: prompt }] }],
                                generationConfig: { temperature: 0.3, maxOutputTokens: 3000 }
                            })
                        }
                    );
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    result = this.parseJSON(text);
                } else if (window.AIOrchestrator?.isProviderAvailable('claude')) {
                    const claudeResult = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.3 });
                    result = this.parseJSON(claudeResult.content);
                }
                
                return result || {};
            } catch (e) {
                console.error('[Learn] Enhanced analysis error:', e);
                return {};
            }
        }
        
        // Extract benchmarks from analysis and save them
        async extractAndSaveBenchmarks(analysis, sourceDomain) {
            const benchmarks = [];
            
            if (analysis.benchmarkEstimates) {
                const be = analysis.benchmarkEstimates;
                const platform = analysis.platformOptimization?.platform || 'all';
                const industry = analysis.detectedIndustry || analysis.creativeSummary?.industry || null;
                
                // Save CTR benchmark
                if (be.ctr) {
                    const ctrBench = {
                        id: `bench_ctr_${Date.now()}`,
                        metric: 'ctr',
                        platform: platform,
                        industry: industry,
                        value: be.ctr,
                        source: `URL Analysis: ${sourceDomain}`,
                        sourceUrl: analysis.url,
                        lastUpdated: new Date().toISOString()
                    };
                    this.saveBenchmark(ctrBench);
                    benchmarks.push(ctrBench);
                }
                
                // Save CPM benchmark
                if (be.cpm) {
                    const cpmBench = {
                        id: `bench_cpm_${Date.now()}`,
                        metric: 'cpm',
                        platform: platform,
                        industry: industry,
                        value: be.cpm,
                        source: `URL Analysis: ${sourceDomain}`,
                        sourceUrl: analysis.url,
                        lastUpdated: new Date().toISOString()
                    };
                    this.saveBenchmark(cpmBench);
                    benchmarks.push(cpmBench);
                }
                
                // Save engagement rate benchmark
                if (be.engagementRate) {
                    const engBench = {
                        id: `bench_engagement_${Date.now()}`,
                        metric: 'engagement_rate',
                        platform: platform,
                        industry: industry,
                        value: be.engagementRate,
                        source: `URL Analysis: ${sourceDomain}`,
                        sourceUrl: analysis.url,
                        lastUpdated: new Date().toISOString()
                    };
                    this.saveBenchmark(engBench);
                    benchmarks.push(engBench);
                }
            }
            
            analysis.extractedBenchmarks = benchmarks;
            console.log(`[Learn] Extracted ${benchmarks.length} benchmarks from URL analysis`);
        }
        
        // Auto-save URL analysis to swipe file AND to CRM company
        autoSaveToSwipeFile(result) {
            if (result.error) return; // Don't save failed analyses
            
            const swipeEntry = {
                id: result.id,
                source: 'url_analyzer',
                sourceUrl: result.url,
                urlType: result.urlType,
                title: result.creativeSummary?.keyMessage?.substring(0, 50) || `Analysis: ${new URL(result.url).hostname}`,
                thumbnailData: result.thumbnailData || null, // Could capture screenshot in future
                analysis: {
                    creativeSummary: result.creativeSummary,
                    hookAnalysis: result.hookAnalysis,
                    ctaEvaluation: result.ctaEvaluation,
                    takeaways: result.takeaways
                },
                tags: [
                    result.urlType,
                    result.detectedBrand?.name,
                    result.detectedIndustry,
                    ...(result.platformOptimization?.detectedChannels || [])
                ].filter(Boolean),
                collections: ['Auto-Saved URL Analyses'],
                notes: result.creativeSummary?.keyMessage || result.takeaways?.[0] || '',
                savedAt: new Date().toISOString(),
                savedBy: 'auto',
                isCompetitor: !!result.detectedCompetitor,
                competitorId: result.detectedCompetitor?.id,
                linkedCompanyId: result.linkedCompanyId,
                sources: result.sources
            };
            
            // Save to swipe file
            this.swipeFile.unshift(swipeEntry);
            localStorage.setItem(STORAGE_KEYS.SWIPE_FILE, JSON.stringify(this.swipeFile));
            
            result.savedToSwipeFile = true;
            console.log(`[Learn] Auto-saved URL analysis to swipe file: ${result.url}`);
            
            // ALSO SAVE TO CRM COMPANY if linked
            if (result.linkedCompanyId && window.cavCRM) {
                try {
                    // Save swipe file entry to company
                    window.cavCRM.addSwipeFileToCompany(result.linkedCompanyId, swipeEntry);
                    
                    // Save URL analysis to company
                    window.cavCRM.addURLAnalysisToCompany(result.linkedCompanyId, {
                        id: result.id,
                        url: result.url,
                        urlType: result.urlType,
                        analyzedAt: result.analyzedAt,
                        creativeSummary: result.creativeSummary,
                        hookAnalysis: result.hookAnalysis,
                        ctaEvaluation: result.ctaEvaluation,
                        performanceIndicators: result.performanceIndicators,
                        takeaways: result.takeaways
                    });
                    
                    // Save benchmarks to company if any
                    if (result.extractedBenchmarks?.length > 0) {
                        for (const benchmark of result.extractedBenchmarks) {
                            window.cavCRM.addBenchmarkToCompany(result.linkedCompanyId, benchmark);
                        }
                    }
                    
                    // Save best practices extracted from analysis
                    if (result.takeaways?.length > 0) {
                        for (const takeaway of result.takeaways.slice(0, 5)) {
                            window.cavCRM.addBestPracticeToCompany(result.linkedCompanyId, {
                                category: result.urlType || 'General',
                                practice: takeaway,
                                source: result.url,
                                extractedAt: new Date().toISOString()
                            });
                        }
                    }
                    
                    // Save detected competitors to the company
                    if (result.competitors?.length > 0) {
                        for (const competitor of result.competitors) {
                            window.cavCRM.addCompetitorToCompany(result.linkedCompanyId, competitor);
                        }
                    }
                    
                    console.log(`[Learn] Saved URL analysis data to CRM company: ${result.linkedCompanyId}`);
                } catch (e) {
                    console.warn('[Learn] Failed to save to CRM company:', e);
                }
            }
        }
        
        // Compare user's creative against URL analysis
        async compareCreatives(urlAnalysis, userImage) {
            const comparison = {
                overallScore: 0,
                strengths: [],
                improvements: [],
                detailedComparison: {}
            };
            
            try {
                const imageData = userImage.thumbnail_url || userImage.dataUrl || '';
                if (!imageData) return comparison;
                
                // Use Gemini or Claude for visual comparison
                const apiKey = localStorage.getItem('cav_gemini_api_key');
                if (apiKey && imageData.startsWith('data:')) {
                    const cleanBase64 = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
                    const mimeType = imageData.match(/^data:(image\/[a-z]+);base64,/)?.[1] || 'image/jpeg';
                    
                    const prompt = `You are a creative director comparing a user's creative asset against competitor insights.

URL Analysis Summary:
- Product/Service: ${urlAnalysis.creativeSummary?.product || 'Unknown'}
- Key Message: ${urlAnalysis.creativeSummary?.keyMessage || 'Unknown'}
- Target Audience: ${urlAnalysis.creativeSummary?.targetAudience || 'Unknown'}
- Hook Score: ${urlAnalysis.hookAnalysis?.score || 'N/A'}
- Visual Strategy: ${urlAnalysis.visualStrategy?.imageryApproach || 'Unknown'}
- CTA: ${urlAnalysis.ctaEvaluation?.type || 'Unknown'}

Analyze the uploaded image and compare it against the competitor creative insights:

1. **Overall Score (0-100)**: How well does this creative compete?
2. **Strengths**: What does this creative do well compared to competitor insights?
3. **Improvements**: What could be improved based on competitor best practices?
4. **Detailed Comparison**:
   - Hook Comparison: How does the attention-grabbing element compare?
   - Message Clarity: Is the value proposition clear?
   - Visual Quality: Professional quality comparison
   - CTA Effectiveness: Is there a clear call to action?
   - Brand Presence: Is branding clear?

Return ONLY valid JSON:
{
    "overallScore": 75,
    "strengths": ["Strength 1", "Strength 2"],
    "improvements": ["Improvement 1", "Improvement 2"],
    "detailedComparison": {
        "hookComparison": { "score": 70, "notes": "Explanation" },
        "messageClarity": { "score": 80, "notes": "Explanation" },
        "visualQuality": { "score": 75, "notes": "Explanation" },
        "ctaEffectiveness": { "score": 60, "notes": "Explanation" },
        "brandPresence": { "score": 85, "notes": "Explanation" }
    }
}`;
                    
                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [
                                        { text: prompt },
                                        { inlineData: { mimeType, data: cleanBase64 } }
                                    ]
                                }],
                                generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
                            })
                        }
                    );
                    
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        Object.assign(comparison, parsed);
                    }
                }
            } catch (error) {
                console.error('[Learn] Comparison error:', error);
                comparison.error = error.message;
            }
            
            return comparison;
        }
        
        // Update comparison preview in UI
        updateComparisonPreview(container, asset) {
            const previewContainer = container.querySelector('#selected-comparison-image');
            const previewImg = container.querySelector('#comparison-image-preview');
            const previewName = container.querySelector('#comparison-image-name');
            
            if (previewContainer && previewImg && previewName) {
                const thumbSrc = asset.thumbnail_url || asset.dataUrl || asset.video_url || '';
                previewImg.src = thumbSrc;
                previewName.textContent = `${asset.filename} (${asset.width || '?'}×${asset.height || '?'})`;
                previewContainer.style.display = 'flex';
            }
        }

        detectURLType(url) {
            const urlLower = url.toLowerCase();
            
            if (urlLower.includes('facebook.com/ads/library') || urlLower.includes('fb.com/ads')) {
                return 'ad_library';
            }
            if (urlLower.includes('ads.google.com/transparency') || urlLower.includes('adstransparency')) {
                return 'ad_library';
            }
            if (urlLower.includes('tiktok.com/business/creativecenter')) {
                return 'ad_library';
            }
            if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
                return 'video';
            }
            if (urlLower.includes('instagram.com') || urlLower.includes('twitter.com') || urlLower.includes('linkedin.com/posts')) {
                return 'social_post';
            }
            if (urlLower.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                return 'image';
            }
            if (urlLower.match(/\.(mp4|mov|webm)$/)) {
                return 'video';
            }
            
            return 'landing_page';
        }

        async getURLAnalysis(url, urlType) {
            const typePrompts = {
                ad_library: `Analyze this ad library URL and the creative it contains:`,
                landing_page: `Analyze this landing page for conversion optimization:`,
                social_post: `Analyze this social media post for engagement potential:`,
                video: `Analyze this video content for advertising effectiveness:`,
                image: `Analyze this image for creative effectiveness:`
            };

            const prompt = `${typePrompts[urlType] || 'Analyze this URL:'}

URL: ${url}

Provide a comprehensive creative intelligence analysis including:

1. **Creative Summary**: What is being advertised? Key message? Target audience?
2. **Hook Analysis**: What's the attention-grabbing element? Rating 0-100
3. **Message Architecture**: Primary message, supporting points, proof points
4. **Visual Strategy**: Colors, imagery approach, composition decisions
5. **CTA Evaluation**: Call-to-action presence, clarity, urgency
6. **Platform Optimization**: How well optimized for its platform?
7. **Performance Indicators**: Signs of success (engagement, professional quality)
8. **Key Takeaways**: 3-5 actionable insights

Return ONLY valid JSON:
{
    "creativeSummary": {
        "product": "Product/service being advertised",
        "keyMessage": "Main value proposition",
        "targetAudience": "Who this is for"
    },
    "hookAnalysis": {
        "score": 75,
        "element": "What grabs attention",
        "effectiveness": "Why it works or doesn't"
    },
    "messageArchitecture": {
        "primary": "Main message",
        "supporting": ["Point 1", "Point 2"],
        "proofPoints": ["Social proof", "Statistics"]
    },
    "visualStrategy": {
        "colors": ["#hex1", "#hex2"],
        "imageryApproach": "Lifestyle/Product/Abstract",
        "composition": "Layout description"
    },
    "ctaEvaluation": {
        "present": true,
        "text": "CTA text",
        "clarity": 80,
        "urgency": 60
    },
    "platformOptimization": {
        "platform": "Detected platform",
        "optimizationScore": 70,
        "improvements": ["Suggestion 1"]
    },
    "performanceIndicators": {
        "qualitySignals": ["High production value"],
        "engagementSignals": ["Comments enabled"]
    },
    "takeaways": [
        "Actionable insight 1",
        "Actionable insight 2",
        "Actionable insight 3"
    ]
}`;

            const result = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.3 });
            return this.parseJSON(result.content) || {};
        }

        // ============================================
        // COMPETITOR AD ANALYZER
        // ============================================

        async analyzeCompetitorAds(competitorId) {
            const competitor = window.CAVSettings?.manager?.settings?.competitors?.find(c => c.id === competitorId);
            if (!competitor) {
                throw new Error('Competitor not found');
            }

            const results = {
                competitorId,
                competitorName: competitor.name,
                analyzedAt: new Date().toISOString(),
                adsFound: [],
                insights: null
            };

            try {
                // Search for competitor ads using SearchAPI
                if (window.AIOrchestrator?.isProviderAvailable('searchapi')) {
                    // Search Google Ads Transparency
                    const googleAds = await window.AIOrchestrator.callSearchAPI(
                        `${competitor.name} advertising site:adstransparency.google.com`,
                        { num: 5 }
                    );
                    
                    // Search for competitor on social
                    const socialSearch = await window.AIOrchestrator.callSearchAPI(
                        `${competitor.name} ${competitor.domain} advertisement`,
                        { num: 10 }
                    );

                    results.searchResults = {
                        googleAds: googleAds.results || [],
                        socialAds: socialSearch.results || []
                    };

                    // Get AI insights
                    if (window.AIOrchestrator.isProviderAvailable('claude')) {
                        results.insights = await this.getCompetitorInsights(competitor, results.searchResults);
                    }
                }

            } catch (error) {
                console.error('[Learn] Competitor analysis error:', error);
                results.error = error.message;
            }

            return results;
        }

        async getCompetitorInsights(competitor, searchResults) {
            const prompt = `Analyze these search results about competitor advertising:

Competitor: ${competitor.name} (${competitor.domain})

Search Results:
${JSON.stringify(searchResults, null, 2)}

Provide competitive intelligence insights:

1. **Advertising Channels**: Where are they advertising?
2. **Message Themes**: What themes/messages do they emphasize?
3. **Creative Approaches**: What creative styles do they use?
4. **Targeting Signals**: Who are they targeting?
5. **Frequency/Activity**: How active is their advertising?
6. **Opportunities**: What gaps can you exploit?

Return ONLY valid JSON:
{
    "advertisingChannels": ["Google", "Facebook", "LinkedIn"],
    "messageThemes": ["Value proposition 1", "Value proposition 2"],
    "creativeApproaches": ["UGC style", "Professional production"],
    "targetingSignals": ["B2B", "Enterprise", "Decision makers"],
    "activityLevel": "high/medium/low",
    "opportunities": ["Gap 1 you can exploit", "Angle they're missing"],
    "recommendations": ["How to differentiate", "What to test against them"]
}`;

            const result = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.4 });
            return this.parseJSON(result.content);
        }

        // ============================================
        // BEST PRACTICES LIBRARY
        // ============================================

        async updateBestPractices() {
            if (!window.AIOrchestrator?.isProviderAvailable('searchapi')) {
                return { error: 'SearchAPI required for best practices updates' };
            }

            const queries = [
                { query: 'paid media creative best practices 2024', category: 'creative_frameworks' },
                { query: 'Facebook ads creative guidelines 2024', category: 'platform_guidelines', platform: 'Meta' },
                { query: 'TikTok advertising best practices', category: 'platform_guidelines', platform: 'TikTok' },
                { query: 'Google Ads creative specifications', category: 'platform_guidelines', platform: 'Google Ads' },
                { query: 'video ad hook techniques', category: 'creative_frameworks' },
                { query: 'social media ad benchmarks 2024', category: 'industry_benchmarks' }
            ];

            const updates = [];

            for (const q of queries) {
                try {
                    const results = await window.AIOrchestrator.callSearchAPI(q.query, { num: 5 });
                    
                    for (const result of (results.results || []).slice(0, 3)) {
                        const practice = window.CAVDataModels?.BestPractice?.create({
                            category: q.category,
                            platform: q.platform || 'all',
                            title: result.title,
                            content: result.snippet,
                            source: result.displayed_link || result.link,
                            sourceUrl: result.link,
                            publishedAt: result.date || null,
                            tags: [q.category, q.platform].filter(Boolean),
                            relevanceScore: 70
                        });
                        
                        this.saveBestPractice(practice);
                        updates.push(practice);
                    }
                } catch (e) {
                    console.warn(`[Learn] Best practices query failed: ${q.query}`, e);
                }
            }

            return { updated: updates.length, practices: updates };
        }

        loadBestPractices() {
            try {
                return JSON.parse(localStorage.getItem('cav_best_practices') || '[]');
            } catch {
                return [];
            }
        }

        saveBestPractice(practice) {
            const practices = this.loadBestPractices();
            const existing = practices.findIndex(p => p.sourceUrl === practice.sourceUrl);
            if (existing >= 0) {
                practices[existing] = { ...practices[existing], ...practice, lastVerified: new Date().toISOString() };
            } else {
                practices.push(practice);
            }
            localStorage.setItem('cav_best_practices', JSON.stringify(practices));
            this.bestPractices = practices;
        }

        getBestPractices(filters = {}) {
            let practices = [...this.bestPractices];
            
            if (filters.category) {
                practices = practices.filter(p => p.category === filters.category);
            }
            if (filters.platform) {
                practices = practices.filter(p => p.platform === filters.platform || p.platform === 'all');
            }
            if (filters.search) {
                const search = filters.search.toLowerCase();
                practices = practices.filter(p => 
                    p.title?.toLowerCase().includes(search) || 
                    p.content?.toLowerCase().includes(search)
                );
            }
            
            return practices.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        }

        // ============================================
        // PERFORMANCE BENCHMARKS DATABASE
        // ============================================

        async updateBenchmarks() {
            if (!window.AIOrchestrator?.isProviderAvailable('searchapi')) {
                return { error: 'SearchAPI required for benchmark updates' };
            }

            const benchmarkQueries = [
                { metric: 'ctr', query: 'average CTR Facebook ads 2024' },
                { metric: 'ctr', query: 'average CTR Google Display ads 2024' },
                { metric: 'cpm', query: 'average CPM social media advertising 2024' },
                { metric: 'engagement_rate', query: 'average engagement rate Instagram 2024' },
                { metric: 'view_through_rate', query: 'video completion rate benchmarks 2024' }
            ];

            const updates = [];

            for (const bq of benchmarkQueries) {
                try {
                    const results = await window.AIOrchestrator.callSearchAPI(bq.query, { num: 3 });
                    
                    // Use Claude to extract benchmark numbers
                    if (window.AIOrchestrator.isProviderAvailable('claude') && results.results?.length) {
                        const extracted = await this.extractBenchmarkFromSearch(bq.metric, results.results);
                        if (extracted) {
                            this.saveBenchmark(extracted);
                            updates.push(extracted);
                        }
                    }
                } catch (e) {
                    console.warn(`[Learn] Benchmark query failed: ${bq.query}`, e);
                }
            }

            return { updated: updates.length, benchmarks: updates };
        }

        async extractBenchmarkFromSearch(metric, searchResults) {
            const prompt = `Extract benchmark data for "${metric}" from these search results:

${searchResults.map(r => `Title: ${r.title}\nSnippet: ${r.snippet}`).join('\n\n')}

Return ONLY valid JSON with numeric values:
{
    "metric": "${metric}",
    "platform": "all or specific platform",
    "value": {
        "low": 0.5,
        "median": 1.0,
        "high": 2.0
    },
    "source": "where this data came from",
    "confidence": "high/medium/low"
}

If no clear benchmark data found, return null.`;

            const result = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.1 });
            const parsed = this.parseJSON(result.content);
            
            if (parsed && parsed.value) {
                return window.CAVDataModels?.Benchmark?.create({
                    metric: parsed.metric,
                    platform: parsed.platform || 'all',
                    value: parsed.value,
                    source: 'searchapi',
                    lastUpdated: new Date().toISOString()
                });
            }
            return null;
        }

        loadBenchmarks() {
            try {
                return JSON.parse(localStorage.getItem('cav_benchmarks') || '[]');
            } catch {
                return [];
            }
        }

        saveBenchmark(benchmark) {
            const benchmarks = this.loadBenchmarks();
            const existing = benchmarks.findIndex(b => b.metric === benchmark.metric && b.platform === benchmark.platform);
            if (existing >= 0) {
                benchmarks[existing] = benchmark;
            } else {
                benchmarks.push(benchmark);
            }
            localStorage.setItem('cav_benchmarks', JSON.stringify(benchmarks));
            this.benchmarks = benchmarks;
        }

        getBenchmark(metric, platform = 'all') {
            return this.benchmarks.find(b => b.metric === metric && (b.platform === platform || b.platform === 'all'));
        }

        // ============================================
        // SWIPE FILE SYSTEM
        // ============================================

        loadSwipeFile() {
            try {
                return JSON.parse(localStorage.getItem('cav_swipe_file') || '[]');
            } catch {
                return [];
            }
        }

        saveToSwipeFile(entry) {
            const swipeEntry = window.CAVDataModels?.SwipeFileEntry?.create(entry) || {
                id: `swipe_${Date.now()}`,
                ...entry,
                savedAt: new Date().toISOString()
            };

            this.swipeFile.push(swipeEntry);
            localStorage.setItem('cav_swipe_file', JSON.stringify(this.swipeFile));
            
            return swipeEntry;
        }

        updateSwipeEntry(id, updates) {
            const index = this.swipeFile.findIndex(e => e.id === id);
            if (index >= 0) {
                this.swipeFile[index] = { ...this.swipeFile[index], ...updates };
                localStorage.setItem('cav_swipe_file', JSON.stringify(this.swipeFile));
                return this.swipeFile[index];
            }
            return null;
        }

        deleteSwipeEntry(id) {
            this.swipeFile = this.swipeFile.filter(e => e.id !== id);
            localStorage.setItem('cav_swipe_file', JSON.stringify(this.swipeFile));
        }

        getSwipeFile(filters = {}) {
            let entries = [...this.swipeFile];
            
            if (filters.tags?.length) {
                entries = entries.filter(e => filters.tags.some(t => e.tags?.includes(t)));
            }
            if (filters.collection) {
                entries = entries.filter(e => e.collections?.includes(filters.collection));
            }
            if (filters.search) {
                const search = filters.search.toLowerCase();
                entries = entries.filter(e => 
                    e.notes?.toLowerCase().includes(search) ||
                    e.sourceUrl?.toLowerCase().includes(search)
                );
            }
            if (filters.isCompetitor !== undefined) {
                entries = entries.filter(e => e.isCompetitor === filters.isCompetitor);
            }
            
            return entries.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        }

        getSwipeCollections() {
            const collections = new Set();
            this.swipeFile.forEach(e => {
                (e.collections || []).forEach(c => collections.add(c));
            });
            return Array.from(collections);
        }

        getSwipeTags() {
            const tags = new Map();
            this.swipeFile.forEach(e => {
                (e.tags || []).forEach(t => tags.set(t, (tags.get(t) || 0) + 1));
            });
            return Array.from(tags.entries()).sort((a, b) => b[1] - a[1]);
        }

        // ============================================
        // LANDING PAGE SYNC CHECK
        // ============================================

        async checkLandingPageSync(asset, landingPageUrl) {
            const syncCheck = {
                assetId: asset.id,
                landingPageUrl,
                syncScore: 0,
                headlineMatch: { adText: null, lpText: null, match: false },
                visualContinuity: { score: 0, issues: [] },
                offerConsistency: { adOffer: null, lpOffer: null, match: false },
                ctaAlignment: { adCta: null, lpCta: null, match: false },
                keywordRelevance: { keywords: [], present: [] },
                trustSignals: { adSignals: [], lpSignals: [], overlap: [] },
                recommendations: [],
                analyzedAt: new Date().toISOString()
            };

            try {
                if (!window.AIOrchestrator?.isProviderAvailable('claude')) {
                    throw new Error('Claude required for landing page sync analysis');
                }

                // Get landing page data via SearchAPI
                let lpData = null;
                if (window.AIOrchestrator.isProviderAvailable('searchapi')) {
                    const searchResult = await window.AIOrchestrator.callSearchAPI(`site:${landingPageUrl}`, { num: 1 });
                    lpData = searchResult.results?.[0];
                }

                const prompt = `Analyze message sync between an ad creative and its landing page.

Ad Creative Details:
- Filename: ${asset.filename}
- Type: ${asset.type}
- Dimensions: ${asset.width}×${asset.height}

Landing Page URL: ${landingPageUrl}
${lpData ? `Landing Page Snippet: ${lpData.snippet}` : ''}

Check for alignment on:
1. Headline/Message Match - Does the ad message continue on LP?
2. Visual Continuity - Would colors/style feel connected?
3. Offer Consistency - Same offer/promotion in both?
4. CTA Alignment - Do CTAs match and make sense?
5. Keyword Relevance - Key terms present in both?
6. Trust Signals - Consistent credibility elements?

Return ONLY valid JSON:
{
    "syncScore": 75,
    "headlineMatch": {
        "adText": "Assumed ad headline",
        "lpText": "Landing page headline",
        "match": true
    },
    "visualContinuity": {
        "score": 70,
        "issues": ["Color scheme may differ"]
    },
    "offerConsistency": {
        "adOffer": "20% off",
        "lpOffer": "20% off first order",
        "match": true
    },
    "ctaAlignment": {
        "adCta": "Shop Now",
        "lpCta": "Add to Cart",
        "match": false
    },
    "keywordRelevance": {
        "keywords": ["keyword1", "keyword2"],
        "present": ["keyword1"]
    },
    "trustSignals": {
        "adSignals": ["Free shipping"],
        "lpSignals": ["Free shipping", "Money back guarantee"],
        "overlap": ["Free shipping"]
    },
    "recommendations": [
        "Match CTA text between ad and LP",
        "Add trust signals from LP to ad"
    ]
}`;

                const result = await window.AIOrchestrator.callClaude(prompt, { temperature: 0.2 });
                Object.assign(syncCheck, this.parseJSON(result.content) || {});

            } catch (error) {
                console.error('[Learn] Landing page sync error:', error);
                syncCheck.error = error.message;
            }

            return syncCheck;
        }

        // ============================================
        // UI RENDERING
        // ============================================

        render(container) {
            this.container = container;
            
            // Get stats for action cards
            const swipeCount = this.swipeFile?.length || 0;
            const benchmarkCount = this.benchmarks?.length || 0;
            const urlHistoryCount = this.urlAnalysisHistory?.length || 0;
            const competitorCount = this.detectedCompetitors?.length || 0;
            
            container.innerHTML = `
                <div class="cav-learn-page">
                    <!-- Action Cards - Library Style -->
                    <div class="cav-action-cards">
                        <div class="cav-action-card" data-view="url-analyzer" data-tooltip="Analyze any URL for creative insights">
                            <div class="cav-action-card-icon"><svg class="cav-icon" style="width:32px;height:32px;"><use href="#icon-link"/></svg></div>
                            <h3 class="cav-action-card-title">URL Analyzer</h3>
                            <p class="cav-action-card-description">Paste any URL for insights</p>
                        </div>
                        <div class="cav-action-card" data-view="swipe-file" data-tooltip="Browse your saved creative examples">
                            <div class="cav-action-card-icon"><svg class="cav-icon" style="width:32px;height:32px;"><use href="#icon-library"/></svg></div>
                            <h3 class="cav-action-card-title">Swipe File</h3>
                            <p class="cav-action-card-description">${swipeCount} saved examples</p>
                        </div>
                        <div class="cav-action-card" data-view="benchmarks" data-tooltip="View industry benchmarks">
                            <div class="cav-action-card-icon"><svg class="cav-icon" style="width:32px;height:32px;"><use href="#icon-analyze"/></svg></div>
                            <h3 class="cav-action-card-title">Benchmarks</h3>
                            <p class="cav-action-card-description">${benchmarkCount} data points</p>
                        </div>
                        <div class="cav-action-card" data-view="competitors" data-tooltip="Track competitor insights">
                            <div class="cav-action-card-icon"><svg class="cav-icon" style="width:32px;height:32px;"><use href="#icon-eye"/></svg></div>
                            <h3 class="cav-action-card-title">Competitors</h3>
                            <p class="cav-action-card-description">${competitorCount} tracked</p>
                        </div>
                    </div>
                    
                    <!-- Quick Stats Pills -->
                    <div class="cav-section-header">
                        <div>
                            <h3 class="cav-section-title">Knowledge Base</h3>
                            <p class="cav-section-subtitle">Your competitive intelligence hub</p>
                        </div>
                    </div>
                    <div class="cav-quick-actions">
                        <button class="cav-quick-pill" data-view="url-analyzer" data-tooltip="View recent URL analyses">
                            <svg class="cav-icon cav-quick-pill-icon purple"><use href="#icon-link"/></svg>
                            <span>${urlHistoryCount} URL Analyses</span>
                        </button>
                        <button class="cav-quick-pill" data-view="swipe-file" data-tooltip="Browse saved creatives">
                            <svg class="cav-icon cav-quick-pill-icon blue"><use href="#icon-library"/></svg>
                            <span>${swipeCount} Swipe Examples</span>
                        </button>
                        <button class="cav-quick-pill" data-view="best-practices" data-tooltip="View best practices">
                            <svg class="cav-icon cav-quick-pill-icon green"><use href="#icon-check"/></svg>
                            <span>Best Practices</span>
                        </button>
                    </div>
                    
                    <!-- Tabs - Module style -->
                    <div class="cav-module-tabs">
                        <button class="cav-module-tab ${this.currentView === 'url-analyzer' ? 'active' : ''}" data-view="url-analyzer" data-tooltip="Analyze URLs for creative insights">
                            <svg class="cav-icon"><use href="#icon-link"/></svg> URL Analyzer
                        </button>
                        <button class="cav-module-tab ${this.currentView === 'swipe-file' ? 'active' : ''}" data-view="swipe-file" data-tooltip="Browse saved creative examples">
                            <svg class="cav-icon"><use href="#icon-library"/></svg> Swipe File
                        </button>
                        <button class="cav-module-tab ${this.currentView === 'best-practices' ? 'active' : ''}" data-view="best-practices" data-tooltip="Learn from best practices">
                            <svg class="cav-icon"><use href="#icon-check"/></svg> Best Practices
                        </button>
                        <button class="cav-module-tab ${this.currentView === 'benchmarks' ? 'active' : ''}" data-view="benchmarks" data-tooltip="View industry benchmarks">
                            <svg class="cav-icon"><use href="#icon-analyze"/></svg> Benchmarks
                        </button>
                        <button class="cav-module-tab ${this.currentView === 'competitors' ? 'active' : ''}" data-view="competitors" data-tooltip="Track competitor insights">
                            <svg class="cav-icon"><use href="#icon-eye"/></svg> Competitors
                        </button>
                    </div>
                    
                    <div class="cav-learn-content">
                        ${this.renderCurrentView()}
                    </div>
                </div>
            `;

            this.attachEventHandlers(container);
        }

        renderCurrentView() {
            switch (this.currentView) {
                case 'url-analyzer': return this.renderURLAnalyzer();
                case 'swipe-file': return this.renderSwipeFile();
                case 'best-practices': return this.renderBestPractices();
                case 'benchmarks': return this.renderBenchmarks();
                case 'competitors': return this.renderCompetitors();
                default: return this.renderURLAnalyzer();
            }
        }

        renderURLAnalyzer() {
            return `
                <div class="cav-url-analyzer">
                    <div class="cav-url-input-section">
                        <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:8px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>Analyze Any URL</h2>
                        <p>Paste a URL to get AI-powered creative insights</p>
                        <div class="cav-url-input-group">
                            <input type="url" id="url-input" placeholder="https://example.com/ad or Facebook Ad Library URL..." class="cav-url-input">
                            <button class="cav-btn cav-btn-primary" id="analyze-url">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Analyze
                            </button>
                        </div>
                        <div class="cav-url-types">
                            <span>Supported:</span>
                            <span class="cav-url-type">Facebook Ad Library</span>
                            <span class="cav-url-type">Google Ads Transparency</span>
                            <span class="cav-url-type">Landing Pages</span>
                            <span class="cav-url-type">Social Posts</span>
                            <span class="cav-url-type">Direct Image/Video URLs</span>
                        </div>
                    </div>
                    
                    <!-- Image Comparison Section -->
                    <div class="cav-image-comparison-section">
                        <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>Compare Your Creative</h3>
                        <p>Select an image from your library to compare against the URL's creative insights</p>
                        <div class="cav-comparison-controls">
                            <button class="cav-btn cav-btn-secondary" id="select-comparison-image">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Select Image from Library
                            </button>
                            <button class="cav-btn cav-btn-secondary" id="upload-comparison-image">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Upload Image
                            </button>
                            <input type="file" id="comparison-image-upload" accept="image/*" style="display:none;">
                        </div>
                        <div id="selected-comparison-image" class="cav-selected-comparison" style="display:none;">
                            <img id="comparison-image-preview" src="" alt="Selected for comparison">
                            <div class="cav-comparison-info">
                                <span id="comparison-image-name">No image selected</span>
                                <button class="cav-btn cav-btn-small cav-btn-danger" id="clear-comparison-image">✕</button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="url-analysis-results"></div>
                </div>
            `;
        }

        renderSwipeFile() {
            const entries = this.getSwipeFile();
            const collections = this.getSwipeCollections();
            const tags = this.getSwipeTags().slice(0, 10);
            const urlHistory = this.urlAnalysisHistory || [];
            
            // Separate auto-saved and manual entries
            const autoSaved = entries.filter(e => e.savedBy === 'auto' || e.source === 'url_analyzer');
            const manualSaved = entries.filter(e => e.savedBy !== 'auto' && e.source !== 'url_analyzer');

            return `
                <div class="cav-swipe-file">
                    <div class="cav-swipe-header">
                        <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:8px;vertical-align:middle;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>Swipe File</h2>
                        <div class="cav-swipe-stats">
                            <span>${entries.length} saved examples</span>
                            <span class="cav-auto-badge">🤖 ${autoSaved.length} auto-saved</span>
                        </div>
                    </div>
                    
                    <div class="cav-swipe-filters">
                        <input type="search" id="swipe-search" placeholder="Search swipe file..." class="cav-search-input">
                        <select id="swipe-source-filter">
                            <option value="">All Sources</option>
                            <option value="auto">Auto-Saved from URLs</option>
                            <option value="manual">Manually Saved</option>
                            <option value="competitor">Competitor Examples</option>
                        </select>
                        ${collections.length ? `
                            <select id="swipe-collection">
                                <option value="">All Collections</option>
                                ${collections.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        ` : ''}
                    </div>
                    
                    ${tags.length ? `
                        <div class="cav-swipe-tags">
                            ${tags.map(([tag, count]) => `
                                <span class="cav-filter-tag" data-tag="${tag}">${tag} (${count})</span>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <!-- URL Analysis History Section -->
                    ${urlHistory.length > 0 ? `
                        <div class="cav-url-history-section">
                            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>Recent URL Analyses (${urlHistory.length})</h3>
                            <div class="cav-url-history-list">
                                ${urlHistory.slice(0, 5).map(h => `
                                    <div class="cav-url-history-item" data-id="${h.id}">
                                        <div class="cav-url-info">
                                            <span class="cav-url-type-badge">${h.urlType?.replace(/_/g, ' ')}</span>
                                            <a href="${h.url}" target="_blank" class="cav-url-link">${new URL(h.url).hostname}</a>
                                            ${h.detectedCompetitor ? `<span class="cav-competitor-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>${h.detectedCompetitor.name}</span>` : ''}
                                        </div>
                                        <div class="cav-url-meta">
                                            <span>${new Date(h.analyzedAt).toLocaleString()}</span>
                                            ${h.hookAnalysis?.score ? `<span class="cav-hook-score">Hook: ${h.hookAnalysis.score}/100</span>` : ''}
                                        </div>
                                        <div class="cav-url-actions">
                                            <button class="cav-btn cav-btn-small" data-action="view-url-analysis" data-id="${h.id}">👁️ View</button>
                                            <button class="cav-btn cav-btn-small" data-action="reanalyze-url" data-url="${h.url}">🔄</button>
                                        </div>
                                    </div>
                                `).join('')}
                                ${urlHistory.length > 5 ? `
                                    <button class="cav-btn cav-btn-link" id="show-all-url-history">
                                        Show all ${urlHistory.length} analyses →
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="cav-swipe-grid">
                        ${entries.length === 0 ? `
                            <div class="cav-empty-state">
                                <p>No saved examples yet</p>
                                <p>Analyze a URL to auto-save to your swipe file, or manually save creative inspiration</p>
                            </div>
                        ` : entries.slice(0, 20).map(e => `
                            <div class="cav-swipe-card ${e.savedBy === 'auto' ? 'cav-auto-saved' : ''} ${e.isCompetitor ? 'cav-competitor-swipe' : ''}" data-id="${e.id}">
                                <div class="cav-swipe-badges">
                                    ${e.savedBy === 'auto' ? '<span class="cav-badge-auto">🤖 Auto</span>' : ''}
                                    ${e.isCompetitor ? '<span class="cav-badge-competitor">👀 Competitor</span>' : ''}
                                </div>
                                ${e.thumbnailData ? `<img src="${e.thumbnailData}" alt="Swipe">` : 
                                  `<div class="cav-swipe-placeholder">
                                      ${e.urlType === 'video' ? '🎬' : e.urlType === 'landing_page' ? '🌐' : '📷'}
                                   </div>`}
                                <div class="cav-swipe-info">
                                    <span class="cav-swipe-source">${e.source === 'url_analyzer' ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>URL' : e.source}</span>
                                    ${e.sourceUrl ? `
                                        <a href="${e.sourceUrl}" target="_blank" class="cav-swipe-url" title="${e.sourceUrl}">
                                            ${new URL(e.sourceUrl).hostname.substring(0, 20)}↗️
                                        </a>
                                    ` : ''}
                                </div>
                                ${e.analysis?.creativeSummary?.keyMessage ? `
                                    <div class="cav-swipe-message">
                                        ${e.analysis.creativeSummary.keyMessage.substring(0, 60)}...
                                    </div>
                                ` : e.notes ? `
                                    <div class="cav-swipe-message">${e.notes.substring(0, 60)}...</div>
                                ` : ''}
                                ${e.tags?.length ? `
                                    <div class="cav-swipe-tags-mini">
                                        ${e.tags.filter(Boolean).slice(0, 3).map(t => `<span>${t}</span>`).join('')}
                                    </div>
                                ` : ''}
                                <div class="cav-swipe-footer">
                                    <span class="cav-swipe-date">${new Date(e.savedAt).toLocaleDateString()}</span>
                                    <div class="cav-swipe-actions">
                                        <button class="cav-btn cav-btn-small" data-action="view-swipe" data-id="${e.id}" title="View Details">👁️</button>
                                        ${e.linkedCompanyId ? `
                                            <button class="cav-btn cav-btn-small" data-action="view-in-crm" data-id="${e.linkedCompanyId}" title="View in CRM"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></button>
                                        ` : ''}
                                        <button class="cav-btn cav-btn-small cav-btn-danger" data-action="delete-swipe" data-id="${e.id}" title="Delete">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        renderBestPractices() {
            const practices = this.getBestPractices();
            const categories = ['platform_guidelines', 'creative_frameworks', 'industry_benchmarks', 'case_studies'];

            return `
                <div class="cav-best-practices">
                    <div class="cav-bp-header">
                        <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:8px;vertical-align:middle;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>Best Practices Library</h2>
                        <button class="cav-btn cav-btn-secondary" id="update-best-practices">
                            🔄 Update from Web
                        </button>
                    </div>
                    
                    <div class="cav-bp-filters">
                        <select id="bp-category">
                            <option value="">All Categories</option>
                            ${categories.map(c => `<option value="${c}">${c.replace(/_/g, ' ')}</option>`).join('')}
                        </select>
                        <select id="bp-platform">
                            <option value="">All Platforms</option>
                            <option value="Meta">Meta</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Google Ads">Google Ads</option>
                            <option value="YouTube">YouTube</option>
                            <option value="LinkedIn">LinkedIn</option>
                        </select>
                        <input type="search" id="bp-search" placeholder="Search..." class="cav-search-input">
                    </div>
                    
                    <div class="cav-bp-list">
                        ${practices.length === 0 ? `
                            <div class="cav-empty-state">
                                <p>No best practices saved yet</p>
                                <p>Click "Update from Web" to fetch latest best practices</p>
                            </div>
                        ` : practices.slice(0, 20).map(p => `
                            <div class="cav-bp-card">
                                <div class="cav-bp-meta">
                                    <span class="cav-bp-category">${p.category?.replace(/_/g, ' ')}</span>
                                    ${p.platform !== 'all' ? `<span class="cav-bp-platform">${p.platform}</span>` : ''}
                                </div>
                                <h3>${p.title}</h3>
                                <p>${p.content}</p>
                                ${p.sourceUrl ? `<a href="${p.sourceUrl}" target="_blank" class="cav-bp-source">Source ↗️</a>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        renderBenchmarks() {
            const benchmarks = this.benchmarks;
            const metrics = ['ctr', 'cpm', 'cpc', 'engagement_rate', 'view_through_rate', 'conversion_rate'];

            // Group benchmarks by metric
            const groupedBenchmarks = {};
            benchmarks.forEach(b => {
                if (!groupedBenchmarks[b.metric]) {
                    groupedBenchmarks[b.metric] = [];
                }
                groupedBenchmarks[b.metric].push(b);
            });

            return `
                <div class="cav-benchmarks">
                    <div class="cav-bench-header">
                        <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:8px;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Performance Benchmarks</h2>
                        <div class="cav-bench-actions">
                            <span class="cav-bench-count">${benchmarks.length} benchmarks from ${new Set(benchmarks.map(b => b.source)).size} sources</span>
                            <button class="cav-btn cav-btn-ai" id="save-benchmarks-to-crm">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>Save to CRM
                            </button>
                            <button class="cav-btn cav-btn-secondary" id="update-benchmarks">
                                🔄 Update from Web
                            </button>
                        </div>
                    </div>
                    
                    <div class="cav-bench-grid">
                        ${metrics.map(metric => {
                            const metricBenchmarks = groupedBenchmarks[metric] || [];
                            const latestBench = metricBenchmarks.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))[0];
                            const isMonetary = metric === 'cpm' || metric === 'cpc';
                            const unit = isMonetary ? '$' : '%';
                            
                            return `
                                <div class="cav-bench-card ${latestBench ? '' : 'cav-bench-empty'}">
                                    <h3>${metric.replace(/_/g, ' ').toUpperCase()}</h3>
                                    ${latestBench ? `
                                        <div class="cav-bench-values">
                                            <div class="cav-bench-range">
                                                <span class="low">${isMonetary ? unit : ''}${latestBench.value?.low || latestBench.value?.expected * 0.5 || 0}${!isMonetary ? unit : ''}</span>
                                                <span class="median">${isMonetary ? unit : ''}${latestBench.value?.median || latestBench.value?.expected || 0}${!isMonetary ? unit : ''}</span>
                                                <span class="high">${isMonetary ? unit : ''}${latestBench.value?.high || latestBench.value?.expected * 1.5 || 0}${!isMonetary ? unit : ''}</span>
                                            </div>
                                            <div class="cav-bench-labels">
                                                <span>Low</span><span>Median</span><span>High</span>
                                            </div>
                                        </div>
                                        <div class="cav-bench-meta">
                                            ${latestBench.platform && latestBench.platform !== 'all' ? `<span class="cav-bench-platform">📱 ${latestBench.platform}</span>` : ''}
                                            ${latestBench.industry ? `<span class="cav-bench-industry">🏭 ${latestBench.industry}</span>` : ''}
                                        </div>
                                        <div class="cav-bench-source">
                                            <span title="${latestBench.sourceUrl || ''}">📄 ${latestBench.source || 'Unknown'}</span>
                                            <span class="cav-bench-updated">Updated: ${new Date(latestBench.lastUpdated).toLocaleDateString()}</span>
                                        </div>
                                        ${metricBenchmarks.length > 1 ? `
                                            <div class="cav-bench-more">
                                                <button class="cav-btn-link" data-action="show-all-benchmarks" data-metric="${metric}">
                                                    +${metricBenchmarks.length - 1} more sources
                                                </button>
                                            </div>
                                        ` : ''}
                                    ` : `
                                        <p class="cav-no-data">No data available</p>
                                        <p class="cav-no-data-hint">Analyze a URL to auto-extract benchmarks</p>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <!-- All Sources Section -->
                    <div class="cav-bench-sources-section">
                        <h3>📚 Benchmark Sources</h3>
                        <div class="cav-bench-sources-list">
                            ${[...new Set(benchmarks.map(b => b.source))].map(source => {
                                const sourceBenchmarks = benchmarks.filter(b => b.source === source);
                                return `
                                    <div class="cav-bench-source-item">
                                        <span class="cav-source-name">${source}</span>
                                        <span class="cav-source-count">${sourceBenchmarks.length} benchmarks</span>
                                        <span class="cav-source-date">Last: ${new Date(Math.max(...sourceBenchmarks.map(b => new Date(b.lastUpdated)))).toLocaleDateString()}</span>
                                    </div>
                                `;
                            }).join('')}
                            ${benchmarks.length === 0 ? '<p class="cav-no-data">No benchmark sources yet. Analyze URLs or click "Update from Web".</p>' : ''}
                        </div>
                    </div>
                    
                    <div class="cav-bench-custom">
                        <h3>Add Custom Benchmark</h3>
                        <div class="cav-bench-form">
                            <select id="custom-metric">
                                ${metrics.map(m => `<option value="${m}">${m.replace(/_/g, ' ')}</option>`).join('')}
                            </select>
                            <input type="text" id="custom-source" placeholder="Source (e.g., Company Report)">
                            <input type="number" id="custom-low" placeholder="Low" step="0.01">
                            <input type="number" id="custom-median" placeholder="Median" step="0.01">
                            <input type="number" id="custom-high" placeholder="High" step="0.01">
                            <button class="cav-btn cav-btn-primary" id="save-custom-benchmark">Save</button>
                        </div>
                    </div>
                </div>
            `;
        }

        renderCompetitors() {
            const configuredCompetitors = window.CAVSettings?.manager?.settings?.competitors || [];
            const detectedCompetitors = this.detectedCompetitors || [];
            
            // Get CRM competitors (separate competitor storage, NOT companies)
            const crmCompetitors = window.cavCRM?.getAllCompetitors ? window.cavCRM.getAllCompetitors() : [];
            
            // Also check for companies marked as competitors (for backwards compatibility)
            const crmCompetitorCompanies = window.cavCRM ? window.cavCRM.getAllCompanies({ type: 'competitor' }) : [];
            
            // Merge all competitor sources (dedupe by name)
            const seenNames = new Set();
            const allCompetitors = [];
            
            // Priority: CRM competitors > Detected > Configured
            for (const c of crmCompetitors) {
                if (!seenNames.has(c.name.toLowerCase())) {
                    seenNames.add(c.name.toLowerCase());
                    allCompetitors.push({ ...c, source: 'crm_competitor' });
                }
            }
            for (const c of detectedCompetitors) {
                if (!seenNames.has(c.name.toLowerCase())) {
                    seenNames.add(c.name.toLowerCase());
                    allCompetitors.push({ ...c, source: 'ai_detected' });
                }
            }
            for (const c of crmCompetitorCompanies) {
                if (!seenNames.has(c.name.toLowerCase())) {
                    seenNames.add(c.name.toLowerCase());
                    allCompetitors.push({ ...c, source: 'crm_company' });
                }
            }
            for (const c of configuredCompetitors) {
                if (!seenNames.has(c.name.toLowerCase())) {
                    seenNames.add(c.name.toLowerCase());
                    allCompetitors.push({ ...c, source: 'manual' });
                }
            }

            return `
                <div class="cav-competitors">
                    <div class="cav-comp-header">
                        <h2>👀 Competitor Intelligence</h2>
                        <div class="cav-comp-stats">
                            <span class="cav-comp-count">${allCompetitors.length} competitors tracked</span>
                            ${crmCompetitors.length > 0 || detectedCompetitors.length > 0 ? 
                              `<span class="cav-comp-detected">🤖 ${crmCompetitors.length + detectedCompetitors.length} auto-detected</span>` : ''}
                        </div>
                        <div class="cav-comp-actions">
                            <button class="cav-btn cav-btn-secondary" id="refresh-competitors-learn">
                                🔄 Refresh from AI
                            </button>
                            <button class="cav-btn cav-btn-primary" id="add-competitor-learn">
                                ➕ Add Competitor
                            </button>
                        </div>
                    </div>
                    
                    <p class="cav-section-hint">
                        Competitors are auto-detected when you analyze URLs. They persist until cleared and can be reloaded anytime.
                        ${allCompetitors.length === 0 ? '<strong>Analyze a URL to auto-detect competitors!</strong>' : ''}
                    </p>
                    
                    <!-- All Competitors Grid (up to 3 shown prominently) -->
                    ${detectedCompetitors.length > 0 ? `
                        <div class="cav-comp-section">
                            <h3>🤖 Auto-Detected from URL Analysis</h3>
                            <p class="cav-section-hint">These competitors were automatically detected when you analyzed URLs</p>
                            <div class="cav-comp-list">
                                ${detectedCompetitors.map(c => `
                                    <div class="cav-comp-card cav-comp-detected" data-id="${c.id}">
                                        <div class="cav-comp-info">
                                            <h3>${c.name}</h3>
                                            <span class="cav-comp-domain">${c.domain}</span>
                                            ${c.industry ? `<span class="cav-comp-industry">🏭 ${c.industry}</span>` : ''}
                                        </div>
                                        <div class="cav-comp-meta">
                                            <span class="cav-detected-date">Detected: ${new Date(c.detectedAt).toLocaleDateString()}</span>
                                            ${c.advertisingChannels?.length ? `
                                                <div class="cav-comp-channels">
                                                    ${c.advertisingChannels.slice(0, 3).map(ch => `<span class="cav-channel-badge">${ch}</span>`).join('')}
                                                </div>
                                            ` : ''}
                                        </div>
                                        <div class="cav-comp-actions">
                                            <button class="cav-btn cav-btn-primary cav-btn-small" data-action="analyze-competitor-url" data-domain="${c.domain}">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Analyze
                                            </button>
                                            <button class="cav-btn cav-btn-secondary cav-btn-small" data-action="view-in-crm" data-name="${c.name}">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>CRM
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Configured Competitors -->
                    <div class="cav-comp-section">
                        <h3>⚙️ Configured Competitors</h3>
                        <div class="cav-comp-list">
                            ${configuredCompetitors.length === 0 ? `
                                <div class="cav-empty-state">
                                    <p>No competitors manually configured</p>
                                    <p>Analyze URLs to auto-detect competitors or click "Add Competitor"</p>
                                </div>
                            ` : configuredCompetitors.map(c => `
                                <div class="cav-comp-card" data-id="${c.id}">
                                    <div class="cav-comp-info">
                                        <h3>${c.name}</h3>
                                        <span class="cav-comp-domain">${c.domain}</span>
                                        <span class="cav-comp-freq">Monitor: ${c.monitoringFrequency}</span>
                                    </div>
                                    <div class="cav-comp-actions">
                                        <button class="cav-btn cav-btn-primary" data-action="analyze-competitor" data-id="${c.id}">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Analyze Ads
                                        </button>
                                        ${c.lastChecked ? `<span class="cav-last-check">Last: ${new Date(c.lastChecked).toLocaleDateString()}</span>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- CRM Companies marked as Competitors -->
                    ${crmCompetitors.length > 0 ? `
                        <div class="cav-comp-section">
                            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>From CRM</h3>
                            <div class="cav-comp-list">
                                ${crmCompetitors.map(c => `
                                    <div class="cav-comp-card cav-comp-crm" data-id="${c.id}">
                                        <div class="cav-comp-info">
                                            <h3>${c.name}</h3>
                                            <span class="cav-comp-domain">${c.domain || c.website || 'No domain'}</span>
                                            ${c.industry ? `<span class="cav-comp-industry">🏭 ${c.industry}</span>` : ''}
                                        </div>
                                        <div class="cav-comp-actions">
                                            <button class="cav-btn cav-btn-primary cav-btn-small" data-action="analyze-competitor-url" data-domain="${c.domain || new URL(c.website || 'https://example.com').hostname}">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Analyze
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div id="competitor-analysis-results"></div>
                </div>
            `;
        }

        attachEventHandlers(container) {
            // Action card navigation
            container.querySelectorAll('.cav-action-card[data-view]').forEach(card => {
                card.addEventListener('click', (e) => {
                    const view = card.dataset.view;
                    if (view) {
                        this.currentView = view;
                        this.render(container);
                    }
                });
            });
            
            // Quick pill navigation
            container.querySelectorAll('.cav-quick-pill[data-view]').forEach(pill => {
                pill.addEventListener('click', (e) => {
                    const view = pill.dataset.view;
                    if (view) {
                        this.currentView = view;
                        this.render(container);
                    }
                });
            });
            
            // Module tab navigation (new style)
            container.querySelectorAll('.cav-module-tab[data-view]').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const view = tab.dataset.view;
                    if (view) {
                        this.currentView = view;
                        this.render(container);
                    }
                });
            });
            
            // Legacy tab navigation (keep for backwards compatibility)
            container.querySelectorAll('.cav-learn-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    this.currentView = e.target.dataset.view;
                    this.render(container);
                });
            });

            // URL Analyzer
            container.querySelector('#analyze-url')?.addEventListener('click', async () => {
                const urlInput = container.querySelector('#url-input');
                const url = urlInput?.value?.trim();
                if (!url) return;

                const resultsDiv = container.querySelector('#url-analysis-results');
                resultsDiv.innerHTML = '<div class="cav-loading">⏳ Analyzing URL...</div>';

                try {
                    const result = await this.analyzeURL(url, this.comparisonImage);
                    resultsDiv.innerHTML = this.renderURLAnalysisResult(result);
                    this.attachURLResultHandlers(container, result);
                } catch (error) {
                    resultsDiv.innerHTML = `<div class="cav-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Analysis failed: ${error.message}</div>`;
                }
            });
            
            // Image Comparison - Select from library
            container.querySelector('#select-comparison-image')?.addEventListener('click', () => {
                this.showAssetPicker((asset) => {
                    this.comparisonImage = asset;
                    this.updateComparisonPreview(container, asset);
                });
            });
            
            // Image Comparison - Upload
            container.querySelector('#upload-comparison-image')?.addEventListener('click', () => {
                container.querySelector('#comparison-image-upload')?.click();
            });
            
            container.querySelector('#comparison-image-upload')?.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const asset = {
                            id: `upload_${Date.now()}`,
                            filename: file.name,
                            thumbnail_url: event.target.result,
                            dataUrl: event.target.result,
                            width: 0,
                            height: 0,
                            file_type: 'image'
                        };
                        
                        // Get dimensions from image
                        const img = new Image();
                        img.onload = () => {
                            asset.width = img.width;
                            asset.height = img.height;
                            this.comparisonImage = asset;
                            this.updateComparisonPreview(container, asset);
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Clear comparison image
            container.querySelector('#clear-comparison-image')?.addEventListener('click', () => {
                this.comparisonImage = null;
                container.querySelector('#selected-comparison-image').style.display = 'none';
            });

            // Update best practices
            container.querySelector('#update-best-practices')?.addEventListener('click', async (e) => {
                e.target.disabled = true;
                e.target.textContent = '⏳ Updating...';
                
                await this.updateBestPractices();
                
                e.target.disabled = false;
                e.target.textContent = '🔄 Update from Web';
                this.render(container);
            });

            // Update benchmarks
            container.querySelector('#update-benchmarks')?.addEventListener('click', async (e) => {
                e.target.disabled = true;
                e.target.textContent = '⏳ Updating...';
                
                await this.updateBenchmarks();
                
                e.target.disabled = false;
                e.target.textContent = '🔄 Update Benchmarks';
                this.render(container);
            });
            
            // Save benchmarks to CRM
            container.querySelector('#save-benchmarks-to-crm')?.addEventListener('click', () => {
                this.showSaveBenchmarksToCRMModal(container);
            });

            // Save custom benchmark
            container.querySelector('#save-custom-benchmark')?.addEventListener('click', () => {
                const metric = container.querySelector('#custom-metric')?.value;
                const low = parseFloat(container.querySelector('#custom-low')?.value);
                const median = parseFloat(container.querySelector('#custom-median')?.value);
                const high = parseFloat(container.querySelector('#custom-high')?.value);

                if (metric && !isNaN(median)) {
                    this.saveBenchmark({
                        id: `bench_${Date.now()}`,
                        metric,
                        platform: 'all',
                        value: { low: low || median * 0.5, median, high: high || median * 1.5 },
                        source: 'user-input',
                        lastUpdated: new Date().toISOString()
                    });
                    this.render(container);
                }
            });

            // Analyze competitor
            container.querySelectorAll('[data-action="analyze-competitor"]').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const competitorId = e.target.dataset.id;
                    const resultsDiv = container.querySelector('#competitor-analysis-results');
                    resultsDiv.innerHTML = '<div class="cav-loading">⏳ Analyzing competitor ads...</div>';

                    try {
                        const result = await this.analyzeCompetitorAds(competitorId);
                        resultsDiv.innerHTML = this.renderCompetitorAnalysisResult(result);
                    } catch (error) {
                        resultsDiv.innerHTML = `<div class="cav-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Analysis failed: ${error.message}</div>`;
                    }
                });
            });

            // Delete swipe entry
            container.querySelectorAll('[data-action="delete-swipe"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm('Delete this swipe file entry?')) {
                        this.deleteSwipeEntry(e.target.dataset.id);
                        this.render(container);
                    }
                });
            });
            
            // View swipe entry details
            container.querySelectorAll('[data-action="view-swipe"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = e.target.dataset.id;
                    const entry = this.swipeFile.find(s => s.id === id);
                    if (entry) {
                        this.showSwipeDetailModal(entry);
                    }
                });
            });
            
            // View in CRM
            container.querySelectorAll('[data-action="view-in-crm"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const companyId = e.target.dataset.id;
                    if (companyId && window.cavCRM) {
                        const company = window.cavCRM.getCompany(companyId);
                        if (company) {
                            // Trigger the CRM company detail view
                            if (window.cavCRM.showCompanyDetail) {
                                window.cavCRM.showCompanyDetail(window.cavCRM, companyId, document.body);
                            } else {
                                alert(`Company: ${company.name}\nAssets: ${company.linkedAssets?.length || 0}\nAnalyses: ${company.analyses?.length || 0}`);
                            }
                        }
                    }
                });
            });

            // Filter swipe file
            container.querySelector('#swipe-search')?.addEventListener('input', (e) => {
                this.filterSwipeFile(container, { search: e.target.value });
            });

            // Filter best practices
            container.querySelector('#bp-category')?.addEventListener('change', () => this.filterBestPractices(container));
            container.querySelector('#bp-platform')?.addEventListener('change', () => this.filterBestPractices(container));
            container.querySelector('#bp-search')?.addEventListener('input', () => this.filterBestPractices(container));
        }

        // Show swipe entry detail modal
        showSwipeDetailModal(entry) {
            const modal = document.createElement('div');
            modal.className = 'cav-modal-overlay';
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 100000; display: flex; align-items: center; justify-content: center;';
            
            const analysis = entry.analysis || {};
            const creativeSummary = analysis.creativeSummary || {};
            const hookAnalysis = analysis.hookAnalysis || {};
            const ctaEvaluation = analysis.ctaEvaluation || {};
            const takeaways = analysis.takeaways || [];
            
            modal.innerHTML = `
                <div class="cav-modal" style="max-width: 800px; max-height: 90vh; overflow: hidden; background: #1a1a1a; border-radius: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.08);">
                    <div class="cav-modal-header" style="padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; background: #252525;">
                        <h2 style="margin: 0; font-size: 1.25rem; color: #fff; font-weight: 600;">📁 Swipe File Entry</h2>
                        <button class="cav-modal-close" style="background: transparent; border: 1px solid rgba(255,255,255,0.08); color: #71717a; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; font-size: 1.25rem; transition: all 0.2s;">×</button>
                    </div>
                    <div class="cav-modal-body" style="padding: 2rem; overflow-y: auto; max-height: calc(90vh - 100px);">
                        <!-- Entry Header -->
                        <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem;">
                            <div style="flex-shrink: 0;">
                                ${entry.thumbnailData ? 
                                  `<img src="${entry.thumbnailData}" alt="Swipe" style="width: 200px; height: 150px; object-fit: cover; border-radius: 12px;">` :
                                  `<div style="width: 200px; height: 150px; background: #252525; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 3rem; border: 1px solid rgba(255,255,255,0.08);">
                                      ${entry.urlType === 'video' ? '🎬' : entry.urlType === 'landing_page' ? '🌐' : '📷'}
                                  </div>`}
                            </div>
                            <div style="flex: 1;">
                                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
                                    ${entry.savedBy === 'auto' ? '<span style="background: rgba(16,185,129,0.15); color: #10b981; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">🤖 Auto-saved</span>' : ''}
                                    ${entry.isCompetitor ? '<span style="background: rgba(249,115,22,0.15); color: #f97316; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">👀 Competitor</span>' : ''}
                                    <span style="background: rgba(236,72,153,0.15); color: #f472b6; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${entry.urlType?.replace(/_/g, ' ') || 'Unknown'}</span>
                                </div>
                                ${entry.sourceUrl ? `<p style="margin: 0.5rem 0;"><a href="${entry.sourceUrl}" target="_blank" style="color: #ec4899; text-decoration: none;">${entry.sourceUrl}</a></p>` : ''}
                                <p style="margin: 0.5rem 0; color: #71717a; font-size: 0.85rem;">Saved: ${new Date(entry.savedAt).toLocaleString()}</p>
                                ${entry.linkedCompanyId ? `<p style="margin: 0.5rem 0; color: #10b981; font-size: 0.85rem;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Linked to CRM</p>` : ''}
                            </div>
                        </div>
                        
                        <!-- Analysis Sections -->
                        ${creativeSummary.keyMessage ? `
                            <div style="background: #252525; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.08);">
                                <h3 style="margin: 0 0 0.75rem; color: #fff; font-size: 1rem; font-weight: 600;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.9V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.1A7 7 0 0 1 12 2z"/></svg>Key Message</h3>
                                <p style="margin: 0; color: #a1a1aa;">${creativeSummary.keyMessage}</p>
                            </div>
                        ` : ''}
                        
                        ${hookAnalysis.score ? `
                            <div style="background: #252525; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.08);">
                                <h3 style="margin: 0 0 0.75rem; color: #fff; font-size: 1rem; font-weight: 600;">🎣 Hook Analysis</h3>
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                                    <span style="font-size: 1.75rem; font-weight: 700; color: ${hookAnalysis.score >= 70 ? '#10b981' : hookAnalysis.score >= 50 ? '#f59e0b' : '#ef4444'};">${hookAnalysis.score}/100</span>
                                    <span style="color: #71717a;">${hookAnalysis.technique || ''}</span>
                                </div>
                                ${hookAnalysis.explanation ? `<p style="margin: 0; color: #a1a1aa; font-size: 0.9rem;">${hookAnalysis.explanation}</p>` : ''}
                            </div>
                        ` : ''}
                        
                        ${ctaEvaluation.type ? `
                            <div style="background: #252525; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.08);">
                                <h3 style="margin: 0 0 0.75rem; color: #fff; font-size: 1rem; font-weight: 600;">📢 CTA Evaluation</h3>
                                <p style="margin: 0 0 0.5rem; color: #e5e5e5;"><strong>Type:</strong> ${ctaEvaluation.type}</p>
                                ${ctaEvaluation.text ? `<p style="margin: 0 0 0.5rem; color: #10b981;"><strong>CTA:</strong> "${ctaEvaluation.text}"</p>` : ''}
                                ${ctaEvaluation.effectiveness ? `<p style="margin: 0; color: #71717a; font-size: 0.9rem;">${ctaEvaluation.effectiveness}</p>` : ''}
                            </div>
                        ` : ''}
                        
                        ${takeaways.length > 0 ? `
                            <div style="background: #252525; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.08);">
                                <h3 style="margin: 0 0 0.75rem; color: #fff; font-size: 1rem; font-weight: 600;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>Key Takeaways</h3>
                                <ul style="margin: 0; padding-left: 1.25rem; color: #a1a1aa;">
                                    ${takeaways.map(t => `<li style="margin-bottom: 0.35rem;">${t}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${entry.tags?.length > 0 ? `
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                                ${entry.tags.filter(Boolean).map(t => `<span style="background: rgba(236,72,153,0.15); color: #f472b6; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${t}</span>`).join('')}
                            </div>
                        ` : ''}
                        
                        ${entry.notes ? `
                            <div style="margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.08);">
                                <h3 style="margin: 0 0 0.75rem; color: #fff; font-size: 1rem; font-weight: 600;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Notes</h3>
                                <p style="margin: 0; color: #71717a; font-style: italic;">${entry.notes}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('.cav-modal-close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        }

        // Get assets from ALL storage locations
        async getAllAssets() {
            // Method 1: window.cavValidatorApp
            if (window.cavValidatorApp?.state?.assets?.length > 0) {
                return window.cavValidatorApp.state.assets;
            }
            
            // Method 2: window.cavApp
            if (window.cavApp?.state?.assets?.length > 0) {
                return window.cavApp.state.assets;
            }
            
            // Method 3: IndexedDB via storage
            if (window.cavApp?.storage?.getAssets) {
                try {
                    const dbAssets = await window.cavApp.storage.getAssets();
                    if (dbAssets?.length > 0) return dbAssets;
                } catch (e) { /* continue */ }
            }
            
            // Method 4: localStorage search
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.includes('cav_') && key.includes('asset')) {
                    try {
                        const parsed = JSON.parse(localStorage.getItem(key));
                        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                    } catch (e) { /* continue */ }
                }
            }
            
            return [];
        }

        async showAssetPicker(callback) {
            const assets = await this.getAllAssets();
            
            const modal = document.createElement('div');
            modal.className = 'cav-modal-overlay';
            modal.innerHTML = `
                <div class="cav-modal">
                    <div class="cav-modal-header">
                        <h2>Select Asset to Compare</h2>
                        <button class="cav-modal-close">&times;</button>
                    </div>
                    <div class="cav-modal-body">
                        <div class="cav-asset-grid">
                            ${assets.length === 0 ? '<p>No assets in library. Upload an asset first.</p>' :
                              assets.slice(0, 50).map(a => {
                                const thumbSrc = a.thumbnail_url || a.thumbnail || a.dataUrl || a.video_url || '';
                                return `
                                <div class="cav-asset-option" data-asset-id="${a.id}">
                                    ${thumbSrc ? 
                                      `<img src="${thumbSrc}" alt="${a.filename}" onerror="this.style.display='none'; this.parentElement.querySelector('.no-thumb')?.style.removeProperty('display')">` : 
                                      ''}<div class="no-thumb" ${thumbSrc ? 'style="display:none"' : ''}>📷</div>
                                    <span>${a.filename}</span>
                                    <span class="cav-asset-size">${a.width || 0}×${a.height || 0}</span>
                                </div>
                            `}).join('')}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('.cav-modal-close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

            modal.querySelectorAll('.cav-asset-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    const asset = assets.find(a => a.id === opt.dataset.assetId);
                    if (asset && callback) callback(asset);
                    modal.remove();
                });
            });
        }
        
        // Save benchmarks to CRM modal
        showSaveBenchmarksToCRMModal(container) {
            if (!this.benchmarks.length) {
                alert('No benchmarks to save. Analyze a URL first to extract benchmarks.');
                return;
            }
            
            const companies = window.cavCRM ? Object.values(window.cavCRM.companies || {}) : [];
            
            const modal = document.createElement('div');
            modal.className = 'cav-modal-overlay';
            modal.innerHTML = `
                <div class="cav-modal" style="max-width: 500px;">
                    <div class="cav-modal-header">
                        <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;vertical-align:middle;"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>Save Benchmarks to CRM</h2>
                        <button class="cav-modal-close">&times;</button>
                    </div>
                    <div class="cav-modal-body">
                        <p class="cav-hint">${this.benchmarks.length} benchmarks will be saved to the selected company.</p>
                        
                        <div class="cav-form-group">
                            <label>Select Company:</label>
                            <select id="benchmark-company-select" class="cav-select">
                                <option value="">-- Select Company --</option>
                                ${companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                <option value="new">➕ Create New Company</option>
                            </select>
                        </div>
                        
                        <div id="new-company-fields" style="display: none;">
                            <div class="cav-form-group">
                                <label>Company Name:</label>
                                <input type="text" id="new-company-name" class="cav-input" placeholder="Enter company name">
                            </div>
                            <div class="cav-form-group">
                                <label>Industry:</label>
                                <input type="text" id="new-company-industry" class="cav-input" placeholder="e.g., Technology, Retail">
                            </div>
                        </div>
                    </div>
                    <div class="cav-modal-footer">
                        <button class="cav-btn cav-btn-secondary" id="cancel-save">Cancel</button>
                        <button class="cav-btn cav-btn-primary" id="confirm-save-benchmarks"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>Save to CRM</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Toggle new company fields
            const companySelect = modal.querySelector('#benchmark-company-select');
            const newCompanyFields = modal.querySelector('#new-company-fields');
            
            companySelect.addEventListener('change', () => {
                newCompanyFields.style.display = companySelect.value === 'new' ? 'block' : 'none';
            });
            
            // Close handlers
            modal.querySelector('.cav-modal-close').addEventListener('click', () => modal.remove());
            modal.querySelector('#cancel-save').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
            
            // Save handler
            modal.querySelector('#confirm-save-benchmarks').addEventListener('click', () => {
                let companyId = companySelect.value;
                
                if (companyId === 'new') {
                    const newName = modal.querySelector('#new-company-name').value;
                    const industry = modal.querySelector('#new-company-industry').value;
                    
                    if (!newName) {
                        alert('Please enter a company name');
                        return;
                    }
                    
                    if (window.cavCRM?.createCompany) {
                        const newCompany = window.cavCRM.createCompany({
                            name: newName,
                            industry: industry,
                            type: 'client',
                            status: 'active'
                        });
                        companyId = newCompany.id;
                    }
                }
                
                if (!companyId) {
                    alert('Please select a company');
                    return;
                }
                
                // Save benchmarks to company
                if (window.cavCRM) {
                    const company = window.cavCRM.getCompany(companyId);
                    if (company) {
                        if (!company.benchmarks) company.benchmarks = [];
                        company.benchmarks.push({
                            savedAt: new Date().toISOString(),
                            data: this.benchmarks
                        });
                        window.cavCRM.updateCompany(companyId, { benchmarks: company.benchmarks });
                        
                        // Log activity
                        window.cavCRM.logActivity('benchmarks_saved', {
                            companyId: companyId,
                            count: this.benchmarks.length
                        });
                    }
                }
                
                modal.remove();
                alert(`${this.benchmarks.length} benchmarks saved to CRM!`);
            });
        }

        renderURLAnalysisResult(result) {
            if (result.error) {
                return `<div class="cav-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>${result.error}</div>`;
            }

            return `
                <div class="cav-url-result">
                    <div class="cav-url-result-header">
                        <h3>Analysis Complete</h3>
                        <span class="cav-url-type-badge">${result.urlType?.replace(/_/g, ' ')}</span>
                        <button class="cav-btn cav-btn-secondary" id="compare-with-creative" data-url="${result.url}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>Compare with Creative
                        </button>
                        <button class="cav-btn cav-btn-primary" id="save-to-swipe" data-url="${result.url}">
                            💾 Save to Swipe File
                        </button>
                    </div>
                    
                    ${result.creativeSummary ? `
                        <div class="cav-result-section">
                            <h4>Creative Summary</h4>
                            <p><strong>Product:</strong> ${result.creativeSummary.product}</p>
                            <p><strong>Key Message:</strong> ${result.creativeSummary.keyMessage}</p>
                            <p><strong>Target Audience:</strong> ${result.creativeSummary.targetAudience}</p>
                        </div>
                    ` : ''}
                    
                    ${result.hookAnalysis ? `
                        <div class="cav-result-section">
                            <h4>Hook Analysis</h4>
                            <div class="cav-score-inline">Score: <strong>${result.hookAnalysis.score}/100</strong></div>
                            <p><strong>Element:</strong> ${result.hookAnalysis.element}</p>
                            <p>${result.hookAnalysis.effectiveness}</p>
                        </div>
                    ` : ''}
                    
                    ${result.ctaEvaluation ? `
                        <div class="cav-result-section">
                            <h4>CTA Evaluation</h4>
                            <p><strong>CTA:</strong> ${result.ctaEvaluation.text || 'None detected'}</p>
                            <p>Clarity: ${result.ctaEvaluation.clarity}/100 | Urgency: ${result.ctaEvaluation.urgency}/100</p>
                        </div>
                    ` : ''}
                    
                    ${result.takeaways?.length ? `
                        <div class="cav-result-section">
                            <h4>Key Takeaways</h4>
                            <ul>
                                ${result.takeaways.map(t => `<li>${t}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${result.comparisonResult && !result.comparisonResult.error ? `
                        <div class="cav-comparison-results">
                            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>Creative Comparison Results</h3>
                            <div class="cav-comparison-score">
                                <div class="cav-big-score ${result.comparisonResult.overallScore >= 70 ? 'good' : result.comparisonResult.overallScore >= 50 ? 'medium' : 'low'}">
                                    ${result.comparisonResult.overallScore}
                                </div>
                                <span>Overall Competitive Score</span>
                            </div>
                            
                            ${result.comparisonResult.strengths?.length ? `
                                <div class="cav-comparison-section cav-strengths">
                                    <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Your Strengths</h4>
                                    <ul>
                                        ${result.comparisonResult.strengths.map(s => `<li>${s}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            ${result.comparisonResult.improvements?.length ? `
                                <div class="cav-comparison-section cav-improvements">
                                    <h4><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right:6px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>Areas for Improvement</h4>
                                    <ul>
                                        ${result.comparisonResult.improvements.map(i => `<li>${i}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            ${result.comparisonResult.detailedComparison ? `
                                <div class="cav-detailed-comparison">
                                    <h4>Detailed Breakdown</h4>
                                    <div class="cav-comparison-grid">
                                        ${Object.entries(result.comparisonResult.detailedComparison).map(([key, val]) => `
                                            <div class="cav-comparison-item">
                                                <span class="cav-comparison-label">${key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <div class="cav-comparison-bar">
                                                    <div class="cav-comparison-fill ${val.score >= 70 ? 'good' : val.score >= 50 ? 'medium' : 'low'}" style="width: ${val.score}%"></div>
                                                    <span>${val.score}/100</span>
                                                </div>
                                                <p class="cav-comparison-notes">${val.notes}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        attachURLResultHandlers(container, result) {
            container.querySelector('#save-to-swipe')?.addEventListener('click', () => {
                this.saveToSwipeFile({
                    source: 'url',
                    sourceUrl: result.url,
                    analysis: result,
                    tags: [result.urlType],
                    notes: result.creativeSummary?.keyMessage || ''
                });
                
                alert('Saved to Swipe File!');
            });
        }

        renderCompetitorAnalysisResult(result) {
            if (result.error) {
                return `<div class="cav-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>${result.error}</div>`;
            }

            return `
                <div class="cav-competitor-result">
                    <h3>Competitor Analysis: ${result.competitorName}</h3>
                    
                    ${result.insights ? `
                        <div class="cav-comp-insights">
                            ${result.insights.advertisingChannels?.length ? `
                                <div class="cav-insight-section">
                                    <h4>Advertising Channels</h4>
                                    <div class="cav-tags">${result.insights.advertisingChannels.map(c => `<span class="cav-tag">${c}</span>`).join('')}</div>
                                </div>
                            ` : ''}
                            
                            ${result.insights.messageThemes?.length ? `
                                <div class="cav-insight-section">
                                    <h4>Message Themes</h4>
                                    <ul>${result.insights.messageThemes.map(t => `<li>${t}</li>`).join('')}</ul>
                                </div>
                            ` : ''}
                            
                            ${result.insights.opportunities?.length ? `
                                <div class="cav-insight-section cav-opportunities">
                                    <h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="margin-right:4px;vertical-align:middle;"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.9V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.1A7 7 0 0 1 12 2z"/></svg>Opportunities</h4>
                                    <ul>${result.insights.opportunities.map(o => `<li>${o}</li>`).join('')}</ul>
                                </div>
                            ` : ''}
                            
                            ${result.insights.recommendations?.length ? `
                                <div class="cav-insight-section">
                                    <h4>Recommendations</h4>
                                    <ul>${result.insights.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
                                </div>
                            ` : ''}
                        </div>
                    ` : '<p>No insights available. Make sure SearchAPI is configured.</p>'}
                </div>
            `;
        }

        filterSwipeFile(container, filters) {
            // Re-render just the swipe grid
            const entries = this.getSwipeFile(filters);
            const grid = container.querySelector('.cav-swipe-grid');
            if (grid) {
                // Simplified re-render of entries
            }
        }

        filterBestPractices(container) {
            const category = container.querySelector('#bp-category')?.value;
            const platform = container.querySelector('#bp-platform')?.value;
            const search = container.querySelector('#bp-search')?.value;
            
            const practices = this.getBestPractices({ category, platform, search });
            // Re-render practices list
        }

        parseJSON(content) {
            if (!content) return null;
            const match = content.match(/```json\s*([\s\S]*?)\s*```/);
            try {
                return JSON.parse(match ? match[1] : content);
            } catch {
                return null;
            }
        }
    }

    // ============================================
    // COMPETITOR CREATIVE COMPARISON (AI Intelligence Engine Integration)
    // ============================================

    LearnModule.prototype.compareCreatives = async function(ourAsset, ourAnalysis, competitors = []) {
        console.log('[Learn] Starting competitor creative comparison...');
        
        const comparison = {
            ourAsset: {
                id: ourAsset.id,
                filename: ourAsset.filename,
                overallScore: ourAnalysis?.strategicSynthesis?.overallScore || ourAnalysis?.hookAnalysis?.overallScore,
                hookScore: ourAnalysis?.hookAnalysis?.overallScore || ourAnalysis?.strategicSynthesis?.hookAnalysis?.score,
                ctaScore: ourAnalysis?.ctaAnalysis?.overallEffectiveness || ourAnalysis?.strategicSynthesis?.ctaAudit?.score
            },
            competitors: [],
            differentiators: {
                ourStrengths: [],
                ourWeaknesses: [],
                competitorPatterns: [],
                opportunities: [],
                threats: []
            },
            recommendations: [],
            analyzedAt: new Date().toISOString()
        };

        const orchestrator = window.AIOrchestrator;
        
        // Fetch competitor ad data via SearchAPI
        if (orchestrator?.isProviderAvailable('searchapi')) {
            for (const competitor of competitors.slice(0, 5)) {
                try {
                    const query = `${competitor} advertising creative examples Facebook Google Ads 2024 2025`;
                    const results = await orchestrator.searchWeb(query, 'competitor_ads');
                    
                    comparison.competitors.push({
                        name: competitor,
                        adsFound: results?.results?.length || 0,
                        topAds: results?.results?.slice(0, 5).map(r => ({
                            title: r.title,
                            url: r.url,
                            snippet: r.snippet
                        })) || [],
                        platforms: this.extractPlatformsFromResults(results?.results || [])
                    });
                } catch (e) {
                    console.warn(`[Learn] Failed to fetch competitor ${competitor}:`, e);
                }
            }
        }

        // Generate SWOT analysis using Claude
        if (orchestrator?.isProviderAvailable('claude') && comparison.competitors.length > 0) {
            const swotPrompt = `Perform a SWOT analysis comparing our creative against competitors.

OUR CREATIVE ANALYSIS:
${JSON.stringify(ourAnalysis?.strategicSynthesis || ourAnalysis, null, 2)}

COMPETITOR RESEARCH:
${JSON.stringify(comparison.competitors, null, 2)}

Provide a detailed competitive analysis:

1. OUR STRENGTHS: What does our creative do better than typical competitor ads?
2. OUR WEAKNESSES: Where do competitors outperform us based on their messaging patterns?
3. COMPETITOR PATTERNS: What common approaches are competitors using?
4. OPPORTUNITIES: Market gaps we can exploit
5. THREATS: Competitor strengths we need to address

Also provide 5 specific, actionable recommendations to improve our competitive position.

Return ONLY valid JSON:
{
    "swot": {
        "strengths": ["Specific strength 1", "Specific strength 2"],
        "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
        "opportunities": ["Market opportunity 1", "Market opportunity 2"],
        "threats": ["Competitive threat 1", "Competitive threat 2"]
    },
    "competitorPatterns": [
        { "pattern": "Pattern name", "prevalence": "high|medium|low", "effectiveness": "high|medium|low" }
    ],
    "recommendations": [
        { "action": "Specific action", "impact": "high|medium|low", "effort": "high|medium|low", "rationale": "Why this matters" }
    ],
    "marketPositioning": {
        "currentPosition": "Description of where we stand",
        "targetPosition": "Where we should aim",
        "differentiator": "Our unique value proposition"
    }
}`;

            try {
                const result = await orchestrator.callClaude(swotPrompt, { temperature: 0.4 });
                const swotData = this.parseJSON(result.content);
                
                if (swotData) {
                    comparison.differentiators = {
                        ourStrengths: swotData.swot?.strengths || [],
                        ourWeaknesses: swotData.swot?.weaknesses || [],
                        competitorPatterns: swotData.competitorPatterns || [],
                        opportunities: swotData.swot?.opportunities || [],
                        threats: swotData.swot?.threats || []
                    };
                    comparison.recommendations = swotData.recommendations || [];
                    comparison.marketPositioning = swotData.marketPositioning;
                }
            } catch (e) {
                console.warn('[Learn] SWOT analysis failed:', e);
            }
        }

        // Save to history
        this.saveComparisonToHistory(comparison);

        return comparison;
    };

    LearnModule.prototype.extractPlatformsFromResults = function(results) {
        const platforms = new Set();
        results.forEach(r => {
            const text = (r.title + ' ' + r.snippet).toLowerCase();
            if (text.includes('facebook') || text.includes('meta')) platforms.add('Facebook');
            if (text.includes('instagram')) platforms.add('Instagram');
            if (text.includes('tiktok')) platforms.add('TikTok');
            if (text.includes('youtube')) platforms.add('YouTube');
            if (text.includes('linkedin')) platforms.add('LinkedIn');
            if (text.includes('google ads') || text.includes('display')) platforms.add('Google Ads');
            if (text.includes('twitter') || text.includes(' x ')) platforms.add('Twitter/X');
        });
        return Array.from(platforms);
    };

    LearnModule.prototype.saveComparisonToHistory = function(comparison) {
        try {
            const key = `${getLearnStoragePrefix()}competitor_comparisons`;
            const history = JSON.parse(localStorage.getItem(key) || '[]');
            history.unshift(comparison);
            if (history.length > 20) history.pop();
            localStorage.setItem(key, JSON.stringify(history));
        } catch (e) {
            console.warn('[Learn] Failed to save comparison:', e);
        }
    };

    LearnModule.prototype.getComparisonHistory = function() {
        try {
            const key = `${getLearnStoragePrefix()}competitor_comparisons`;
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch {
            return [];
        }
    };

    // ============================================
    // BENCHMARK INTEGRATION WITH AI ENGINE
    // ============================================

    LearnModule.prototype.getIndustryBenchmarks = async function(industry, platform = null) {
        const orchestrator = window.AIOrchestrator;
        if (!orchestrator?.isProviderAvailable('searchapi')) {
            return this.getBenchmark(null, platform); // Fallback to cached benchmarks
        }

        const query = platform 
            ? `${industry} ${platform} advertising benchmarks CTR CPM engagement 2024 2025`
            : `${industry} advertising benchmarks CTR CPM engagement rate 2024 2025`;

        try {
            const results = await orchestrator.searchWeb(query, 'benchmark_research');
            
            const benchmarks = {
                industry,
                platform,
                ctr: { average: null, good: null, excellent: null },
                cpm: { low: null, average: null, high: null },
                engagementRate: { average: null, good: null },
                sources: [],
                fetchedAt: new Date().toISOString()
            };

            // Extract numeric benchmarks from search results
            results?.results?.forEach(r => {
                const text = (r.snippet || '') + ' ' + (r.title || '');
                
                // CTR extraction
                const ctrMatch = text.match(/(\d+\.?\d*)%?\s*(?:CTR|click.through)/i);
                if (ctrMatch && !benchmarks.ctr.average) {
                    benchmarks.ctr.average = parseFloat(ctrMatch[1]);
                }
                
                // CPM extraction
                const cpmMatch = text.match(/\$?(\d+\.?\d*)\s*CPM/i);
                if (cpmMatch && !benchmarks.cpm.average) {
                    benchmarks.cpm.average = parseFloat(cpmMatch[1]);
                }

                // Engagement rate
                const engMatch = text.match(/(\d+\.?\d*)%?\s*engagement/i);
                if (engMatch && !benchmarks.engagementRate.average) {
                    benchmarks.engagementRate.average = parseFloat(engMatch[1]);
                }

                benchmarks.sources.push({
                    title: r.title,
                    url: r.url
                });
            });

            // Cache these benchmarks
            this.cacheBenchmark(industry, platform, benchmarks);

            return benchmarks;

        } catch (e) {
            console.warn('[Learn] Benchmark fetch failed:', e);
            return this.getBenchmark(null, platform);
        }
    };

    LearnModule.prototype.cacheBenchmark = function(industry, platform, benchmarks) {
        try {
            const key = `${getLearnStoragePrefix()}benchmark_${industry}_${platform || 'all'}`;
            localStorage.setItem(key, JSON.stringify(benchmarks));
        } catch (e) {
            // Cache full, continue
        }
    };

    // ============================================
    // LEGAL/COMPLIANCE FLAGS
    // ============================================

    LearnModule.prototype.checkComplianceRequirements = async function(asset, analysis) {
        const orchestrator = window.AIOrchestrator;
        if (!orchestrator?.isProviderAvailable('claude')) {
            return { available: false, message: 'Claude not configured for compliance check' };
        }

        const prompt = `Analyze this creative asset for advertising compliance requirements.

Visual Elements Detected:
${JSON.stringify(analysis?.visualExtraction || {}, null, 2)}

Check for:
1. **Disclaimer Requirements**: Does this need disclaimers? (testimonials, results claims, financial products, healthcare, alcohol, gambling)
2. **Testimonial Disclosures**: If there's a testimonial, does it need "Results not typical" or similar?
3. **Platform Policy Risks**: Any elements that might violate Meta, Google, TikTok, or LinkedIn ad policies?
4. **Legal Considerations**: Trademark usage, copyright concerns, model release needs?
5. **Industry-Specific**: FDA, FTC, SEC, or other regulatory considerations?

Return ONLY valid JSON:
{
    "overallRisk": "low|medium|high",
    "disclaimerNeeded": true,
    "disclaimerType": ["results_claim", "testimonial"],
    "suggestedDisclaimer": "Results may vary. Individual results not guaranteed.",
    "platformRisks": [
        { "platform": "Meta", "risk": "low|medium|high", "issue": "Description", "recommendation": "Action" }
    ],
    "legalConsiderations": [],
    "industryRegulations": [],
    "recommendations": ["Action 1", "Action 2"]
}`;

        try {
            const result = await orchestrator.callClaude(prompt, { temperature: 0.2 });
            return this.parseJSON(result.content);
        } catch (e) {
            console.warn('[Learn] Compliance check failed:', e);
            return { available: false, error: e.message };
        }
    };

    // ============================================
    // INITIALIZE & EXPORT
    // ============================================

    const learnModule = new LearnModule();

    window.CAVLearn = {
        module: learnModule,
        render: (container) => learnModule.render(container),
        analyzeURL: (url) => learnModule.analyzeURL(url),
        analyzeCompetitorAds: (competitorId) => learnModule.analyzeCompetitorAds(competitorId),
        updateBestPractices: () => learnModule.updateBestPractices(),
        updateBenchmarks: () => learnModule.updateBenchmarks(),
        saveToSwipeFile: (entry) => learnModule.saveToSwipeFile(entry),
        getSwipeFile: (filters) => learnModule.getSwipeFile(filters),
        getBestPractices: (filters) => learnModule.getBestPractices(filters),
        getBenchmark: (metric, platform) => learnModule.getBenchmark(metric, platform),
        checkLandingPageSync: (asset, url) => learnModule.checkLandingPageSync(asset, url),
        
        // Competitor detection
        autoFetchCompetitors: (brandName, industry) => learnModule.autoFetchCompetitors(brandName, industry),
        reinitialize: () => learnModule.reinitialize(),
        
        // NEW: Competitor Creative Comparison
        compareCreatives: (asset, analysis, competitors) => learnModule.compareCreatives(asset, analysis, competitors),
        getComparisonHistory: () => learnModule.getComparisonHistory(),
        
        // NEW: Industry Benchmarks with AI
        getIndustryBenchmarks: (industry, platform) => learnModule.getIndustryBenchmarks(industry, platform),
        
        // NEW: Compliance Checking
        checkCompliance: (asset, analysis) => learnModule.checkComplianceRequirements(asset, analysis)
    };

    console.log(`📚 Learn Module loaded - Version ${LEARN_VERSION}`);
    console.log('   Features: URL Analyzer, Swipe File, Best Practices, Benchmarks, Competitors');
    console.log('   v3.0.7: Auto-save, benchmark extraction, competitor detection, CRM linking');
    console.log('   v4.0: Competitor creative comparison, industry benchmarks, compliance checking');

})();

