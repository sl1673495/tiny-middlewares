const axios = config => {
  if (config.error) {
    return Promise.reject({
      error: 'error in axios',
    });
  } else {
    return Promise.resolve({
      ...config,
      result: config.result,
    });
  }
};

axios.interceptors = {
  request: [],
  response: [],
};

axios.useRequestInterceptor = (resolved?, rejected?) => {
  axios.interceptors.request.push({ resolved, rejected });
};

axios.useResponseInterceptor = (resolved?, rejected?) => {
  axios.interceptors.response.push({ resolved, rejected });
};

axios.run = config => {
  const chain = [
    {
      resolved: axios,
      rejected: undefined,
    },
  ];

  axios.interceptors.request.forEach(interceptor => {
    chain.unshift(interceptor);
  });

  axios.interceptors.response.forEach(interceptor => {
    chain.push(interceptor);
  });

  let promise = Promise.resolve(config);

  while (chain.length) {
    const { resolved, rejected } = chain.shift();
    promise = promise.then(resolved, rejected);
  }

  return promise;
};

axios.useRequestInterceptor(config => {
  return {
    ...config,
    extraParams1: 'extraParams1',
  };
});

axios.useRequestInterceptor(config => {
  return {
    ...config,
    extraParams2: 'extraParams2',
  };
});

axios.useResponseInterceptor(
  resp => {
    const { extraParams1, extraParams2, message } = resp;
    return `${extraParams1} ${extraParams2} ${message}`;
  },
  error => {
    console.log('error', error);
  },
);

(async function() {
  const result = await axios.run({
    message: 'message1',
  });
  console.log('result1: ', result);
})();

(async function() {
  const result = await axios.run({
    error: true,
  });
  console.log('result3: ', result);
})();
