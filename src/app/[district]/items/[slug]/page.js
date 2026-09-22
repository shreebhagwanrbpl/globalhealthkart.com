import ProductDetails from "../../../items/[slug]/ProductDetails";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }) {
    const { slug, district } = await params;

    return (
        <ProductDetails
            slug={slug}
            district={district}
        />
    );
}