import { Routes, Route, useLocation } from 'react-router-dom';
import { Frame, Navigation, Banner } from '@shopify/polaris';
import { useEffect, useState } from 'react';
import {
    HomeIcon,
    ProductIcon,
    DiscountIcon,
    MegaphoneIcon,
    StarIcon,
} from '@shopify/polaris-icons';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import PromosPage from './pages/PromosPage';
import CampaignsPage from './pages/CampaignsPage';
import ReviewsPage from './pages/ReviewsPage';

function App() {
    const [shop, setShop] = useState(null);
    const [noShop, setNoShop] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Get shop from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        let shopDomain = urlParams.get('shop');

        if (shopDomain) {
            localStorage.setItem('shopify_shop', shopDomain);
            setShop(shopDomain);
        } else {
            shopDomain = localStorage.getItem('shopify_shop');
            if (shopDomain) {
                setShop(shopDomain);
            } else {
                setNoShop(true);
            }
        }
    }, []);
    const navigationMarkup = (
        <Navigation location={location.pathname}>
            <Navigation.Section
                items={[
                    {
                        url: '/',
                        label: 'Dashboard',
                        icon: HomeIcon,
                    },
                    {
                        url: '/products',
                        label: 'Products',
                        icon: ProductIcon,
                    },
                    {
                        url: '/promos',
                        label: 'Promos',
                        icon: DiscountIcon,
                    },
                    {
                        url: '/campaigns',
                        label: 'Campaigns',
                        icon: MegaphoneIcon,
                    },
                    {
                        url: '/reviews',
                        label: 'Reviews',
                        icon: StarIcon,
                    },
                ]}
            />
        </Navigation>
    );

    return (
        <Frame navigation={navigationMarkup}>
            {noShop && (
                <div style={{ padding: '16px' }}>
                    <Banner status="warning" title="No shop connected">
                        <p>Please install the app from your Shopify admin or use the auth link:</p>
                        <p><a href={`${import.meta.env.VITE_API_URL}auth?shop=reviu-4.myshopify.com`}>
                            Click here to authenticate
                        </a></p>
                    </Banner>
                </div>
            )}
            {shop && (
                <div style={{ padding: '8px 16px', background: '#f0fdf4', borderBottom: '1px solid #16a34a' }}>
                    Connected to: <strong>{shop}</strong>
                </div>
            )}
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/promos" element={<PromosPage />} />
                <Route path="/campaigns" element={<CampaignsPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
            </Routes>
        </Frame>
    );
}

export default App;
