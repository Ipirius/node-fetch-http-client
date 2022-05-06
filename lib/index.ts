import omit from 'lodash.omit'
import fetch from 'node-fetch'
import { URLSearchParams } from 'url'

const methods = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  patch: 'PATCH',
  delete: 'DELETE',
}

type RequestOptionsType = {
  headers?: Record<string, any>,
  json?: boolean,
  fullResponse?: boolean
}

interface PostOptionsType extends RequestOptionsType {
  body?: Record<string, any>
  params?: Record<string, any>
  url: string
}

type PutOptionsType = PostOptionsType
type PatchOptionsType = PostOptionsType

interface GetOptionsType extends RequestOptionsType {
  url: string,
    params?: Record<string, any>,
}

type DeleteOptionsType = GetOptionsType

type ResponseTypes = 'json' | 'text' | 'blob' | 'stream' // can be extended if necessary

// TODO: add typed response like { result, success, error }
class HttpClient {
  /** Http Client */
  /** Perform http request
   * @param {String} url - url address to send request to (must contain query string and params if needed)
   * @param {Object} opts
   * @param {Object} [opts.headers] - http request headers
   * @param {Boolean} [opts.json] - indicates if body (for POST PUT) is a json, so the proper headers are set
   * @param {String} [type] - needed response type (ex: json, text) defaults to 'json'
   * @param {Boolean} [opts.fullResponse] - indicates if full response object is needed, defaults to false
   * @returns {Promise<{*}>}
   */
  async request(url: string, opts: RequestOptionsType & { method: string }, type?: ResponseTypes): Promise<any> {
    const options = {
      ...opts,
      ...(opts.headers && {
        headers: {
          ...(opts.json && {
            'Content-Type': 'application/json',
          }),
          ...opts.headers,
        },
      }),
    }
    const res = await fetch(url, options)
    if (type === 'stream') {
      return opts.fullResponse ? { ...res, data: res } : res
    }
    const data = await res[type || 'json']()
    return opts.fullResponse ? { ...res, data } : data
  }

  /** Perform post http request
   * @param {Object} opts
   * @param {String} opts.url - url address to send request to
   * @param {Object} [opts.params] - request params
   * @param {Object|String} [opts.body] - request body
   * @param {Object} [opts.headers] - http request headers
   * @param {Boolean} [opts.json] - indicates if body is a json
   * @param {String} [type] - needed response type (ex: json, text) defaults to 'json'
   * @param {Boolean} [opts.fullResponse] - indicates if full response object is needed, defaults to false
   * @returns {Promise}
   */
  async post(opts: PostOptionsType, type?: ResponseTypes): Promise<any> {
    return this.request(
      opts.url,
      {
        ...omit(opts, ['url', 'params']),
        ...(opts.params && { body: new URLSearchParams(opts.params) }),
        ...(opts.body &&
          opts.json && { body: JSON.stringify(opts.body) }),
        method: methods.post,
      },
      type,
    )
  }

  /** Perform get http request
   * @param {Object} opts
   * @param {String} opts.url - url address to send request to
   * @param {Object} [opts.params] - request search params
   * @param {Object} [opts.headers] - http request headers
   * @param {String} [type] - needed response type (ex: json, text) defaults to 'json'
   * @param {Boolean} [opts.fullResponse] - indicates if full response object is needed, defaults to false
   * @returns {Promise<{*}>}
   */
  async get(opts: GetOptionsType, type?: ResponseTypes): Promise<any> {
    const qs = new URLSearchParams(opts.params)
    return this.request(
      `${opts.url}?${qs.toString()}`,
      {
        ...omit(opts, ['url']),
        json: false,
        method: methods.get,
      },
      type,
    )
  }

  /** Perform put http request
   * @param {Object} opts
   * @param {String} opts.url - url address to send request to
   * @param {Object} [opts.params] - request params
   * @param {Object|String} [opts.body] - request body
   * @param {Object} [opts.headers] - http request headers
   * @param {Boolean} [opts.json] - indicates if body is a json
   * @param {String} [type] - needed response type (ex: json, text) defaults to 'json'
   * @param {Boolean} [opts.fullResponse] - indicates if full response object is needed, defaults to false
   * @returns {Promise<{*}>}
   */
  async put(opts: PutOptionsType, type: ResponseTypes): Promise<any> {
    return this.request(
      opts.url,
      {
        ...omit(opts, ['url', 'params']),
        ...(opts.params && { body: new URLSearchParams(opts.params) }),
        ...(opts.body &&
          opts.json && { body: JSON.stringify(opts.body) }),
        method: methods.put,
      },
      type,
    )
  }

  /** Perform patch http request
   * @param {Object} opts
   * @param {String} opts.url - url address to send request to
   * @param {Object} [opts.params] - request params
   * @param {Object|String} [opts.body] - request body
   * @param {Object} [opts.headers] - http request headers
   * @param {Boolean} [opts.json] - indicates if body is a json
   * @param {String} [type] - needed response type (ex: json, text) defaults to 'json'
   * @param {Boolean} [opts.fullResponse] - indicates if full response object is needed, defaults to false
   * @returns {Promise<{*}>}
   */
  async patch(opts: PatchOptionsType, type: ResponseTypes): Promise<any> {
    return this.request(
      opts.url,
      {
        ...omit(opts, ['url', 'params']),
        ...(opts.params && { body: new URLSearchParams(opts.params) }),
        ...(opts.body &&
          opts.json && { body: JSON.stringify(opts.body) }),
        method: methods.patch,
      },
      type,
    )
  }

  /** Perform delete http request
   * @param {Object} opts
   * @param {String} opts.url - url address to send request to
   * @param {Object} [opts.params] - request search params
   * @param {Object} [opts.headers] - http request headers
   * @param {String} [type] - needed response type (ex: json, text) defaults to 'json'
   * @param {Boolean} [opts.fullResponse] - indicates if full response object is needed, defaults to false
   * @returns {Promise<{*}>}
   */
  async delete(opts: DeleteOptionsType, type: ResponseTypes): Promise<any> {
    const qs = new URLSearchParams(opts.params)
    return this.request(
      `${opts.url}?${qs.toString()}`,
      {
        ...omit(opts, ['url']),
        method: methods.delete,
      },
      type,
    )
  }
}

export default new HttpClient()
