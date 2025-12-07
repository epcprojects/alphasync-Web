// Environment validation utility
export const validateActionCableConfig = () => {
  const cableEndpoint = process.env.NEXT_PUBLIC_CABLE_ENDPOINT;
  
  if (!cableEndpoint) {
    console.warn(
      "⚠️ NEXT_PUBLIC_CABLE_ENDPOINT is not defined. " +
      "ActionCable integration will not work properly. " +
      "Please add NEXT_PUBLIC_CABLE_ENDPOINT to your .env.local file."
    );
    return false;
  }

  if (!cableEndpoint.includes("cable")) {
    console.warn(
      "⚠️ NEXT_PUBLIC_CABLE_ENDPOINT should include '/cable' in the URL. " +
      "Current value: " + cableEndpoint
    );
  }

  console.log("✅ ActionCable configuration validated:", cableEndpoint);
  return true;
};

// Call validation on module load (only in browser)
if (typeof window !== "undefined") {
  validateActionCableConfig();
}
