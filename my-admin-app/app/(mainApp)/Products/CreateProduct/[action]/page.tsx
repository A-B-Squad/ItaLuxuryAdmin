import React from 'react'
import CreateProduct from './CreateProduct'

type CreateProductPageProps = {
  params: { action: string };
}

const CreateProductPage = async ({ params }: CreateProductPageProps) => {
    const  action = params.action;

    return (
        <CreateProduct
            action={action}
        />
    )
}

export default CreateProductPage