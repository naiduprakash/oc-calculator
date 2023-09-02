import axios from 'axios';
let coockies = "";

// Create an instance of Axios
const instance = axios.create({
  baseURL: 'https://www.nseindia.com',
  // You can set default headers here
});

// Add a request interceptor
instance.interceptors.request.use(
  config => {
    console.log("Calling api:", config.baseURL, config.url);
    if (config.url !== "/" && coockies) {
      config.headers.Cookie = coockies;
    }
    // You can modify the request config here, such as adding headers
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  response => {
    // You can process successful responses here
    if (!coockies && response.headers["set-cookie"]) {
      coockies = response.headers["set-cookie"].join(";")
    }
    return response;
  },
  error => {
    coockies = "";
    // You can handle errors here, e.g., show notifications or redirect
    return Promise.reject(error);
  }
);

function api(config) {
  return instance(config)
}

export function root() {
  return api({
    method: "GET",
    url: "/",
    mode: 'cors',
  })
}

export function getOptionChainData(params) {
  return api({
    method: "GET",
    url: "/api/option-chain-indices",
    params,
    mode: 'cors',
  })
}

export function getOptionChainDataEquities(params) {
  return api({
    method: "GET",
    url: "/api/option-chain-equities",
    params
  })
}

export function getHistoricalFoCpv(params) {
  return api({
    method: "GET",
    url: "/api/historical/foCPV",
    params
  })
}


export function getHolidayMaster(params) {
  return api({
    method: "GET",
    url: "/api/holiday-master?type=trading",
    params
  })
}


