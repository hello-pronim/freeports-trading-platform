const messages = {
    /* eslint-disable */
    key_not_created: `You didn't created any certificate yet, please access to your profile page to generate one. Some action will fails if you have no valid key.`,
    missing_browser_key: `Your private key is missing in this browser. You might import or revoke your key from your profile page. Some action will fails if you have no valid key.`,
    key_mismatch: `Your private key don't correspond to the one defined to your profile on server. Using computer of another user is not recommended. Please login back with correct user or clear the private key from browser cache and import the correct one from your profile page.`
};

export default messages;
