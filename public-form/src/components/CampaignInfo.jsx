function CampaignInfo({ campaign }) {
    return (
        <div className="campaign-info">
            <h2>{campaign.name}</h2>
            {campaign.shopDomain && (
                <p className="shop-name">from {campaign.shopDomain}</p>
            )}
        </div>
    );
}

export default CampaignInfo;
