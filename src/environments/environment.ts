const env = {
  currentEnv: 'dev'
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
    serviceUrl: 'https://ede.cr.usgs.gov/sciencecache-service',
    googleClientId: '106633728735-rg42fv648mjjp9pvpk93b9d6l9jkhnuv.apps.googleusercontent.com',
    // serviceUrl: 'http://localhost:8000',
    production: false,
    debug: true
}


