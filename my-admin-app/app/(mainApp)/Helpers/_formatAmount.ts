import { convertToMillimes } from "./_convertToMillimes";

    // Helper function to format amount for display
    export const formatAmount = (value: number): string => {
        const totalMillimes = convertToMillimes(value);
        const dinars = Math.floor(totalMillimes / 100);
        const millimes = totalMillimes % 100;
        return `${dinars}.${millimes.toString().padStart(3, '0')} DT`;
    };