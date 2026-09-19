export const en = {
  langName: 'English',
  nav: {
    home: 'Home',
    report: 'Report issue',
    track: 'Track requests',
    schemes: 'Schemes',
    waste: 'Waste',
    health: 'Health',
    emergency: 'Emergency',
    help: 'Help',
    dashboard: 'Dashboard',
    tickets: 'Tickets',
    wasteOps: 'Waste ops',
    citizenServices: 'Citizen services',
    officialConsole: 'Official console',
    allModules: 'All modules',
  },
  common: {
    signOut: 'Sign out',
    signedInAs: 'Signed in as',
    loading: 'Loading…',
    menu: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    language: 'Language',
    tryAgain: 'Try again',
    goHome: 'Go home',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error — check your connection and that the API is running.',
    unauthorized: 'Please sign in to continue.',
    forbidden: 'You do not have permission for this action.',
    validation: 'Please check the form and fix highlighted fields.',
    notFound: 'The requested resource was not found.',
  },
  login: {
    title: 'Sign in',
    demoHint: 'Demo OTP: 123456 — see Help for test phones.',
    mobile: 'Mobile number',
    otp: 'OTP',
    continue: 'Continue',
    signingIn: 'Signing in…',
    citizen: 'Citizen',
    official: 'Official',
    field: 'Field',
  },
  home: {
    eyebrow: 'Production-ready demo',
    title: 'One platform for citizens and government',
    citizenPortal: 'Citizen portal',
    officialConsole: 'Official console',
    trackRequests: 'Track requests',
  },
} as const;

type DeepStringMap<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringMap<T[K]>;
};

export type Messages = DeepStringMap<typeof en>;
