let nav_config = []

export async function getNavConfig() {
    if (nav_config.length === 0) {
        nav_config = await fetch('/docs/nav.json').then(v => v.json());
    }
    return nav_config;
}