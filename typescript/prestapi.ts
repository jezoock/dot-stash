
const params = ['filter', 'display', 'sort', 'limit', 'schema', 'id_shop', 'id_group_shop', 'query', 'language'];


class prestAPI {
  key: string;
  base64_key: string;
  apiRoot: string;

  constructor(options: { key: string; url: string; }) {
    const { key, url } = options;
    this.key = key;
    this.base64_key = btoa(key + ':');
    this.apiRoot = url;
  }

  
  req = async (opt) => {
    const { url, ...options } = opt;
    return await fetch(url, options)
  };

  exec = async (opt) => {
    const res = await this.req(opt);
    const {status, body} = res;
    const response = {
      status,
      content: null,
      headers: null,
    }
    if (body) {
      response.content = await res.json();
    }
    console.log(response);
    return response;
  };

  buildQuery = (opt) => {
    let url_params = {};
    let query = '';
    for(let param of params) {
      for(let [key, _] of Object.entries(opt)) {
        if(key === param || key.includes(param)) {
          url_params[key] = opt[key];
        }
      }
    }
    if(Object.entries(url_params).length > 0) {
      query = `&${new URLSearchParams(url_params).toString()}`;
    }

    console.log(new URLSearchParams(url_params).values())

    return query;
  };

  buildRoute = (opt) => {
    return `${this.apiRoot}/api/${opt['ressource']}${opt['id'] ? `/${opt['id']}` : ''}`;
  }
  buildUrl = (opt) => {
    return `${this.buildRoute(opt)}?ws_key=${this.key}&output_format=JSON${this.buildQuery(opt)}`;
  }

  delete = async (opt) => {
    let url = this.buildUrl(opt);
    let req = await this.exec({
      url,
      method: 'DELETE',
      headers: {
        Expect: '100-continue'
      }
    });

    return req/* .response */
  };

  put = async (opt) => {
    let url = this.buildUrl(opt);
    let body = opt['body'];
    let req = await this.exec({
      url,
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + this.base64_key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    return JSON.parse(req['response'])
  };

  head = async (opt) => {
    let url = this.buildUrl(opt);
    let req = await this.exec({
      url,
      method: 'HEAD',
      headers: {
        'Authorization': 'Basic ' + this.base64_key,
        'Content-Type': 'application/json'
      }
    });

    return req/* .response */
  };

  get = async (opt) => {
    let url = this.buildUrl(opt);

    console.log(url);
    let req = await this.exec({
      url,
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Authorization': 'Basic ' + this.base64_key,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;application/json',
      }
    });

    return req
  };

  post = async (opt) => {
    let url = this.buildUrl(opt);
    let body = opt['body'];
    let req = await this.exec({
      url,
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + this.base64_key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    return JSON.parse(req['response'])
  };
}

export default prestAPI;
