import { useState, useEffect } from 'react';
import { getCampaign } from './services/api';
import ReviewForm from './components/ReviewForm';
import ThankYou from './components/ThankYou';
import './App.css';

function App() {
    const [campaign, setCampaign] = useState(null);
    const [promoCode, setPromoCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCampaign();
    }, []);

    const loadCampaign = async () => {
        try {
            // Get campaign ID from URL path: /review/:publicUrl
            const pathParts = window.location.pathname.split('/');
            const publicUrl = pathParts[pathParts.length - 1];

            if (!publicUrl || publicUrl === 'review') {
                setError('Invalid campaign link');
                setLoading(false);
                return;
            }

            const response = await getCampaign(publicUrl);
            setCampaign(response.data.campaign);
        } catch (err) {
            setError('Campaign not found or has ended');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (code) => {
        setPromoCode(code);
    };

    if (loading) {
        return (
            <div className="app-container">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-container">
                <div className="error-container">
                    <h1>Oops!</h1>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            {promoCode ? (
                <ThankYou promoCode={promoCode} />
            ) : (
                <ReviewForm campaign={campaign} onSuccess={handleSuccess} />
            )}
        </div>
    );
}

export default App;
