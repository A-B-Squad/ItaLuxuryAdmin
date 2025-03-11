import { Package, SimpleStats } from "@/app/types";
import moment from "moment-timezone";

const DEFAULT_TIMEZONE = "Africa/Tunis";
const DELIVERY_PRICE = 8;
const EXCLUDED_STATUSES = ['REFUNDED', 'BACK', 'CANCELLED'];

export const calculateSimpleStats = (packages: Package[]): SimpleStats => {
    const stats: SimpleStats = {
        orders: [0, 0, 0, 0, 0],
        earnings: [0, 0, 0, 0, 0],
    };

    const now = moment().tz(DEFAULT_TIMEZONE);
    const startOfToday = now.clone().startOf('day');
    const startOfYesterday = startOfToday.clone().subtract(1, 'day');
    const endOfYesterday = startOfYesterday.clone().endOf('day');
    const startOfWeek = now.clone().startOf('isoWeek');
    const startOfMonth = now.clone().startOf('month');
    const startOfYear = now.clone().startOf('year');

    packages.forEach((pkg) => {
        // Skip excluded statuses
        if (EXCLUDED_STATUSES.includes(pkg.status)) return;

        const packageDate = moment.tz(parseInt(pkg.createdAt), DEFAULT_TIMEZONE);
        if (!packageDate.isSameOrAfter(startOfYear)) return;

        const earningsAfterDelivery = pkg.Checkout.freeDelivery
            ? pkg.Checkout.total
            : pkg.Checkout.total - DELIVERY_PRICE;

        // Today
        if (packageDate.isSameOrAfter(startOfToday)) {
            stats.orders[0]++;
            stats.earnings[0] += earningsAfterDelivery;
        }
        
        // Yesterday
        if (packageDate.isBetween(startOfYesterday, endOfYesterday, 'day', '[]')) {
            stats.orders[1]++;
            stats.earnings[1] += earningsAfterDelivery;
        }

        // This Week
        if (packageDate.isSameOrAfter(startOfWeek)) {
            stats.orders[2]++;
            stats.earnings[2] += earningsAfterDelivery;
        }

        // This Month
        if (packageDate.isSameOrAfter(startOfMonth)) {
            stats.orders[3]++;
            stats.earnings[3] += earningsAfterDelivery;
        }

        // This Year
        stats.orders[4]++;
        stats.earnings[4] += earningsAfterDelivery;
    });

    return stats;
};