// MaintenancePhotoAnalyzer.jsx - AI-powered photo analysis for maintenance requests
const MaintenancePhotoAnalyzer = ({ onAnalysisComplete, category = 'general', property, unit }) => {
    const [photos, setPhotos] = React.useState([]);
    const [analyzing, setAnalyzing] = React.useState(false);
    const [analysis, setAnalysis] = React.useState(null);
    const [error, setError] = React.useState(null);
    const fileInputRef = React.useRef(null);
    const cameraInputRef = React.useRef(null);

    // Initialize Gemini Vision Service
    const visionService = React.useMemo(() => {
        return new (window.GeminiVisionService || window.MockGeminiVisionService)();
    }, []);

    // Handle file selection
    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        processFiles(files);
    };

    // Process selected files
    const processFiles = async (files) => {
        const validFiles = files.filter(file => 
            file.type.startsWith('image/') && file.size < 10 * 1024 * 1024 // 10MB limit
        );

        if (validFiles.length === 0) {
            setError('Please select valid image files (max 10MB each)');
            return;
        }

        const newPhotos = await Promise.all(
            validFiles.map(async (file) => {
                const base64 = await fileToBase64(file);
                return {
                    id: Date.now() + Math.random(),
                    file,
                    url: URL.createObjectURL(file),
                    base64: base64.split(',')[1], // Remove data:image/jpeg;base64, prefix
                    mimeType: file.type,
                    name: file.name,
                    size: file.size,
                    timestamp: new Date().toISOString()
                };
            })
        );

        setPhotos(prev => [...prev, ...newPhotos]);
        setError(null);
    };

    // Convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    // Remove photo
    const removePhoto = (photoId) => {
        setPhotos(prev => {
            const photo = prev.find(p => p.id === photoId);
            if (photo) {
                URL.revokeObjectURL(photo.url);
            }
            return prev.filter(p => p.id !== photoId);
        });
    };

    // Analyze photos with Gemini Vision
    const analyzePhotos = async () => {
        if (photos.length === 0) {
            setError('Please add at least one photo to analyze');
            return;
        }

        setAnalyzing(true);
        setError(null);

        try {
            const context = {
                category,
                property,
                unit,
                description: document.getElementById('issue-description')?.value || ''
            };

            let result;
            if (photos.length === 1) {
                result = await visionService.analyzeMaintenancePhoto(photos[0], context);
            } else {
                result = await visionService.analyzeMultiplePhotos(photos, context);
            }

            setAnalysis(result.analysis);
            
            // Notify parent component
            if (onAnalysisComplete) {
                onAnalysisComplete({
                    photos: photos.map(p => ({
                        id: p.id,
                        name: p.name,
                        size: p.size,
                        url: p.url
                    })),
                    analysis: result.analysis
                });
            }
        } catch (error) {
            console.error('Error analyzing photos:', error);
            setError('Failed to analyze photos. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    // Clean up URLs on unmount
    React.useEffect(() => {
        return () => {
            photos.forEach(photo => URL.revokeObjectURL(photo.url));
        };
    }, []);

    return React.createElement('div', { className: 'maintenance-photo-analyzer' }, [
        // Upload Section
        React.createElement('div', { key: 'upload', className: 'photo-upload-section' }, [
            React.createElement('h3', { key: 'title' }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-camera' }),
                ' Add Photos'
            ]),
            React.createElement('p', { key: 'desc', className: 'upload-description' }, 
                'Upload photos to help us better understand the issue. Our AI will analyze them instantly.'
            ),
            
            // Upload buttons
            React.createElement('div', { key: 'buttons', className: 'upload-buttons' }, [
                React.createElement('button', {
                    key: 'upload',
                    className: 'btn btn-secondary',
                    onClick: () => fileInputRef.current?.click()
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-upload' }),
                    ' Upload Photos'
                ]),
                React.createElement('button', {
                    key: 'camera',
                    className: 'btn btn-secondary',
                    onClick: () => cameraInputRef.current?.click()
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-camera' }),
                    ' Take Photo'
                ])
            ]),

            // Hidden file inputs
            React.createElement('input', {
                key: 'file-input',
                ref: fileInputRef,
                type: 'file',
                accept: 'image/*',
                multiple: true,
                style: { display: 'none' },
                onChange: handleFileSelect
            }),
            React.createElement('input', {
                key: 'camera-input',
                ref: cameraInputRef,
                type: 'file',
                accept: 'image/*',
                capture: 'environment',
                style: { display: 'none' },
                onChange: handleFileSelect
            })
        ]),

        // Photo Grid
        photos.length > 0 && React.createElement('div', { key: 'grid', className: 'photo-grid' }, 
            photos.map(photo =>
                React.createElement('div', { key: photo.id, className: 'photo-item' }, [
                    React.createElement('img', {
                        key: 'img',
                        src: photo.url,
                        alt: photo.name
                    }),
                    React.createElement('button', {
                        key: 'remove',
                        className: 'remove-photo',
                        onClick: () => removePhoto(photo.id)
                    }, React.createElement('i', { className: 'fas fa-times' })),
                    React.createElement('div', { key: 'info', className: 'photo-info' }, 
                        `${(photo.size / 1024).toFixed(1)} KB`
                    )
                ])
            )
        ),

        // Analyze Button
        photos.length > 0 && !analysis && React.createElement('button', {
            key: 'analyze',
            className: 'btn btn-primary analyze-btn',
            onClick: analyzePhotos,
            disabled: analyzing
        }, analyzing ? [
            React.createElement('i', { key: 'spinner', className: 'fas fa-spinner fa-spin' }),
            ' Analyzing...'
        ] : [
            React.createElement('i', { key: 'icon', className: 'fas fa-brain' }),
            ' Analyze Photos with AI'
        ]),

        // Analysis Results
        analysis && React.createElement('div', { key: 'results', className: 'analysis-results' }, [
            React.createElement('div', { key: 'header', className: 'results-header' }, [
                React.createElement('h4', { key: 'title' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-clipboard-check' }),
                    ' AI Analysis Complete'
                ]),
                React.createElement('button', {
                    key: 'close',
                    className: 'close-results',
                    onClick: () => {
                        setAnalysis(null);
                        setPhotos([]);
                    }
                }, 'Start Over')
            ]),

            // Severity Badge
            React.createElement('div', { key: 'severity', className: 'severity-section' }, [
                React.createElement('span', { key: 'label', className: 'severity-label' }, 'Severity:'),
                React.createElement('span', { 
                    key: 'badge',
                    className: `severity-badge ${analysis.severity.toLowerCase()}`
                }, analysis.severity),
                analysis.safetyHazard && React.createElement('span', { 
                    key: 'safety',
                    className: 'safety-warning'
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-exclamation-triangle' }),
                    ' Safety Hazard Detected'
                ])
            ]),

            // Issue Description
            React.createElement('div', { key: 'issue', className: 'issue-section' }, [
                React.createElement('h5', { key: 'title' }, 'Issue Identified'),
                React.createElement('p', { key: 'text' }, analysis.issue)
            ]),

            // Repair Details
            React.createElement('div', { key: 'repair', className: 'repair-section' }, [
                React.createElement('h5', { key: 'title' }, 'Repair Information'),
                React.createElement('div', { key: 'details', className: 'repair-details' }, [
                    React.createElement('div', { key: 'type', className: 'detail-item' }, [
                        React.createElement('span', { key: 'label', className: 'detail-label' }, 'Type:'),
                        React.createElement('span', { key: 'value' }, analysis.repairType)
                    ]),
                    React.createElement('div', { key: 'time', className: 'detail-item' }, [
                        React.createElement('span', { key: 'label', className: 'detail-label' }, 'Time:'),
                        React.createElement('span', { key: 'value' }, analysis.estimatedTime)
                    ]),
                    React.createElement('div', { key: 'vendor', className: 'detail-item' }, [
                        React.createElement('span', { key: 'label', className: 'detail-label' }, 'Vendor:'),
                        React.createElement('span', { key: 'value' }, 
                            analysis.vendorType.charAt(0).toUpperCase() + analysis.vendorType.slice(1)
                        )
                    ])
                ])
            ]),

            // Cost Estimate
            React.createElement('div', { key: 'cost', className: 'cost-section' }, [
                React.createElement('h5', { key: 'title' }, 'Estimated Cost'),
                React.createElement('div', { key: 'range', className: 'cost-range' }, 
                    `$${analysis.costRange.min} - $${analysis.costRange.max}`
                )
            ]),

            // Prevention Tips
            analysis.preventionTips && React.createElement('div', { key: 'tips', className: 'prevention-section' }, [
                React.createElement('h5', { key: 'title' }, 'Prevention Tips'),
                React.createElement('ul', { key: 'list' }, 
                    analysis.preventionTips.map((tip, index) =>
                        React.createElement('li', { key: index }, tip)
                    )
                )
            ])
        ]),

        // Error Message
        error && React.createElement('div', { key: 'error', className: 'error-message' }, [
            React.createElement('i', { key: 'icon', className: 'fas fa-exclamation-circle' }),
            ' ',
            error
        ])
    ]);
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.MaintenancePhotoAnalyzer = MaintenancePhotoAnalyzer;