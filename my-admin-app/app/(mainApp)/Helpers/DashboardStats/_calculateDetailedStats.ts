import { DetailedStats, Packages } from "@/app/types";
import moment from "moment-timezone";


const DEFAULT_TIMEZONE = "Africa/Tunis";
const EXCLUDED_STATUSES = ['REFUNDED', 'BACK', 'CANCELLED'];

export const calculateDetailedStats = (packages: Packages[]): DetailedStats => {
    const now = moment().tz(DEFAULT_TIMEZONE);
    const startOfDay = now.clone().startOf("day");
    const startOfWeek = now.clone().startOf("week");
    const startOfMonth = now.clone().startOf("month");
    const startOfYear = now.clone().startOf("year");

    return packages.reduce<DetailedStats>(
        (stats, pkg) => {
            const packageDate = moment.tz(parseInt(pkg.createdAt), DEFAULT_TIMEZONE);
            const total = pkg.Checkout.total;

            // Always track status counts for the year
            if (packageDate.isSameOrAfter(startOfYear)) {
                stats.byStatus[pkg.status] = (stats.byStatus[pkg.status] || 0) + 1;
            }

            // Skip excluded statuses for main stats
            if (EXCLUDED_STATUSES.includes(pkg.status)) return stats;

            if (packageDate.isSameOrAfter(startOfYear)) {
                if (packageDate.isSameOrAfter(startOfDay)) {
                    stats.today.count++;
                    stats.today.total += total;
                }
                if (packageDate.isSameOrAfter(startOfWeek)) {
                    stats.thisWeek.count++;
                    stats.thisWeek.total += total;
                }
                if (packageDate.isSameOrAfter(startOfMonth)) {
                    stats.thisMonth.count++;
                    stats.thisMonth.total += total;
                }
                stats.thisYear.count++;
                stats.thisYear.total += total;
            }

            return stats;
        },
        {
            today: { count: 0, total: 0 },
            thisWeek: { count: 0, total: 0 },
            thisMonth: { count: 0, total: 0 },
            thisYear: { count: 0, total: 0 },
            byStatus: {},
        }
    );
};