const isEnabled = (value) =>
    String(value || '')
        .trim()
        .toLowerCase() === 'true';
const customerExperienceEnabled =
    isEnabled(process.env.REACT_APP_CUSTOMER_OTP_LOGIN) && isEnabled(process.env.REACT_APP_RC_SESSION);

// Experimental flows are opt-in at build time. This avoids a source-code edit
// (and an accidental partial launch) when a feature is enabled for production.
const features = {
    customerOtpLogin: customerExperienceEnabled,
    rcSession: customerExperienceEnabled,
    managerSessionControls: isEnabled(process.env.REACT_APP_MANAGER_SESSION_CONTROLS)
};

export default features;
