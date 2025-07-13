// AIListingGenerator.jsx - One-click AI listing creation
const AIListingGenerator = ({ unit, property }) => {
    const [listing, setListing] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [editMode, setEditMode] = React.useState(false);
    const [customDetails, setCustomDetails] = React.useState({
        highlights: [],
        nearby: [],
        special_features: []
    });
    
    const generateListing = async () => {
        setLoading(true);
        try {
            const response = await window.ApiService.post('/api/ai/generate-listing', {
                unit: unit,
                property: property,
                custom_details: customDetails,
                style: 'engaging_seo_optimized'
            });
            
            setListing(response.listing);
            
            // Track AI generation success
            await window.ApiService.post('/api/ai/track-listing', {
                unit_id: unit.id,
                ai_generated: true,
                edited: false
            });
            
        } catch (error) {
            window.Toast.error('Failed to generate listing');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="ai-listing-generator">
            <div className="generator-header">
                <h2>AI Listing Generator</h2>
                <p className="ai-badge">
                    <i className="fas fa-magic"></i>
                    91% of our listings need zero edits
                </p>
            </div>
            
            {!listing ? (
                <div className="listing-setup">
                    <div className="quick-details">
                        <h3>Quick Details for AI</h3>
                        <div className="detail-chips">
                            <h4>Highlights (click to add)</h4>
                            <div className="chip-options">
                                {['Newly Renovated', 'Pet Friendly', 'Parking Included', 'Balcony', 
                                  'In-Unit Laundry', 'Hardwood Floors', 'Natural Light'].map(feature => (
                                    <button 
                                        key={feature}
                                        className={`chip ${customDetails.highlights.includes(feature) ? 'selected' : ''}`}
                                        onClick={() => {
                                            setCustomDetails(prev => ({
                                                ...prev,
                                                highlights: prev.highlights.includes(feature)
                                                    ? prev.highlights.filter(h => h !== feature)
                                                    : [...prev.highlights, feature]
                                            }));
                                        }}
                                    >
                                        {feature}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="detail-chips">
                            <h4>Nearby Attractions</h4>
                            <input
                                type="text"
                                placeholder="e.g., 5 min to subway, near Central Park..."
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && e.target.value) {
                                        setCustomDetails(prev => ({
                                            ...prev,
                                            nearby: [...prev.nearby, e.target.value]
                                        }));
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <div className="added-items">
                                {customDetails.nearby.map((item, idx) => (
                                    <span key={idx} className="chip">{item}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        className="generate-btn"
                        onClick={generateListing}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                AI is writing your listing...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-magic"></i>
                                Generate SEO-Optimized Listing
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="listing-preview">
                    <div className="preview-header">
                        <h3>AI-Generated Listing</h3>
                        <div className="preview-actions">
                            <button 
                                className="edit-btn"
                                onClick={() => setEditMode(!editMode)}
                            >
                                <i className="fas fa-edit"></i>
                                {editMode ? 'Preview' : 'Edit'}
                            </button>
                            <button 
                                className="publish-btn"
                                onClick={async () => {
                                    await window.ApiService.post('/api/listings/publish', {
                                        unit_id: unit.id,
                                        content: listing
                                    });
                                    window.Toast.success('Listing published!');
                                }}
                            >
                                <i className="fas fa-rocket"></i>
                                Publish Listing
                            </button>
                        </div>
                    </div>
                    
                    <div className="listing-content">
                        {editMode ? (
                            <textarea
                                value={listing.description}
                                onChange={(e) => setListing({...listing, description: e.target.value})}
                                rows={15}
                            />
                        ) : (
                            <>
                                <h1>{listing.title}</h1>
                                <div className="listing-highlights">
                                    {listing.highlights?.map((highlight, idx) => (
                                        <span key={idx} className="highlight-badge">
                                            <i className="fas fa-check"></i>
                                            {highlight}
                                        </span>
                                    ))}
                                </div>
                                <div className="listing-description">
                                    {listing.description}
                                </div>
                                <div className="seo-keywords">
                                    <h4>SEO Keywords Included:</h4>
                                    <div className="keyword-tags">
                                        {listing.seo_keywords?.map((keyword, idx) => (
                                            <span key={idx} className="keyword-tag">{keyword}</span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Register component
window.AppModules = window.AppModules || {};
window.AppModules.AIListingGenerator = AIListingGenerator;