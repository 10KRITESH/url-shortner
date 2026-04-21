import { UAParser } from 'ua-parser-js';

export const parseUserAgent = (userAgentString) => {
    const parser = new UAParser(userAgentString);
    const result = parser.getResult();

    // Determine device type
    let device = 'desktop';
    const deviceType = result.device?.type;
    if (deviceType === 'mobile') device = 'mobile';
    else if (deviceType === 'tablet') device = 'tablet';

    // Get browser name
    const browser = result.browser?.name || 'Unknown';

    return { device, browser };
};
