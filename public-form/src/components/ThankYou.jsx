function ThankYou({ promoCode }) {
    const copyCode = () => {
        navigator.clipboard.writeText(promoCode);
        alert('Promo code copied to clipboard!');
    };

    return (
        <div className="thank-you-container">
            <div className="success-icon">🎉</div>
            <h1>Thank You!</h1>
            <p>Your review has been submitted successfully.</p>

            <div className="promo-section">
                <p>Here's your promo code:</p>
                <div className="promo-code" onClick={copyCode}>
                    <span>{promoCode}</span>
                    <button className="copy-btn">📋 Copy</button>
                </div>
                <p className="promo-note">Use this code at checkout for your discount!</p>
            </div>
        </div>
    );
}

export default ThankYou;
