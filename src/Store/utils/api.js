import axios from 'axios';
import JSONbig from 'json-bigint';

const API_ROOT      = 'http://tecnosteam.dev/api/'; // MODIFY HERE
const axiosInstance = axios.create({
	baseURL: API_ROOT,
	headers: {
		'Accept'          : 'application/json',
		'X-Requested-With': 'XMLHttpRequest',
		'Authorization'   : 'Bearer [INSERT PASSPORT TOKEN HERE]', // MODIFY HERE
	},
	transformResponse(data) {
		return JSONbig.parse(data);
	},
});

function resolveURL(endpoint) {
	while (endpoint.startsWith('/'))
		endpoint = endpoint.substr(1, endpoint.length - 1);
	return API_ROOT + endpoint;
}

export default {
	get(api_endpoint, request) {
		return axiosInstance.get(resolveURL(api_endpoint), request)
		                    .then(response => Promise.resolve(response))
		                    .catch(error => Promise.reject(error));
	},
	post(api_endpoint, request) {
		return axiosInstance.post(resolveURL(api_endpoint), request)
		                    .then(response => Promise.resolve(response))
		                    .catch(error => Promise.reject(error));
	},
	patch(api_endpoint, request) {
		return axiosInstance.post(resolveURL(api_endpoint), request)
		                    .then(response => Promise.resolve(response))
		                    .catch(error => Promise.reject(error));
	},
	delete(api_endpoint, request) {
		return axiosInstance.delete(resolveURL(api_endpoint), request)
		                    .then(response => Promise.resolve(response))
		                    .catch(error => Promise.reject(error));
	},
}
