const env = {
  currentEnv: 'beta'
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
    backendURL: 'https://dev-api.sciencebase.gov/sciencecache-service',
    googleClientId: '106633728735-rg42fv648mjjp9pvpk93b9d6l9jkhnuv.apps.googleusercontent.com',
    production: false,
    debug: true
}
