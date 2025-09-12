import React from 'react'
import AnimatedCounter from '@/app/(mainApp)/Hook/AnimatedCounter';
interface StatusCardData {
    title: string;
    count: number;
    icon: React.ReactElement;
    color: string;

}

const StatusCards = ({ statusCards }: any) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
            {statusCards.map((card: StatusCardData, index: number) => (
                <div
                    key={index}
                    className={`bg-white border-l-4 ${card.color.replace('bg-', 'border-')} shadow-md p-4 rounded-lg`}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-dashboard-neutral-800 font-semibold text-sm">{card.title}</h3>
                        <div className={`${card.color} p-2 rounded-full text-white`}>
                            {card.icon}
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-end justify-between">
                            <p className="text-2xl font-bold text-dashboard-neutral-900">
                                <AnimatedCounter from={0} to={card.count} />
                            </p>
                            <span className="text-xs font-medium text-dashboard-neutral-500">unités</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>)
}

export default StatusCards