import React from 'react'
import UpdateProduct from './UpdateProduct';

type CreateProductPageProps = {
  params: { slug: string };
}

const CreateProductPage = async ({ params }: CreateProductPageProps) => {
  const slug = params.slug;
  return (
    <UpdateProduct
      slug={slug}
    />
  )
}

export default CreateProductPage