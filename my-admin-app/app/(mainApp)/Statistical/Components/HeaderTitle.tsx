import React from 'react'

const HeaderTitle = ({ mainTitle, subTitle, count }: { mainTitle: string, subTitle?: string, count?: number | null }) => {
    return (
        <div className="bg-white border-b border-gray-200 shadow-sm mb-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                {mainTitle} {count ? (count) : ''}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                {subTitle}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeaderTitle