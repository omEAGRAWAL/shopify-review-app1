import { Page, Layout, LegacyCard, Text, BlockStack } from '@shopify/polaris';

function HomePage() {
    return (
        <Page title="Dashboard">
            <Layout>
                <Layout.Section>
                    <LegacyCard sectioned>
                        <BlockStack gap="400">
                            <Text variant="headingLg" as="h2">
                                Welcome to Review Incentive App
                            </Text>
                            <Text as="p" color="subdued">
                                Create campaigns to incentivize customer reviews with promo codes.
                            </Text>
                        </BlockStack>
                    </LegacyCard>
                </Layout.Section>

                <Layout.Section variant="oneThird">
                    <LegacyCard title="Quick Stats" sectioned>
                        <BlockStack gap="200">
                            <Text as="p">Total Campaigns: 0</Text>
                            <Text as="p">Total Reviews: 0</Text>
                            <Text as="p">Promo Codes Issued: 0</Text>
                        </BlockStack>
                    </LegacyCard>
                </Layout.Section>

                <Layout.Section variant="oneThird">
                    <LegacyCard title="Getting Started" sectioned>
                        <BlockStack gap="200">
                            <Text as="p">1. Create a promo code template</Text>
                            <Text as="p">2. Create a campaign</Text>
                            <Text as="p">3. Share the review form link</Text>
                        </BlockStack>
                    </LegacyCard>
                </Layout.Section>
            </Layout>
        </Page>
    );
}

export default HomePage;
