import axios from 'axios';
import JSONbig from 'json-bigint';

const API_ROOT      = 'http://tecnosteam.dev/api/';
const axiosInstance = axios.create({
	baseURL: API_ROOT,
	headers: {
		'Accept'          : 'application/json',
		'X-Requested-With': 'XMLHttpRequest',
		'Authorization'   : 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImY3NTYzMGYwMjY4OGM3MTk3NTUwYTFmMWMzMjE2OTY0NTQ1OGZiZGQ2ZTYzNDQwNzVhYmNhNTg1OTkyMjk5YzI2MGUwYTk2NDk1NGYxMTczIn0.eyJhdWQiOiIxIiwianRpIjoiZjc1NjMwZjAyNjg4YzcxOTc1NTBhMWYxYzMyMTY5NjQ1NDU4ZmJkZDZlNjM0NDA3NWFiY2E1ODU5OTIyOTljMjYwZTBhOTY0OTU0ZjExNzMiLCJpYXQiOjE1MTI1NDcxMjMsIm5iZiI6MTUxMjU0NzEyMywiZXhwIjoxNTQ0MDgzMTIzLCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.cQ2zXmidL1gRTvDTI2pYRSGMSLn7oZsgDx5XUi4bBfwvSPYtmdTFzXsSQ312SbOWlvSH6F1EJtsJsvO3D5bjwDNc_8mA44CQvfrzi6Oou1_SufWzjC6XTS2AyAPLGfbMq8a7CxirR8yi91IpdriZohliPXfkyCaBm1uhIA02Pcc9bNwVFj-g52s3FlxTWHcyROaZ_uu5aUDnzpX1RpYOMHwuELavedl6qSPy_JHoBNn20-wEM4prKWbMODmGcX_wlWCZCiLq7O5Nj3Dpyz6hHUgPBw-n5jL0gLe2Zb6XtvcAzvpoNVYqJGX7PAQQKD1BJuUuuTjbREHEnjpW8tO4p-EIfzRCSJRtc8aaCKfa3Trb0fPO6t6_KNmBvSjyB86c0qSmytH_FeVeRCvUkarvX-ncbSsQ22l0XnCEa4YI8E3MTdDDmFDoLKQwKFKCN0TpqV15P0jcUT3fU3Ve3xYaYLTKaBM4FgT2wUwxWIwHrefijV80jCie3bqnnApOMYhcZWN2rrF-szoMLu3z5R105QPmQIt20KvX6XLEOfekGmZnfsiUk3bl90ihaCdf6p_kGb8TJPcs2fe5tIGiysZTghK2KadKxgdN1zyhPPDXWXxyPVHAe4_iYw0UL5j_B_a0d_O8wyyyR3_Ka9mkbNbkefLZjnuMlNfrg669EZHtrZk',
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
