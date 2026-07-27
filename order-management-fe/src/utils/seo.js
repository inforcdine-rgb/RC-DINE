const ensureMeta = (selector, attributes) => {
    let element = document.head.querySelector(selector);
    if (!element) {
        element = document.createElement('meta');
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        document.head.appendChild(element);
    }
    return element;
};

export const setPageSeo = ({ title, description }) => {
    document.title = title;
    const desc = ensureMeta('meta[name="description"]', { name: 'description' });
    desc.setAttribute('content', description);

    const ogTitle = ensureMeta('meta[property="og:title"]', { property: 'og:title' });
    ogTitle.setAttribute('content', title);
    const ogDescription = ensureMeta('meta[property="og:description"]', { property: 'og:description' });
    ogDescription.setAttribute('content', description);
    const ogType = ensureMeta('meta[property="og:type"]', { property: 'og:type' });
    ogType.setAttribute('content', 'website');
};

export const SELECTED_PLAN_KEY = 'rcdine:selected-plan';

export const saveSelectedPlan = (plan) => {
    if (plan) localStorage.setItem(SELECTED_PLAN_KEY, String(plan).toUpperCase());
};

export const getSelectedPlan = () => localStorage.getItem(SELECTED_PLAN_KEY);
export const clearSelectedPlan = () => localStorage.removeItem(SELECTED_PLAN_KEY);
