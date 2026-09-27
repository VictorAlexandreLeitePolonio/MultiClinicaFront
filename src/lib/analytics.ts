interface ModuleClickParameters {
  area: 'clinic' | 'patient';
  module_name: string;
  module_path: string;
  navigation_location: 'sidebar' | 'bottom_navigation';
}

declare global {
  interface Window {
    gtag?: (command: 'event', name: 'module_click', parameters: ModuleClickParameters) => void;
  }
}

export function trackModuleClick(
  href: string,
  label: string,
  location: ModuleClickParameters['navigation_location'] = 'sidebar',
) {
  if (typeof window === 'undefined') return;

  const root = href.split('/')[1];
  if (root !== 'app' && root !== 'paciente') return;

  window.gtag?.('event', 'module_click', {
    area: root === 'app' ? 'clinic' : 'patient',
    module_name: label,
    module_path: href,
    navigation_location: location,
  });
}
