// Helper function to convert Tunisian format to millimes
export const convertToMillimes = (value: number): number => {
    // Multiply by 1000 to convert dinars to millimes
    // Example: 2.500 * 1000 = 2500 millimes
    return Math.round(value * 100
        
    );
};