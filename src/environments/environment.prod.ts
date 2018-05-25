const env = {
  currentEnv: ''
}

export const environment = {
    title: 'ScienceCache App',
    logo_url: '',
    contact: {
        email: "",
        phone: "",
        mail: {
            name: "",
            secondary_name: null,
            streetAddressOne: "",
            streetAddressTwo: "",
            city: "",
            state: "",
            zip: ""
        }
    },
    owning_agency: '',
    VERSION: require('../../package.json').version + env.currentEnv,
    backendURL: 'https://www.sciencebase.gov/sciencecache-service',
    production: true,
    debug: false
}
